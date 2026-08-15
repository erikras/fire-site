import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const markdownFiles = execFileSync("git", ["ls-files", "-z", "--", "*.md"], {
  cwd: repositoryRoot,
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);

function markdownDestinations(markdown) {
  const destinations = [];
  let fence;

  for (const [index, sourceLine] of markdown.split(/\r?\n/).entries()) {
    const fenceMatch = sourceLine.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!fence) {
        fence = marker;
      } else if (marker === fence) {
        fence = undefined;
      }
      continue;
    }

    if (fence) {
      continue;
    }

    const line = sourceLine.replace(/(`+)[^`]*?\1/g, "");
    const inlineLink = /!?\[[^\]]*]\(\s*(?:<([^>]+)>|([^\s)]+))/g;
    const referenceLink = /^\s{0,3}\[[^\]]+]:\s*(?:<([^>]+)>|(\S+))/;
    let match;

    while ((match = inlineLink.exec(line))) {
      destinations.push({ destination: match[1] ?? match[2], line: index + 1 });
    }

    match = line.match(referenceLink);
    if (match) {
      destinations.push({ destination: match[1] ?? match[2], line: index + 1 });
    }
  }

  return destinations;
}

function localPath(destination) {
  if (
    !destination ||
    destination.startsWith("#") ||
    destination.startsWith("//") ||
    isAbsolute(destination) ||
    /^[a-z][a-z\d+.-]*:/i.test(destination)
  ) {
    // External, mailto, fragment-only, and site-root URLs are intentionally
    // skipped: this check performs no network access.
    return undefined;
  }

  const pathWithoutQueryOrFragment = destination.split(/[?#]/, 1)[0];
  if (!pathWithoutQueryOrFragment) {
    return undefined;
  }

  try {
    return decodeURIComponent(pathWithoutQueryOrFragment).replaceAll("\\ ", " ");
  } catch {
    return pathWithoutQueryOrFragment;
  }
}

test("repository contains tracked Markdown documentation", () => {
  assert.ok(markdownFiles.length > 0);
});

for (const markdownFile of markdownFiles) {
  test(`${markdownFile} has no broken in-repo links`, () => {
    const markdown = readFileSync(resolve(repositoryRoot, markdownFile), "utf8");
    const brokenLinks = [];

    for (const { destination, line } of markdownDestinations(markdown)) {
      const path = localPath(destination);
      if (!path) {
        continue;
      }

      const target = resolve(repositoryRoot, dirname(markdownFile), path);
      const targetRelativeToRoot = relative(repositoryRoot, target);
      const escapesRepository =
        targetRelativeToRoot === ".." || targetRelativeToRoot.startsWith(`..${sep}`);

      if (escapesRepository || !existsSync(target)) {
        brokenLinks.push(`${markdownFile}:${line} -> ${destination}`);
      }
    }

    assert.deepEqual(brokenLinks, [], `Broken in-repo Markdown links:\n${brokenLinks.join("\n")}`);
  });
}
