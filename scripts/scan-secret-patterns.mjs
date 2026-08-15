import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

const generatedDirectoryNames = new Set([
  ".next",
  "build",
  "coverage",
  "node_modules",
  "out",
  "playwright-report",
  "test-results",
]);

const lockfileNames = new Set([
  "Cargo.lock",
  "Gemfile.lock",
  "bun.lock",
  "bun.lockb",
  "composer.lock",
  "package-lock.json",
  "pnpm-lock.yaml",
  "poetry.lock",
  "uv.lock",
  "yarn.lock",
]);

const patterns = [
  {
    name: "PEM private key",
    expression: /-----BEGIN (?:[A-Z0-9]+(?: [A-Z0-9]+)* )?PRIVATE KEY-----/g,
  },
  {
    name: "AWS access key ID",
    expression: /\bAKIA[0-9A-Z]{16}\b/g,
  },
  {
    name: "GitHub legacy token",
    expression: /\bgh[pousr]_[A-Za-z0-9]{36,255}\b/g,
  },
  {
    name: "GitHub fine-grained token",
    expression: /\bgithub_pat_[A-Za-z0-9_]{40,255}\b/g,
  },
  {
    name: "Slack token",
    expression: /\bxox[bp]-[A-Za-z0-9-]{20,255}\b/g,
  },
  {
    name: "Cloudflare API token assignment",
    expression: /\b(?:CF_API_TOKEN|CLOUDFLARE_API_TOKEN)\s*[:=]\s*["']?[A-Za-z0-9_-]{30,}["']?/g,
  },
];

function normalizedPath(file) {
  return file.replaceAll("\\", "/").replace(/^\.\/+/, "");
}

export function allowlistReason(file) {
  const normalized = normalizedPath(file);
  const segments = normalized.split("/");
  const filename = basename(normalized);

  if (segments.some((segment) => generatedDirectoryNames.has(segment))) {
    return "generated, dependency, or test-report directory";
  }

  if (lockfileNames.has(filename)) {
    return "package-manager lockfile";
  }

  if (/^(?:licen[cs]e|copying|notice)(?:[._-].*)?$/i.test(filename)) {
    return "license text";
  }

  if (normalized.startsWith("tests/fixtures/secret-patterns/")) {
    return "isolated, intentionally fake secret-scanner fixture";
  }

  return undefined;
}

function lineNumberAt(source, index) {
  let line = 1;
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (source.charCodeAt(cursor) === 10) {
      line += 1;
    }
  }
  return line;
}

export function scanText(source, file = "<text>") {
  const findings = [];

  for (const { name, expression } of patterns) {
    for (const match of source.matchAll(expression)) {
      findings.push({
        column: match.index - source.lastIndexOf("\n", match.index - 1),
        file,
        index: match.index,
        line: lineNumberAt(source, match.index),
        pattern: name,
      });
    }
  }

  return findings.sort(
    (left, right) =>
      left.index - right.index ||
      left.pattern.localeCompare(right.pattern) ||
      left.file.localeCompare(right.file),
  );
}

function isBinary(contents) {
  return contents.includes(0);
}

export function trackedFiles(root = repositoryRoot) {
  return execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean)
    .sort();
}

export function scanRepository(root = repositoryRoot) {
  const findings = [];
  const scannedFiles = [];
  const skippedFiles = [];

  for (const file of trackedFiles(root)) {
    const reason = allowlistReason(file);
    if (reason) {
      skippedFiles.push({ file, reason });
      continue;
    }

    const contents = readFileSync(resolve(root, file));
    if (isBinary(contents)) {
      skippedFiles.push({ file, reason: "binary file" });
      continue;
    }

    scannedFiles.push(file);
    findings.push(...scanText(contents.toString("utf8"), file));
  }

  return { findings, scannedFiles, skippedFiles };
}

function run() {
  const { findings, scannedFiles } = scanRepository();

  if (findings.length > 0) {
    const locations = findings
      .map(({ column, file, line, pattern }) => `- ${file}:${line}:${column} (${pattern})`)
      .join("\n");
    console.error(
      `Secret pattern scan found ${findings.length} possible leaked credential(s):\n${locations}\n` +
        "Remove the credential and rotate it if it was ever valid.",
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Secret pattern scan passed (${scannedFiles.length} tracked text files scanned).`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  run();
}
