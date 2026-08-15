import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  allowlistReason,
  scanRepository,
  scanText,
} from "../scripts/scan-secret-patterns.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const fakeFixture = "tests/fixtures/secret-patterns/obvious-fake-private-key.txt";

test("scanner rejects an obvious leaked-key fixture", () => {
  const source = readFileSync(resolve(repositoryRoot, fakeFixture), "utf8");
  const findings = scanText(source, fakeFixture);

  assert.deepEqual(
    findings.map(({ line, pattern }) => ({ line, pattern })),
    [{ line: 3, pattern: "PEM private key" }],
  );
});

test("scanner recognizes each supported high-confidence credential shape", () => {
  const candidates = [
    ["AWS access key ID", ["AK", "IA", "A".repeat(16)].join("")],
    ["GitHub legacy token", ["gh", "p_", "a".repeat(36)].join("")],
    ["GitHub fine-grained token", ["github", "_pat_", "a".repeat(40)].join("")],
    ["Slack token", ["xox", "b-", "1234567890-1234567890-", "a".repeat(24)].join("")],
    [
      "Cloudflare API token assignment",
      ["CF_API_", "TOKEN=", "a".repeat(40)].join(""),
    ],
  ];

  for (const [pattern, source] of candidates) {
    assert.deepEqual(
      scanText(source).map((finding) => finding.pattern),
      [pattern],
      `${pattern} should be detected`,
    );
  }
});

test("allowlist is limited to generated content, lockfiles, licenses, and fake fixtures", () => {
  assert.equal(allowlistReason("yarn.lock"), "package-manager lockfile");
  assert.equal(allowlistReason("vendor/LICENSE.txt"), "license text");
  assert.equal(
    allowlistReason(fakeFixture),
    "isolated, intentionally fake secret-scanner fixture",
  );
  assert.equal(
    allowlistReason("playwright-report/index.html"),
    "generated, dependency, or test-report directory",
  );
  assert.equal(allowlistReason("src/example.ts"), undefined);
  assert.equal(allowlistReason(".github/workflows/ci.yml"), undefined);
  assert.equal(allowlistReason(".env.example"), undefined);
});

test("tracked repository source and configuration contain no secret patterns", () => {
  const { findings, scannedFiles, skippedFiles } = scanRepository(repositoryRoot);

  assert.ok(scannedFiles.length > 0);
  assert.ok(
    skippedFiles.some(({ file, reason }) => file === fakeFixture && reason.includes("fake")),
    "The intentionally fake negative fixture must remain explicitly allowlisted",
  );
  assert.deepEqual(
    findings,
    [],
    `Possible leaked credentials:\n${findings
      .map(({ file, line, pattern }) => `${file}:${line} (${pattern})`)
      .join("\n")}`,
  );
});
