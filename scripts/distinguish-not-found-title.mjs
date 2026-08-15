import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const exportDirectory = fileURLToPath(new URL("../out/", import.meta.url));
const fallbackFile = "_not-found.html";
const public404File = "404.html";
const public404Title = "Page not found · Store Canary";

function titleText(html, sourceFile) {
  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)];

  assert.equal(titles.length, 1, `${sourceFile} must contain exactly one <title> element`);
  assert.ok(titles[0][1].trim(), `${sourceFile} must contain a non-empty <title>`);

  return titles[0][1];
}

const fallbackHtml = await readFile(path.join(exportDirectory, fallbackFile), "utf8");
const public404Path = path.join(exportDirectory, public404File);
const public404Html = await readFile(public404Path, "utf8");
const fallbackTitle = titleText(fallbackHtml, fallbackFile);
const currentPublic404Title = titleText(public404Html, public404File);

// Next's static exporter copies /_not-found to 404.html. Give the public alias its own
// title while keeping the serialized metadata consistent for client hydration.
if (currentPublic404Title.trim() === fallbackTitle.trim()) {
  assert.notEqual(
    fallbackTitle.trim(),
    public404Title,
    `${fallbackFile} already uses the reserved public 404 title`,
  );
  await writeFile(public404Path, public404Html.replaceAll(currentPublic404Title, public404Title));
}
