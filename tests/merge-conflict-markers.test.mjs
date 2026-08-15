import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const conflictFixture = "tests/fixtures/merge-conflict-markers/obvious-conflict.txt";
const conflictMarkerPattern = /^(?:<{7}|={7}|>{7})(?:[ \t]+\S.*)?$/;

// This fixture is intentionally excluded from the repository scan so it can prove detection.
const allowlistedFiles = new Map([
  [conflictFixture, "isolated, intentional merge-conflict scanner fixture"],
]);

function scanText(source, file = "") {
  return source
    .split(/\r?\n/)
    .map((line, index) => ({ file, line: index + 1, marker: line }))
    .filter(({ marker }) => conflictMarkerPattern.test(marker));
}

function scanRepository(root) {
  const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean)
    .sort();
  const findings = [];
  const scannedFiles = [];
  const skippedFiles = [];

  for (const file of trackedFiles) {
    const allowlistReason = allowlistedFiles.get(file);
    if (allowlistReason) {
      skippedFiles.push({ file, reason: allowlistReason });
      continue;
    }

    const contents = readFileSync(resolve(root, file));
    if (contents.includes(0)) {
      skippedFiles.push({ file, reason: "binary file" });
      continue;
    }

    scannedFiles.push(file);
    findings.push(...scanText(contents.toString("utf8"), file));
  }

  return { findings, scannedFiles, skippedFiles };
}

test("scanner rejects an obvious merge-conflict fixture", () => {
  const source = readFileSync(resolve(repositoryRoot, conflictFixture), "utf8");

  assert.deepEqual(scanText(source, conflictFixture), [
    { file: conflictFixture, line: 3, marker: "<<<<<<< HEAD" },
    { file: conflictFixture, line: 5, marker: "=======" },
    { file: conflictFixture, line: 7, marker: ">>>>>>> feature/example" },
  ]);
});

test("scanner accepts similar text that is not an exact conflict marker line", () => {
  const source = [
    "before <<<<<<< HEAD",
    " <<<<<<< HEAD",
    "<<<<<<",
    "========",
    ">>>>>>>>",
    ">>>>>>> ",
    "after ======= text",
  ].join("\n");

  assert.deepEqual(scanText(source), []);
});

test("tracked repository text files contain no unresolved merge-conflict markers", () => {
  const { findings, scannedFiles, skippedFiles } = scanRepository(repositoryRoot);

  assert.ok(scannedFiles.length > 0);
  assert.ok(
    skippedFiles.some(({ file, reason }) => file === conflictFixture && reason.includes("fixture")),
    "The intentional negative fixture must remain explicitly allowlisted",
  );
  assert.deepEqual(
    findings,
    [],
    `Unresolved merge-conflict markers:\n${findings
      .map(({ file, line, marker }) => `${file}:${line} ${marker}`)
      .join("\n")}`,
  );
});
