import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const exportDirectory = fileURLToPath(new URL("../out/", import.meta.url));
const staticExportFixtureDirectory = fileURLToPath(
  new URL("./fixtures/static-export/", import.meta.url),
);
const canonicalOrigin = "https://storecanary.app";
const socialTitle = "The quiet morning check for a busy WooCommerce store.";
const socialDescription =
  "WooCommerce Daily Ops finds operational exceptions and turns them into one concise, actionable daily digest.";
const socialImage = {
  path: "social-share.png",
  url: `${canonicalOrigin}/social-share.png`,
  width: 1200,
  height: 630,
  alt: "Store Canary social card: The quiet morning check for a busy WooCommerce store.",
};
// Next's generated runtime carries documentation, namespace, license, and URL-parser fixtures.
// These exact strings are data, not browser request targets; any new absolute URL still fails.
const knownNonRequestFrameworkReferences = new Set([
  "http://n",
  "http://www.w3.org/1998/Math/MathML",
  "http://www.w3.org/1999/xlink",
  "http://www.w3.org/2000/svg",
  "http://www.w3.org/XML/1998/namespace",
  "https://a",
  "https://a/c%20d?a=1&c=3",
  "https://a#б",
  "https://a@b",
  "https://github.com/zloirock/core-js",
  "https://github.com/zloirock/core-js/blob/v3.38.1/LICENSE",
  "https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams",
  "https://nextjs.org/docs/messages/404-get-initial-props",
  "https://nextjs.org/docs/messages/failed-to-find-server-action",
  "https://nextjs.org/docs/messages/gssp-component-member",
  "https://nextjs.org/docs/messages/gssp-export",
  "https://nextjs.org/docs/messages/instant-link-prefetch-partial",
  "https://nextjs.org/docs/messages/instant-unrendered-segment",
  "https://nextjs.org/docs/messages/non-standard-node-env",
  "https://nextjs.org/docs/messages/public-next-folder-conflict",
  "https://nextjs.org/docs/messages/ssg-fallback-true-export",
  "https://react.dev/errors/",
  "https://x",
  "https://тест",
]);
const analyticsHostPattern =
  /\b(?:api\.segment\.io|cdn\.segment\.com|cloudflareinsights\.com|datadoghq\.com|google-analytics\.com|googletagmanager\.com|hotjar\.com|mixpanel\.com|newrelic\.com|plausible\.io|sentry\.io|stats\.g\.doubleclick\.net)\b/gi;
const literalRequestSinkPattern =
  /(?:\bfetch|\bimportScripts|\bsendBeacon|\bEventSource|\bWebSocket|\bimport|\bnew\s+URL)\s*\(\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)/gi;
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

function idAttributeValues(html) {
  const ids = [];

  for (const [tag] of html.matchAll(/<[A-Za-z][^<>]*>/g)) {
    ids.push(...attributeValues(tag, "id"));
  }

  return ids;
}

function attributeValues(tag, attributeName) {
  const attributePattern = /\s+([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  return [...tag.matchAll(attributePattern)]
    .filter((match) => match[1].toLowerCase() === attributeName)
    .map((match) => match[2] ?? match[3] ?? match[4] ?? "");
}

function assertUniqueNonEmptyIds(html, sourceFile) {
  const seenIds = new Set();

  for (const id of idAttributeValues(html)) {
    assert.notEqual(id, "", `${sourceFile} contains an empty id attribute`);
    assert.equal(seenIds.has(id), false, `${sourceFile} contains duplicate id "${id}"`);
    seenIds.add(id);
  }
}

function assertDocumentLanguageAndViewport(html, sourceFile) {
  const htmlTag = html.match(/<html\b[^<>]*>/i)?.[0];
  assert.ok(htmlTag, `${sourceFile} is missing an <html> element`);

  const languageValues = [
    ...attributeValues(htmlTag, "lang"),
    ...attributeValues(htmlTag, "xml:lang"),
  ];
  assert.ok(
    languageValues.some((language) => /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(language)),
    `${sourceFile} must declare a non-empty BCP 47 language on <html>`,
  );

  const viewportTags = [...html.matchAll(/<meta\b[^<>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) =>
      attributeValues(tag, "name").some((name) => name.toLowerCase() === "viewport"),
    );
  assert.ok(
    viewportTags.some((tag) => attributeValues(tag, "content").some((content) => content.trim())),
    `${sourceFile} must contain a viewport meta tag with non-empty content`,
  );
}

function cssReferences(contents) {
  return [...contents.matchAll(/\burl\(\s*(?:"([^"]*)"|'([^']*)'|([^'")][^)]*))\s*\)/gi)].map(
    (match) => (match[1] ?? match[2] ?? match[3]).trim(),
  );
}

