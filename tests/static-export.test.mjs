import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const exportDirectory = fileURLToPath(new URL("../out/", import.meta.url));
const canonicalOrigin = "https://storecanary.app";
const starterAssetNames = new Set([
  "file.svg",
  "globe.svg",
  "next.svg",
  "vercel.svg",
  "window.svg",
]);

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

function attributeReferences(contents) {
  return [...contents.matchAll(/(?:^|\s)(href|src)=["']([^"']+)["']/gi)].map((match) => ({
    attribute: match[1].toLowerCase(),
    value: match[2],
  }));
}

function cssReferences(contents) {
  return [...contents.matchAll(/\burl\(\s*(?:"([^"]*)"|'([^']*)'|([^'")][^)]*))\s*\)/gi)].map(
    (match) => (match[1] ?? match[2] ?? match[3]).trim(),
  );
}

function resolveExportReference(reference, sourceFile, exportedFiles, allowedMailto) {
  let url;

  try {
    url = new URL(reference, new URL(sourceFile, `${canonicalOrigin}/`));
  } catch (error) {
    assert.fail(`${sourceFile} contains an invalid reference "${reference}": ${error.message}`);
  }

  if (url.protocol === "mailto:") {
    assert.equal(
      allowedMailto,
      reference,
      `${sourceFile} contains mailto outside the access CTA: ${reference}`,
    );
    return { targetFile: undefined, url };
  }

  assert.equal(
    url.origin,
    canonicalOrigin,
    `${sourceFile} contains an unexpected external ${url.protocol} reference: ${reference}`,
  );

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch (error) {
    assert.fail(`${sourceFile} contains an invalid encoded path "${reference}": ${error.message}`);
  }

  const relativePath = pathname.replace(/^\/+/, "");
  const candidates =
    relativePath === ""
      ? ["index.html"]
      : pathname.endsWith("/")
        ? [path.posix.join(relativePath, "index.html")]
        : [relativePath, `${relativePath}.html`];
  const targetFile = candidates.find((candidate) => exportedFiles.has(candidate));

  assert.ok(
    targetFile,
    `${sourceFile} reference "${reference}" does not resolve to a file in out/ (tried ${candidates.join(", ")})`,
  );
  assert.equal(
    starterAssetNames.has(path.posix.basename(targetFile)),
    false,
    `${sourceFile} references leftover starter asset ${targetFile}`,
  );

  return { targetFile, url };
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
  const generatedFonts = generatedMedia.filter((file) => file.endsWith(".woff2"));
  const generatedIcons = generatedMedia.filter((file) => file.endsWith(".svg"));

  assert.deepEqual(publicFiles, expectedPublicFiles);
  assert.ok(
    generatedFiles.every((file) => /^_next\/static\/.+\.(?:css|js|svg|woff2)$/.test(file)),
    "Next.js generated an unexpected public asset type",
  );
  assert.equal(generatedMedia.length, 17);
  assert.equal(generatedFonts.length, 16);
  assert.ok(
    generatedFonts.every((file) => /^_next\/static\/media\/[a-z0-9._-]+\.woff2$/.test(file)),
    "Next.js generated an unexpected font asset",
  );
  assert.equal(generatedIcons.length, 1);
  assert.match(generatedIcons[0], /^_next\/static\/media\/icon\.[a-z0-9_-]+\.svg$/);
  assert.equal(
    files.some((file) => file.toLowerCase().endsWith(".zip")),
    false,
    "ZIP archives must not enter the public export",
  );
});

test("landing links and resources resolve entirely within the static export", async () => {
  const files = await inventory(exportDirectory);
  const exportedFiles = new Set(files);
  const landingFile = "index.html";
  const html = await readFile(path.join(exportDirectory, landingFile), "utf8");
  const references = attributeReferences(html);
  const accessAnchors = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].filter(
    (match) => match[2].replace(/<[^>]+>/g, "").trim() === "Email the access request",
  );

  assert.equal(accessAnchors.length, 1, "the export must contain exactly one access email CTA");
  const accessHref = accessAnchors[0][1].match(/\bhref=["']([^"']+)["']/i)?.[1];
  assert.match(accessHref ?? "", /^mailto:/);
  assert.deepEqual(
    references.filter(({ value }) => value.startsWith("mailto:")).map(({ value }) => value),
    [accessHref],
    "mailto is allowed only on the access email CTA",
  );

  const htmlCache = new Map([[landingFile, html]]);
  for (const { attribute, value } of references) {
    const { targetFile, url } = resolveExportReference(
      value,
      landingFile,
      exportedFiles,
      accessHref,
    );

    if (attribute !== "href" || !url.hash || !targetFile) {
      continue;
    }

    const targetHtml =
      htmlCache.get(targetFile) ??
      (await readFile(path.join(exportDirectory, targetFile), "utf8").then((contents) => {
        htmlCache.set(targetFile, contents);
        return contents;
      }));
    const targetIds = new Set(
      [...targetHtml.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]),
    );
    const fragment = decodeURIComponent(url.hash.slice(1));
    assert.ok(targetIds.has(fragment), `${landingFile} links to missing fragment #${fragment}`);
  }

  const starterAssets = files.filter((file) => starterAssetNames.has(path.posix.basename(file)));
  assert.deepEqual(starterAssets, [], "leftover Next.js starter assets must not enter out/");
});

test("exported CSS url() resources resolve within the static export", async () => {
  const files = await inventory(exportDirectory);
  const exportedFiles = new Set(files);
  const cssFiles = files.filter((file) => file.endsWith(".css"));

  assert.ok(cssFiles.length > 0, "the landing export must contain generated CSS");

  for (const cssFile of cssFiles) {
    const css = await readFile(path.join(exportDirectory, cssFile), "utf8");
    for (const reference of cssReferences(css)) {
      resolveExportReference(reference, cssFile, exportedFiles);
    }
  }
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
