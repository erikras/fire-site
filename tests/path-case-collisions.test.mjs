import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const collisionFixture = "tests/fixtures/path-case-collisions/case-only-paths.txt";

function findCaseInsensitiveCollisions(paths) {
  const pathsByFoldedPath = new Map();

  for (const path of paths) {
    // String#toLowerCase applies Unicode default case conversion without depending on a locale.
    const foldedPath = path.toLowerCase();
    const matchingPaths = pathsByFoldedPath.get(foldedPath) ?? new Set();
    matchingPaths.add(path);
    pathsByFoldedPath.set(foldedPath, matchingPaths);
  }

  return [...pathsByFoldedPath.values()]
    .map((matchingPaths) => [...matchingPaths].sort())
    .filter((matchingPaths) => matchingPaths.length > 1)
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
}

function assertNoCaseInsensitiveCollisions(paths) {
  const collisions = findCaseInsensitiveCollisions(paths);

  assert.deepEqual(
    collisions,
    [],
    `Case-insensitive tracked path collisions:\n${collisions
      .map((matchingPaths) => `- ${matchingPaths.join("\n  ")}`)
      .join("\n")}`,
  );
}

function trackedPaths(root) {
  return execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
}

test("checker rejects an isolated case-only path collision fixture", () => {
  const paths = readFileSync(resolve(repositoryRoot, collisionFixture), "utf8")
    .split(/\r?\n/)
    .filter(Boolean);

  assert.throws(
    () => assertNoCaseInsensitiveCollisions(paths),
    (error) => {
      assert.match(error.message, /Case-insensitive tracked path collisions:/);
      assert.ok(error.message.includes("src/Foo.ts"));
      assert.ok(error.message.includes("src/foo.ts"));
      return true;
    },
  );
});

test("checker applies locale-independent Unicode lowercasing", () => {
  assert.deepEqual(findCaseInsensitiveCollisions(["src/Éclair.ts", "src/éclair.ts"]), [
    ["src/Éclair.ts", "src/éclair.ts"],
  ]);
});

test("tracked repository paths have no case-insensitive collisions", () => {
  const paths = trackedPaths(repositoryRoot);

  assert.ok(paths.length > 0);
  assertNoCaseInsensitiveCollisions(paths);
});