function absoluteHttpReferences(contents) {
  return [...contents.matchAll(/\bhttps?:[\\/]{2,4}[^\s"'<>`)\\]+/gi)].map((match) =>
    match[0].replaceAll("\\", ""),
  );
}

function literalRequestSinkReferences(contents) {
  return [...contents.matchAll(literalRequestSinkPattern)].map(
    (match) => match[1] ?? match[2] ?? match[3],
  );
}

function metaContents(html, identifyingAttribute, identifyingValue) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(([tag]) =>
      Object.fromEntries(
        [...tag.matchAll(/\b([:\w-]+)=["']([^"']*)["']/g)].map((match) => [
          match[1].toLowerCase(),
          match[2],
        ]),
      ),
    )
    .filter((attributes) => attributes[identifyingAttribute] === identifyingValue)
    .map((attributes) => attributes.content);
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

function assertAllowedBrowserRequestTarget(reference, sourceFile, allowedMailto) {
  let url;

  try {
    url = new URL(reference, `${canonicalOrigin}/`);
  } catch (error) {
    assert.fail(
      `${sourceFile} contains an invalid browser request target "${reference}": ${error.message}`,
    );
  }

  if (url.protocol === "mailto:") {
    assert.equal(
      reference,
      allowedMailto,
      `${sourceFile} contains mailto outside the access CTA: ${reference}`,
    );
    return;
  }

  assert.ok(
    url.protocol === "http:" || url.protocol === "https:",
    `${sourceFile} contains an unsupported browser request target: ${reference}`,
  );
  assert.equal(
    url.origin,
    canonicalOrigin,
    `${sourceFile} contains an unexpected external browser request target: ${reference}`,
  );
}

function assertNoUnexpectedBrowserRequestTargets(contents, sourceFile, allowedMailto) {
  const analyticsHosts = [...contents.matchAll(analyticsHostPattern)].map((match) => match[0]);
  assert.deepEqual(
    analyticsHosts,
    [],
    `${sourceFile} embeds known analytics or beacon hosts: ${analyticsHosts.join(", ")}`,
  );

  const references = [
    ...absoluteHttpReferences(contents),
    ...literalRequestSinkReferences(contents),
  ].filter(
    (reference) =>
      !(sourceFile.endsWith(".js") && knownNonRequestFrameworkReferences.has(reference)),
  );

  for (const reference of new Set(references)) {
    assertAllowedBrowserRequestTarget(reference, sourceFile, allowedMailto);
  }
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
  "social-share.png",
].sort();

test("the static export contains only the landing page and framework fallbacks", async () => {
  const files = await inventory(exportDirectory);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));

  assert.deepEqual(htmlFiles, expectedHtmlFiles);
});

test("every exported HTML document has unique, non-empty IDs", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertUniqueNonEmptyIds(html, htmlFile);
  }
});

test("the HTML ID scanner rejects duplicate and empty IDs", () => {
  assert.throws(
    () =>
      assertUniqueNonEmptyIds(
        `<main id="content"><section class="id='ignored'" ID="content">`,
        "fixture.html",
      ),
    /fixture\.html contains duplicate id "content"/,
  );
  assert.throws(
    () => assertUniqueNonEmptyIds("<main id></main>", "fixture.html"),
    /fixture\.html contains an empty id attribute/,
  );
});

test("every exported HTML document declares its language and viewport metadata", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertDocumentLanguageAndViewport(html, htmlFile);
  }
});

