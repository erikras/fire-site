import assert from "node:assert/strict";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const exportDirectory = fileURLToPath(new URL("../out/", import.meta.url));

const budgets = {
  HTML: {
    aggregateBytes: 42_000,
    matches: (file) => file.endsWith(".html"),
    perFileBytes: 21_000,
  },
  CSS: {
    aggregateBytes: 23_000,
    matches: (file) => file.endsWith(".css"),
    perFileBytes: 23_000,
  },
  JavaScript: {
    aggregateBytes: 590_000,
    matches: (file) => file.endsWith(".js"),
    perFileBytes: 235_000,
  },
  font: {
    aggregateBytes: 210_000,
    matches: (file) => /\.(?:woff2?|ttf|otf)$/i.test(file),
    perFileBytes: 42_000,
  },
};

async function inventory(directory, relativeDirectory = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await inventory(absolutePath, relativePath)));
    } else {
      files.push({ path: relativePath, size: (await stat(absolutePath)).size });
    }
  }

  return files.sort((left, right) => left.path.localeCompare(right.path));
}

test("the production export stays within its asset-size budgets", async () => {
  const files = await inventory(exportDirectory);

  for (const [assetType, { aggregateBytes, matches, perFileBytes }] of Object.entries(budgets)) {
    const assets = files.filter(({ path: file }) => matches(file));
    const aggregateSize = assets.reduce((total, { size }) => total + size, 0);

    assert.ok(assets.length > 0, `the export must contain at least one ${assetType} file`);
    for (const { path: file, size } of assets) {
      assert.ok(
        size <= perFileBytes,
        `${file} is ${size.toLocaleString()} bytes; the ${assetType} per-file budget is ${perFileBytes.toLocaleString()} bytes`,
      );
    }
    assert.ok(
      aggregateSize <= aggregateBytes,
      `${assetType} files total ${aggregateSize.toLocaleString()} bytes; the aggregate budget is ${aggregateBytes.toLocaleString()} bytes`,
    );
  }
});
