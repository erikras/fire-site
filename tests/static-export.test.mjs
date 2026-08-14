import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const exportDirectory = fileURLToPath(new URL("../out/", import.meta.url));

async function inventory(directory, relativeDirectory = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await inventory(absolutePath, relativePath)));
    } else {
      files.push(relativePath);
    }
  }

  return files.sort();
}

const expectedHtmlFiles = ["404.html", "_not-found.html", "index.html"];
const expectedPublicFiles = [
  "404.html",
  "__next.__PAGE__.txt",
  "__next._full.txt",
  "__next._tree.txt",
  "_not-found.html",
  "_not-found.txt",
  "_not-found/__next._full.txt",
  "_not-found/__next._not-found.__PAGE__.txt",
  "_not-found/__next._tree.txt",
  "icon.svg",
  "index.html",
  "index.txt",
  "robots.txt",
  "sitemap.xml",
].sort();

test("the static export contains only the landing page and framework fallbacks", async () => {
  const files = await inventory(exportDirectory);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));

  assert.deepEqual(htmlFiles, expectedHtmlFiles);
});

test("the public export surface contains only approved files", async () => {
  const files = await inventory(exportDirectory);
  const publicFiles = files.filter((file) => !file.startsWith("_next/"));
  const generatedFiles = files.filter((file) => file.startsWith("_next/"));
  const generatedMedia = generatedFiles.filter((file) => file.startsWith("_next/static/media/"));

  assert.deepEqual(publicFiles, expectedPublicFiles);
  assert.ok(
    generatedFiles.every((file) => /^_next\/static\/.+\.(?:css|js|svg)$/.test(file)),
    "Next.js generated an unexpected public asset type",
  );
  assert.equal(generatedMedia.length, 1);
  assert.match(generatedMedia[0], /^_next\/static\/media\/icon\.[a-z0-9_-]+\.svg$/);
  assert.equal(
    files.some((file) => file.toLowerCase().endsWith(".zip")),
    false,
    "ZIP archives must not enter the public export",
  );
});

test("the export advertises only the canonical landing page and no downloads", async () => {
  const files = await inventory(exportDirectory);
  const sitemap = await readFile(path.join(exportDirectory, "sitemap.xml"), "utf8");
  const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

  assert.deepEqual(sitemapLocations, ["https://storecanary.app"]);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    const hrefs = [...html.matchAll(/\bhref=["']([^"']+)["']/gi)].map((match) => match[1]);

    assert.equal(
      hrefs.some((href) => /(?:\.zip(?:$|[?#])|\/downloads?(?:\/|$|[?#]))/i.test(href)),
      false,
      `${htmlFile} must not link to a product download`,
    );
  }
});
