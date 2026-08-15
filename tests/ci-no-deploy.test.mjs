import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const workflowsDirectory = resolve(repositoryRoot, ".github/workflows");

const deployCommandPatterns = [
  /\bwrangler(?:@[^\s"'`]+)?[^\n;&|]*\b(?:deploy|publish)\b/i,
  /\b(?:yarn|npm|pnpm|bun)(?:\s+run)?(?:\s+--?[^\s]+)*\s+(?:deploy|publish)(?::[a-z0-9_.-]+)?\b/i,
  /\bcloudflare[^\n;&|]*\b(?:deploy|publish)\b/i,
  /\b(?:make|just)\s+[^\n;&|]*\b(?:deploy|publish)\b/i,
  /\b(?:bash|sh|node)\s+[^\n;&|]*(?:^|\/)(?:deploy|publish)[\w.-]*/im,
  /(?:^|[\s;&|])\.{0,2}\/(?:[\w.-]+\/)*(?:deploy|publish)[\w.-]*(?=$|[\s;&|])/im,
];

function linesOf(source) {
  return source.split(/\r?\n/).map((raw, index) => ({
    content: raw.trim(),
    indent: raw.match(/^ */)[0].length,
    line: index + 1,
    raw,
  }));
}

function mappingEntry(line) {
  const match = line.content.match(/^([a-zA-Z0-9_.-]+):(?:\s*(.*))?$/);
  return match ? { key: match[1], value: match[2] ?? "" } : undefined;
}

function blockEnd(lines, index) {
  const parentIndent = lines[index].indent;

  for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
    const line = lines[cursor];
    if (line.content && !line.content.startsWith("#") && line.indent <= parentIndent) {
      return cursor;
    }
  }

  return lines.length;
}

function directEntries(lines, index) {
  const end = blockEnd(lines, index);
  const candidates = lines
    .slice(index + 1, end)
    .filter((line) => line.content && !line.content.startsWith("#"));
  const childIndent = Math.min(...candidates.map((line) => line.indent));

  if (!Number.isFinite(childIndent) || childIndent <= lines[index].indent) {
    return [];
  }

  return candidates
    .filter((line) => line.indent === childIndent)
    .map((line) => ({ ...mappingEntry(line), index: line.line - 1, line: line.line }))
    .filter((entry) => entry.key);
}

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function permissionEntries(lines, entry) {
  if (!entry.value) {
    return directEntries(lines, entry.index).map(({ key, value }) => ({
      key: key.toLowerCase(),
      value: unquote(value).toLowerCase(),
    }));
  }

  const inline = entry.value.trim();
  if (!inline.startsWith("{") || !inline.endsWith("}")) {
    return [];
  }

  const body = inline.slice(1, -1).trim();
  if (!body) {
    return [];
  }

  return body.split(",").map((item) => {
    const match = item.trim().match(/^([a-zA-Z0-9_-]+)\s*:\s*(.+)$/);
    return match
      ? { key: match[1].toLowerCase(), value: unquote(match[2]).toLowerCase() }
      : { key: "", value: "" };
  });
}

function validatePermissions(lines, entry, label) {
  const permissions = permissionEntries(lines, entry);
  const isContentsReadOnly =
    permissions.length === 1 &&
    permissions[0].key === "contents" &&
    permissions[0].value === "read";

  return isContentsReadOnly
    ? []
    : [
        `${label} permissions at line ${entry.line} must be exactly "contents: read"; no other scope is allowed`,
      ];
}

function commandValue(lines, index, value) {
  if (!/^[>|][+-]?$/.test(value.trim())) {
    return unquote(value);
  }

  const end = blockEnd(lines, index);
  return lines
    .slice(index + 1, end)
    .map((line) => line.raw)
    .join("\n");
}

function deployCommand(command) {
  return deployCommandPatterns.some((pattern) => pattern.test(command));
}

function analyzeWorkflow(source, filename) {
  const lines = linesOf(source);
  const errors = [];
  const topLevelEntries = lines
    .filter((line) => line.indent === 0 && line.content && !line.content.startsWith("#"))
    .map((line) => ({ ...mappingEntry(line), index: line.line - 1, line: line.line }))
    .filter((entry) => entry.key);
  const workflowPermissions = topLevelEntries.filter((entry) => entry.key === "permissions");

  if (workflowPermissions.length !== 1) {
    errors.push(
      `${filename} must declare exactly one workflow-level permissions block with "contents: read"`,
    );
  } else {
    errors.push(
      ...validatePermissions(lines, workflowPermissions[0], `${filename} workflow-level`),
    );
  }

  const jobsEntries = topLevelEntries.filter((entry) => entry.key === "jobs");
  if (jobsEntries.length !== 1) {
    errors.push(`${filename} must declare exactly one jobs block`);
    return errors;
  }

  for (const job of directEntries(lines, jobsEntries[0])) {
    const jobEnd = blockEnd(lines, job.index);
    const jobEntries = directEntries(lines, job.index);
    const jobName = jobEntries.find((entry) => entry.key === "name");

    if (
      /(?:deploy|publish)/i.test(job.key) ||
      (jobName && /(?:deploy|publish)/i.test(unquote(jobName.value)))
    ) {
      errors.push(`${filename} job "${job.key}" is a deploy/publish job`);
    }

    for (const permissions of jobEntries.filter((entry) => entry.key === "permissions")) {
      errors.push(
        ...validatePermissions(lines, permissions, `${filename} job "${job.key}"`),
      );
    }

    for (let index = job.index + 1; index < jobEnd; index += 1) {
      const line = lines[index];
      const uses = line.content.match(/^(?:-\s*)?uses:\s*(.+)$/);
      if (uses && /(?:cloudflare|wrangler|deploy|publish)/i.test(unquote(uses[1]))) {
        errors.push(
          `${filename} job "${job.key}" uses a deploy/publish-capable action at line ${line.line}`,
        );
      }

      const command = line.content.match(
        /^(?:-\s*)?(?:run|command|commands|script|args):\s*(.*)$/,
      );
      if (command && deployCommand(commandValue(lines, index, command[1]))) {
        errors.push(
          `${filename} job "${job.key}" contains a deploy/publish command at line ${line.line}`,
        );
      }
    }
  }

  return errors;
}

const safeWorkflow = `name: CI
on: push
permissions:
  contents: read
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - run: yarn quality
`;

test("guard accepts a read-only, non-deploy workflow", () => {
  assert.deepEqual(analyzeWorkflow(safeWorkflow, "safe.yml"), []);
});

test("guard rejects permissions beyond contents read", () => {
  const workflowWrite = safeWorkflow.replace("contents: read", "contents: write");
  const jobWrite = safeWorkflow.replace(
    "    runs-on: ubuntu-latest",
    "    permissions:\n      id-token: write\n    runs-on: ubuntu-latest",
  );
  const readAll = safeWorkflow.replace("permissions:\n  contents: read", "permissions: read-all");

  assert.match(analyzeWorkflow(workflowWrite, "write.yml").join("\n"), /exactly "contents: read"/);
  assert.match(analyzeWorkflow(jobWrite, "job-write.yml").join("\n"), /job "quality"/);
  assert.match(analyzeWorkflow(readAll, "read-all.yml").join("\n"), /exactly "contents: read"/);
});

test("guard rejects deploy and publish commands", async (context) => {
  const commands = [
    "wrangler deploy",
    "npx wrangler deploy",
    "npx wrangler@4.120.1 pages deploy",
    "wrangler publish",
    "yarn deploy",
    "yarn deploy:cloudflare",
    "npm run deploy",
    "cloudflare pages publish",
    "make publish",
    "./scripts/deploy-site.sh",
  ];

  for (const command of commands) {
    await context.test(command, () => {
      const workflow = safeWorkflow.replace("yarn quality", command);
      assert.match(analyzeWorkflow(workflow, "deploy.yml").join("\n"), /deploy\/publish command/);
    });
  }
});

test("guard rejects deploy/publish jobs and actions", () => {
  const deployJob = safeWorkflow.replace("quality:", "publish-site:");
  const deployAction = safeWorkflow.replace(
    "- run: yarn quality",
    "- uses: cloudflare/wrangler-action@pinned-sha",
  );

  assert.match(analyzeWorkflow(deployJob, "job.yml").join("\n"), /deploy\/publish job/);
  assert.match(analyzeWorkflow(deployAction, "action.yml").join("\n"), /deploy\/publish-capable/);
});

test("all repository workflows stay read-only and non-deploying", () => {
  const workflowFiles = readdirSync(workflowsDirectory)
    .filter((filename) => /\.ya?ml$/i.test(filename))
    .sort();
  assert.ok(workflowFiles.length > 0, "At least one GitHub Actions workflow is required");

  const errors = workflowFiles.flatMap((filename) =>
    analyzeWorkflow(readFileSync(resolve(workflowsDirectory, filename), "utf8"), filename),
  );

  assert.deepEqual(errors, [], `Unsafe GitHub Actions workflow:\n${errors.join("\n")}`);
});