test("the document metadata scanner rejects missing and empty values", async () => {
  for (const [fixture, expectedError] of [
    ["missing-lang.html", /must declare a non-empty BCP 47 language/],
    ["empty-lang.html", /must declare a non-empty BCP 47 language/],
    ["missing-viewport.html", /must contain a viewport meta tag with non-empty content/],
    ["empty-viewport.html", /must contain a viewport meta tag with non-empty content/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertDocumentLanguageAndViewport(html, fixture), expectedError);
  }

  assert.doesNotThrow(() =>
    assertDocumentLanguageAndViewport(
      '<html xml:lang="en-US"><head><meta content="width=device-width" name="VIEWPORT"></head></html>',
      "valid-xml-lang.html",
    ),
  );
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

test("social metadata and its local image stay in sync", async () => {
  const files = await inventory(exportDirectory);
  const exportedFiles = new Set(files);
  const html = await readFile(path.join(exportDirectory, "index.html"), "utf8");
  const propertyContents = (property) => metaContents(html, "property", property);
  const namedContents = (name) => metaContents(html, "name", name);

  assert.deepEqual(propertyContents("og:title"), [socialTitle]);
  assert.deepEqual(propertyContents("og:description"), [socialDescription]);
  assert.deepEqual(propertyContents("og:image"), [socialImage.url]);
  assert.deepEqual(propertyContents("og:image:width"), [String(socialImage.width)]);
  assert.deepEqual(propertyContents("og:image:height"), [String(socialImage.height)]);
  assert.deepEqual(propertyContents("og:image:alt"), [socialImage.alt]);

  assert.deepEqual(namedContents("twitter:card"), ["summary_large_image"]);
  assert.deepEqual(namedContents("twitter:title"), [socialTitle]);
  assert.deepEqual(namedContents("twitter:description"), [socialDescription]);
  assert.deepEqual(namedContents("twitter:image"), [socialImage.url]);
  assert.deepEqual(namedContents("twitter:image:alt"), [socialImage.alt]);

  resolveExportReference(socialImage.url, "index.html", exportedFiles);

  const image = await readFile(path.join(exportDirectory, socialImage.path));
  assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(image.readUInt32BE(16), socialImage.width);
  assert.equal(image.readUInt32BE(20), socialImage.height);
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

test("exported browser text contains no unexpected third-party request targets", async () => {
  const files = await inventory(exportDirectory);
  const textFiles = files.filter((file) => /\.(?:css|html|js)$/.test(file));
  const landingHtml = await readFile(path.join(exportDirectory, "index.html"), "utf8");
  const accessAnchors = [...landingHtml.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].filter(
    (match) => match[2].replace(/<[^>]+>/g, "").trim() === "Email the access request",
  );
  const accessHref = accessAnchors[0]?.[1].match(/\bhref=["']([^"']+)["']/i)?.[1];

  assert.match(accessHref ?? "", /^mailto:/);

  // Playwright covers computed runtime requests; this no-network check complements it at export time.
  for (const textFile of textFiles) {
    const contents = await readFile(path.join(exportDirectory, textFile), "utf8");
    assertNoUnexpectedBrowserRequestTargets(contents, textFile, accessHref);

    if (textFile.endsWith(".html")) {
      for (const { value } of attributeReferences(contents)) {
        assertAllowedBrowserRequestTarget(value, textFile, accessHref);
      }
    }

    if (textFile.endsWith(".css")) {
      for (const reference of cssReferences(contents)) {
        assertAllowedBrowserRequestTarget(reference, textFile, accessHref);
      }
    }
  }
});

test("the export request-target scanner rejects third-party hosts without network access", () => {
  for (const [sourceFile, contents] of [
    ["fixture.html", '<link rel="preconnect" href="https://tracker.example">'],
    ["fixture.css", "body { background: url(https://tracker.example/pixel.gif); }"],
    ["fixture.js", 'fetch("https://tracker.example/events")'],
    ["fixture.js", 'const endpoint = new URL("https://tracker.example/events")'],
    ["fixture.js", 'const endpoint = "https:\\/\\/tracker.example/events"'],
  ]) {
    assert.throws(() => {
      assertNoUnexpectedBrowserRequestTargets(contents, sourceFile);
      if (sourceFile.endsWith(".html")) {
        for (const { value } of attributeReferences(contents)) {
          assertAllowedBrowserRequestTarget(value, sourceFile);
        }
      }
      if (sourceFile.endsWith(".css")) {
        for (const reference of cssReferences(contents)) {
          assertAllowedBrowserRequestTarget(reference, sourceFile);
        }
      }
    }, /unexpected external browser request target/);
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
