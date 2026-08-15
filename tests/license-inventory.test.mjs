import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const allowedLicenses = new Set(["Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "MIT"]);

function parseLicenseRows(output) {
  const messages = output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const table = messages.find((message) => message.type === "table");

  assert.ok(table, "Yarn did not return a license table");

  const { head, body } = table.data;
  return body.map((values) =>
    Object.fromEntries(head.map((heading, index) => [heading, values[index]])),
  );
}

function productionInventory(rows, dependencies) {
  const productionNames = new Set(Object.keys(dependencies));

  return rows
    .filter((row) => productionNames.has(row.Name))
    .map(({ Name: name, Version: version, License: license }) => ({ license, name, version }))
    .sort(
      (left, right) =>
        left.name.localeCompare(right.name) || left.version.localeCompare(right.version),
    );
}

function inventoryErrors(inventory, dependencies) {
  const errors = [];
  const rowsByName = new Map();

  for (const row of inventory) {
    const matches = rowsByName.get(row.name) ?? [];
    matches.push(row);
    rowsByName.set(row.name, matches);
  }

  for (const name of Object.keys(dependencies).sort()) {
    const matches = rowsByName.get(name) ?? [];
    if (matches.length === 0) {
      errors.push(`${name}: missing license metadata`);
      continue;
    }
    if (matches.length > 1) {
      errors.push(`${name}: expected one resolved production version, found ${matches.length}`);
      continue;
    }

    const [{ license, version }] = matches;
    if (!license || license.trim().toLowerCase() === "unknown") {
      errors.push(`${name}@${version}: missing or unknown license`);
    } else if (!allowedLicenses.has(license)) {
      errors.push(`${name}@${version}: disallowed license "${license}"`);
    }
  }

  return errors;
}

test("inventory includes dependencies and excludes devDependencies", () => {
  const rows = [
    { Name: "next", Version: "1.0.0", License: "MIT" },
    { Name: "vitest", Version: "1.0.0", License: "MIT" },
  ];

  assert.deepEqual(productionInventory(rows, { next: "1.0.0" }), [
    { license: "MIT", name: "next", version: "1.0.0" },
  ]);
});

test("inventory rejects missing, unknown, and disallowed licenses", () => {
  const dependencies = {
    allowed: "1.0.0",
    disallowed: "1.0.0",
    missing: "1.0.0",
    unknown: "1.0.0",
  };
  const inventory = [
    { license: "MIT", name: "allowed", version: "1.0.0" },
    { license: "GPL-3.0-only", name: "disallowed", version: "1.0.0" },
    { license: "Unknown", name: "unknown", version: "1.0.0" },
  ];

  assert.deepEqual(inventoryErrors(inventory, dependencies), [
    'disallowed@1.0.0: disallowed license "GPL-3.0-only"',
    "missing: missing license metadata",
    "unknown@1.0.0: missing or unknown license",
  ]);
});

test("current production dependency licenses are explicitly allowed", () => {
  const output = execFileSync(
    "yarn",
    ["licenses", "list", "--production", "--json", "--no-progress"],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
    },
  );
  const inventory = productionInventory(parseLicenseRows(output), packageJson.dependencies);
  const errors = inventoryErrors(inventory, packageJson.dependencies);
  const renderedInventory = inventory
    .map(({ license, name, version }) => `${name}@${version}: ${license}`)
    .join("\n");

  assert.deepEqual(
    errors,
    [],
    `Production dependency license inventory failed:\n${errors.join("\n")}\n\nInventory:\n${renderedInventory}`,
  );
});
