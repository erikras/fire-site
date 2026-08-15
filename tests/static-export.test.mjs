import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { queryAllByRole } from "@testing-library/dom";
import { JSDOM } from "jsdom";

const exportDirectory = fileURLToPath(new URL("../out/", import.meta.url));
const staticExportFixtureDirectory = fileURLToPath(
  new URL("./fixtures/static-export/", import.meta.url),
);
const exportPathFixtureDirectory = fileURLToPath(
  new URL("./fixtures/export-paths/", import.meta.url),
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
const urlBearingAttributeNames = new Set([
  "action",
  "cite",
  "data",
  "formaction",
  "href",
  "poster",
  "src",
  "srcset",
  "xlink:href",
]);
// Concrete roles defined by WAI-ARIA 1.2. Abstract roles are intentionally excluded.
const validAriaRoleTokens = new Set([
  "alert",
  "alertdialog",
  "application",
  "article",
  "banner",
  "blockquote",
  "button",
  "caption",
  "cell",
  "checkbox",
  "code",
  "columnheader",
  "combobox",
  "complementary",
  "contentinfo",
  "definition",
  "deletion",
  "dialog",
  "directory",
  "document",
  "emphasis",
  "feed",
  "figure",
  "form",
  "generic",
  "grid",
  "gridcell",
  "group",
  "heading",
  "img",
  "insertion",
  "link",
  "list",
  "listbox",
  "listitem",
  "log",
  "main",
  "marquee",
  "math",
  "menu",
  "menubar",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "meter",
  "navigation",
  "none",
  "note",
  "option",
  "paragraph",
  "presentation",
  "progressbar",
  "radio",
  "radiogroup",
  "region",
  "row",
  "rowgroup",
  "rowheader",
  "scrollbar",
  "search",
  "searchbox",
  "separator",
  "slider",
  "spinbutton",
  "status",
  "strong",
  "subscript",
  "superscript",
  "switch",
  "tab",
  "table",
  "tablist",
  "tabpanel",
  "term",
  "textbox",
  "time",
  "timer",
  "toolbar",
  "tooltip",
  "tree",
  "treegrid",
  "treeitem",
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

function assertSafeExportPaths(relativePaths, source = "out/") {
  const unsafePaths = relativePaths.filter(
    (relativePath) => !/^[A-Za-z0-9._~/-]+$/.test(relativePath),
  );

  assert.deepEqual(
    unsafePaths,
    [],
    `${source} contains paths with characters that are unsafe in public URLs: ${unsafePaths.join(", ")}`,
  );
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

function assertValidTabIndexValues(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const invalidValues = [...dom.window.document.querySelectorAll("[tabindex]")]
      .map((element) => element.getAttribute("tabindex") ?? "")
      .filter((value) => {
        const numericValue = value.trim();
        return !/^[+-]?\d+$/.test(numericValue) || BigInt(numericValue) > 0n;
      });

    assert.deepEqual(
      invalidValues,
      [],
      `${sourceFile} contains invalid tabindex values: ${invalidValues
        .map((value) => JSON.stringify(value))
        .join(", ")}; values must be integers less than or equal to 0`,
    );
  } finally {
    dom.window.close();
  }
}

function assertUniqueNonEmptyIds(html, sourceFile) {
  const seenIds = new Set();

  for (const id of idAttributeValues(html)) {
    assert.notEqual(id, "", `${sourceFile} contains an empty id attribute`);
    assert.equal(seenIds.has(id), false, `${sourceFile} contains duplicate id "${id}"`);
    seenIds.add(id);
  }
}

function assertValidIdSyntax(html, sourceFile) {
  const invalidIds = idAttributeValues(html).flatMap((id) => {
    const violations = [];

    if (/^[0-9]/.test(id)) {
      violations.push("starts with an ASCII digit");
    }
    if (/\s/u.test(id)) {
      violations.push("contains whitespace");
    }

    return violations.length > 0 ? [`${JSON.stringify(id)} (${violations.join(", ")})`] : [];
  });

  assert.deepEqual(
    invalidIds,
    [],
    `${sourceFile} contains invalid id values: ${invalidIds.join("; ")}`,
  );
}

function assertValidAriaRoles(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const invalidRoles = [...dom.window.document.querySelectorAll("[role]")].flatMap((element) => {
      const value = element.getAttribute("role") ?? "";
      const tokens = value.trim() ? value.trim().split(/\s+/) : [];
      const invalidTokens = tokens.filter((token) => !validAriaRoleTokens.has(token));

      if (tokens.length > 0 && invalidTokens.length === 0) {
        return [];
      }

      const reason =
        tokens.length === 0
          ? "contains no role tokens"
          : `contains invalid tokens: ${invalidTokens
              .map((token) => JSON.stringify(token))
              .join(", ")}`;
      return [`<${element.localName}> role=${JSON.stringify(value)} ${reason}`];
    });

    assert.deepEqual(
      invalidRoles,
      [],
      `${sourceFile} contains invalid WAI-ARIA role attributes: ${invalidRoles.join("; ")}`,
    );
  } finally {
    dom.window.close();
  }
}

function assertAriaIdReferences(html, sourceFile) {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  try {
    for (const attribute of ["aria-labelledby", "aria-describedby"]) {
      for (const element of document.querySelectorAll(`[${attribute}]`)) {
        const value = element.getAttribute(attribute) ?? "";
        assert.ok(
          value.trim(),
          `${sourceFile} contains an empty or whitespace-only ${attribute} attribute`,
        );

        const referencedIds = value.split(/\s/);
        assert.equal(
          referencedIds.includes(""),
          false,
          `${sourceFile} contains an empty token in ${attribute}="${value}"`,
        );

        for (const referencedId of referencedIds) {
          assert.ok(
            document.getElementById(referencedId),
            `${sourceFile} ${attribute} references missing id "${referencedId}"`,
          );
        }
      }
    }
  } finally {
    dom.window.close();
  }
}

function assertSkipLinkTargets(html, sourceFile) {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  try {
    const accessibleNameMatches = new Set(
      queryAllByRole(document, "link", {
        name: /skip/i,
      }),
    );
    const skipLinks = [...document.querySelectorAll("a")].filter(
      (link) => accessibleNameMatches.has(link) || /skip/i.test(link.textContent ?? ""),
    );

    for (const skipLink of skipLinks) {
      const href = skipLink.getAttribute("href");
      assert.ok(
        href?.startsWith("#") && href.length > 1,
        `${sourceFile} skip link must use a non-empty same-document fragment href`,
      );

      let fragment;
      try {
        fragment = decodeURIComponent(href.slice(1));
      } catch (error) {
        assert.fail(
          `${sourceFile} skip link has an invalid encoded fragment "${href}": ${error.message}`,
        );
      }

      assert.ok(
        fragment && document.getElementById(fragment),
        `${sourceFile} skip link targets missing id "${fragment}"`,
      );
    }
  } finally {
    dom.window.close();
  }
}

function assertNoInlineEventHandlers(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const inlineHandlers = [...dom.window.document.querySelectorAll("*")].flatMap((element) =>
      element
        .getAttributeNames()
        .filter((attributeName) => /^on[a-z]+$/i.test(attributeName))
        .map((attributeName) => `"${attributeName}" on <${element.localName}>`),
    );

    assert.deepEqual(
      inlineHandlers,
      [],
      `${sourceFile} contains inline event-handler attributes: ${inlineHandlers.join(", ")}`,
    );
  } finally {
    dom.window.close();
  }
}

function assertNoJavascriptUrls(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const javascriptUrls = [...dom.window.document.querySelectorAll("*")].flatMap((element) =>
      element
        .getAttributeNames()
        .filter((attributeName) => urlBearingAttributeNames.has(attributeName.toLowerCase()))
        .filter((attributeName) => {
          const value = element.getAttribute(attributeName) ?? "";
          return attributeName.toLowerCase() === "srcset"
            ? /(?:^|,)\s*javascript:/i.test(value)
            : /^\s*javascript:/i.test(value);
        })
        .map((attributeName) => {
          const value = element.getAttribute(attributeName) ?? "";
          return `"${attributeName}" on <${element.localName}>: "${value}"`;
        }),
    );

    assert.deepEqual(
      javascriptUrls,
      [],
      `${sourceFile} contains javascript: URLs: ${javascriptUrls.join(", ")}`,
    );
  } finally {
    dom.window.close();
  }
}

function assertNoCleartextUrls(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const cleartextUrls = [...dom.window.document.querySelectorAll("*")].flatMap((element) =>
      element
        .getAttributeNames()
        .filter((attributeName) => urlBearingAttributeNames.has(attributeName.toLowerCase()))
        .filter((attributeName) => {
          const value = element.getAttribute(attributeName) ?? "";
          return attributeName.toLowerCase() === "srcset"
            ? /(?:^|,)\s*http:\/\//i.test(value)
            : /^\s*http:\/\//i.test(value);
        })
        .map((attributeName) => {
          const value = element.getAttribute(attributeName) ?? "";
          return `"${attributeName}" on <${element.localName}>: "${value}"`;
        }),
    );

    assert.deepEqual(
      cleartextUrls,
      [],
      `${sourceFile} contains plain http:// URLs: ${cleartextUrls.join(", ")}`,
    );
  } finally {
    dom.window.close();
  }
}

function assertBlankTargetsUseNoopener(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const unsafeTargets = [...dom.window.document.querySelectorAll("[target]")]
      .filter((element) => (element.getAttribute("target") ?? "").toLowerCase() === "_blank")
      .filter((element) => {
        const relTokens = (element.getAttribute("rel") ?? "")
          .split(/\s+/)
          .filter(Boolean)
          .map((token) => token.toLowerCase());
        return !relTokens.includes("noopener") && !relTokens.includes("noreferrer");
      })
      .map((element) => {
        const rel = element.hasAttribute("rel")
          ? JSON.stringify(element.getAttribute("rel"))
          : "missing rel";
        return `<${element.localName}> with ${rel}`;
      });

    assert.deepEqual(
      unsafeTargets,
      [],
      `${sourceFile} contains target="_blank" elements without rel="noopener" or rel="noreferrer": ${unsafeTargets.join(", ")}`,
    );
  } finally {
    dom.window.close();
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

function documentTitle(html, sourceFile) {
  const dom = new JSDOM(html);
  const titleTexts = [...dom.window.document.querySelectorAll("title")].map(
    (title) => title.textContent ?? "",
  );
  dom.window.close();

  assert.equal(titleTexts.length, 1, `${sourceFile} must contain exactly one <title> element`);
  assert.ok(titleTexts[0].trim(), `${sourceFile} must contain a non-empty <title>`);

  return titleTexts[0].trim();
}

function assertUniqueDocumentTitles(documents) {
  const titleSources = new Map();

  for (const { html, sourceFile } of documents) {
    const title = documentTitle(html, sourceFile);
    const firstSource = titleSources.get(title);

    if (firstSource !== undefined) {
      assert.fail(
        `${sourceFile} has duplicate document title "${title}" (already used by ${firstSource})`,
      );
    }

    titleSources.set(title, sourceFile);
  }
}

function assertDocumentTitleAndCharset(html, sourceFile) {
  documentTitle(html, sourceFile);

  const dom = new JSDOM(html);
  const metaElements = [...dom.window.document.querySelectorAll("meta")];
  const hasCharset = metaElements.some((meta) => {
    if (meta.getAttribute("charset")?.trim()) {
      return true;
    }

    const isContentType = meta.getAttribute("http-equiv")?.trim().toLowerCase() === "content-type";
    const content = meta.getAttribute("content") ?? "";
    const match = content.match(/(?:^|;)\s*charset\s*=\s*(?:"([^"]*)"|'([^']*)'|([^;\s"']+))/i);
    return isContentType && Boolean((match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim());
  });
  dom.window.close();

  assert.ok(hasCharset, `${sourceFile} must contain a non-empty character-set declaration`);
}

function assertCanonicalLink(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const canonicalLinks = [...dom.window.document.querySelectorAll("link")].filter((link) =>
      (link.getAttribute("rel") ?? "")
        .split(/\s+/)
        .some((token) => token.toLowerCase() === "canonical"),
    );

    assert.equal(
      canonicalLinks.length,
      1,
      `${sourceFile} must contain exactly one rel=canonical link`,
    );

    const href = (canonicalLinks[0].getAttribute("href") ?? "").trim();
    assert.ok(href, `${sourceFile} canonical href must be non-empty`);

    let canonicalUrl;
    try {
      canonicalUrl = new URL(href);
    } catch {
      assert.fail(`${sourceFile} canonical href must be an absolute URL: "${href}"`);
    }

    assert.equal(
      canonicalUrl.protocol,
      "https:",
      `${sourceFile} canonical href must use HTTPS: "${href}"`,
    );
    assert.equal(
      canonicalUrl.origin,
      canonicalOrigin,
      `${sourceFile} canonical href must use ${canonicalOrigin}: "${href}"`,
    );
  } finally {
    dom.window.close();
  }
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

test("every public export path contains only URL-safe characters", async () => {
  const files = await inventory(exportDirectory);

  assertSafeExportPaths(files);
});

test("the public export path scanner rejects unsafe relative paths", async () => {
  const validPaths = JSON.parse(
    await readFile(path.join(exportPathFixtureDirectory, "valid.json"), "utf8"),
  );
  assert.doesNotThrow(() => assertSafeExportPaths(validPaths, "valid fixture"));

  for (const fixture of ["space.json", "question-mark.json", "control-character.json"]) {
    const invalidPaths = JSON.parse(
      await readFile(path.join(exportPathFixtureDirectory, fixture), "utf8"),
    );
    assert.throws(
      () => assertSafeExportPaths(invalidPaths, fixture),
      /contains paths with characters that are unsafe in public URLs/,
    );
  }
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

test("every exported HTML document has IDs without leading digits or whitespace", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertValidIdSyntax(html, htmlFile);
  }
});

test("the HTML ID syntax scanner rejects leading digits and whitespace", async () => {
  for (const [fixture, expectedError] of [
    ["id-leading-digit.html", /"1main" \(starts with an ASCII digit\)/],
    ["id-space.html", /"skip link" \(contains whitespace\)/],
    ["id-tab.html", /"main\\t" \(contains whitespace\)/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertValidIdSyntax(html, fixture), expectedError);
  }

  const valid = await readFile(path.join(staticExportFixtureDirectory, "id-valid.html"), "utf8");
  assert.doesNotThrow(() => assertValidIdSyntax(valid, "id-valid.html"));
});

test("every exported HTML document uses only concrete WAI-ARIA 1.2 role tokens", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertValidAriaRoles(html, htmlFile);
  }
});

test("the ARIA role scanner rejects empty, unknown, and abstract roles", async () => {
  for (const [fixture, expectedInvalidTokens] of [
    ["role-empty.html", []],
    ["role-whitespace-only.html", []],
    ["role-unknown.html", ["foo", "buttonn"]],
    [
      "role-abstract.html",
      [
        "roletype",
        "widget",
        "structure",
        "window",
        "landmark",
        "section",
        "input",
        "range",
        "command",
        "sectionhead",
        "select",
        "composite",
      ],
    ],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertValidAriaRoles(html, fixture),
      (error) => {
        assert.match(error.message, /contains invalid WAI-ARIA role attributes/);
        if (expectedInvalidTokens.length === 0) {
          assert.match(error.message, /contains no role tokens/);
        }
        for (const token of expectedInvalidTokens) {
          assert.match(error.message, new RegExp(`"${token}"`));
        }
        return true;
      },
    );
  }

  for (const fixture of ["role-valid.html", "no-role.html"]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertValidAriaRoles(html, fixture));
  }
});

test("every exported HTML document has only non-positive numeric tabindex values", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertValidTabIndexValues(html, htmlFile);
  }
});

test("the tabindex scanner rejects positive and malformed values", async () => {
  for (const fixture of [
    "tabindex-positive-one.html",
    "tabindex-positive-plus-two.html",
    "tabindex-empty.html",
    "tabindex-non-numeric.html",
    "tabindex-whitespace-only.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertValidTabIndexValues(html, fixture),
      /contains invalid tabindex values/,
    );
  }

  for (const fixture of ["tabindex-zero.html", "tabindex-negative-one.html", "no-tabindex.html"]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertValidTabIndexValues(html, fixture));
  }
});

test("every exported HTML document has resolvable ARIA ID references", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertAriaIdReferences(html, htmlFile);
  }
});

test("the ARIA ID-reference scanner rejects invalid token lists", async () => {
  for (const [fixture, expectedError] of [
    ["missing-aria-target.html", /aria-labelledby references missing id "missing-label"/],
    [
      "empty-aria-labelledby.html",
      /contains an empty or whitespace-only aria-labelledby attribute/,
    ],
    [
      "whitespace-only-aria-describedby.html",
      /contains an empty or whitespace-only aria-describedby attribute/,
    ],
    ["empty-aria-reference-token.html", /contains an empty token in aria-labelledby=/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertAriaIdReferences(html, fixture), expectedError);
  }

  const noReferences = await readFile(
    path.join(staticExportFixtureDirectory, "no-aria-id-references.html"),
    "utf8",
  );
  assert.doesNotThrow(() => assertAriaIdReferences(noReferences, "no-aria-id-references.html"));
});

test("every exported HTML document has resolvable in-document skip links", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertSkipLinkTargets(html, htmlFile);
  }
});

test("the skip-link scanner rejects invalid targets and accepts an existing target", async () => {
  for (const [fixture, expectedError] of [
    ["skip-link-missing-target.html", /skip link targets missing id "content"/],
    ["skip-link-hash-only.html", /skip link must use a non-empty same-document fragment href/],
    ["skip-link-empty-href.html", /skip link must use a non-empty same-document fragment href/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertSkipLinkTargets(html, fixture), expectedError);
  }

  const valid = await readFile(
    path.join(staticExportFixtureDirectory, "skip-link-valid.html"),
    "utf8",
  );
  assert.doesNotThrow(() => assertSkipLinkTargets(valid, "skip-link-valid.html"));
});

test("every exported HTML document contains no inline event-handler attributes", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertNoInlineEventHandlers(html, htmlFile);
  }
});

test("the inline event-handler scanner rejects handler attributes", async () => {
  for (const [fixture, expectedError] of [
    ["inline-onclick.html", /contains inline event-handler attributes: "onclick" on <button>/],
    ["inline-onerror.html", /contains inline event-handler attributes: "onerror" on <img>/],
    ["inline-empty-onload.html", /contains inline event-handler attributes: "onload" on <body>/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertNoInlineEventHandlers(html, fixture), expectedError);
  }

  const noInlineHandlers = await readFile(
    path.join(staticExportFixtureDirectory, "no-inline-event-handlers.html"),
    "utf8",
  );
  assert.doesNotThrow(() =>
    assertNoInlineEventHandlers(noInlineHandlers, "no-inline-event-handlers.html"),
  );
});

test("every exported HTML document contains no javascript: URLs", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertNoJavascriptUrls(html, htmlFile);
  }
});

test("the URL-scheme scanner rejects javascript: URLs", async () => {
  for (const [fixture, expectedError] of [
    ["javascript-href.html", /contains javascript: URLs: "href" on <a>/],
    ["javascript-src.html", /contains javascript: URLs: "src" on <img>/],
    [
      "javascript-leading-space-uppercase.html",
      /contains javascript: URLs: "formaction" on <button>/,
    ],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertNoJavascriptUrls(html, fixture), expectedError);
  }

  const safeUrls = await readFile(
    path.join(staticExportFixtureDirectory, "no-javascript-urls.html"),
    "utf8",
  );
  assert.doesNotThrow(() => assertNoJavascriptUrls(safeUrls, "no-javascript-urls.html"));
});

test("every exported HTML document contains no plain http:// URLs", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertNoCleartextUrls(html, htmlFile);
  }
});

test("the cleartext URL scanner rejects plain HTTP and accepts safe URL forms", async () => {
  for (const [fixture, expectedError] of [
    ["http-href.html", /contains plain http:\/\/ URLs: "href" on <a>/],
    ["http-src.html", /contains plain http:\/\/ URLs: "src" on <img>/],
    [
      "http-leading-space-uppercase.html",
      /contains plain http:\/\/ URLs: "formaction" on <button>/,
    ],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertNoCleartextUrls(html, fixture), expectedError);
  }

  const safeUrls = await readFile(
    path.join(staticExportFixtureDirectory, "no-http-urls.html"),
    "utf8",
  );
  assert.doesNotThrow(() => assertNoCleartextUrls(safeUrls, "no-http-urls.html"));
});

test('every exported HTML target="_blank" is protected from tabnabbing', async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertBlankTargetsUseNoopener(html, htmlFile);
  }
});

test('the target="_blank" scanner enforces protective rel tokens', async () => {
  for (const fixture of [
    "blank-target-missing-rel.html",
    "blank-target-empty-rel.html",
    "blank-target-nofollow-only.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertBlankTargetsUseNoopener(html, fixture),
      /contains target="_blank" elements without rel="noopener" or rel="noreferrer"/,
    );
  }

  for (const fixture of [
    "blank-target-noopener.html",
    "blank-target-noreferrer.html",
    "blank-target-noopener-noreferrer.html",
    "no-blank-target.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertBlankTargetsUseNoopener(html, fixture));
  }
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

test("every exported HTML document has one non-empty title and a character set", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertDocumentTitleAndCharset(html, htmlFile);
  }
});

test("exported HTML documents have unique trimmed titles", async () => {
  const files = await inventory(exportDirectory);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  const documents = await Promise.all(
    htmlFiles.map(async (sourceFile) => ({
      sourceFile,
      html: await readFile(path.join(exportDirectory, sourceFile), "utf8"),
    })),
  );

  assertUniqueDocumentTitles(documents);
});

test("the document-title scanner rejects collisions and accepts distinct titles", async () => {
  const readFixtures = (sourceFiles) =>
    Promise.all(
      sourceFiles.map(async (sourceFile) => ({
        sourceFile,
        html: await readFile(path.join(staticExportFixtureDirectory, sourceFile), "utf8"),
      })),
    );
  const duplicateTitles = await readFixtures([
    "duplicate-title-first.html",
    "duplicate-title-whitespace.html",
  ]);
  const distinctTitles = await readFixtures([
    "distinct-title-landing.html",
    "distinct-title-not-found.html",
  ]);

  assert.throws(
    () => assertUniqueDocumentTitles(duplicateTitles),
    /duplicate-title-whitespace\.html has duplicate document title "Store Canary" \(already used by duplicate-title-first\.html\)/,
  );
  assert.doesNotThrow(() => assertUniqueDocumentTitles(distinctTitles));
});

test("the title and character-set scanner rejects invalid document metadata", async () => {
  for (const [fixture, expectedError] of [
    ["missing-title.html", /must contain exactly one <title> element/],
    ["empty-title.html", /must contain a non-empty <title>/],
    ["whitespace-title.html", /must contain a non-empty <title>/],
    ["multiple-titles.html", /must contain exactly one <title> element/],
    ["missing-charset.html", /must contain a non-empty character-set declaration/],
    ["empty-charset.html", /must contain a non-empty character-set declaration/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertDocumentTitleAndCharset(html, fixture), expectedError);
  }

  assert.doesNotThrow(() =>
    assertDocumentTitleAndCharset(
      "<head><meta charset='UTF-8'><title>Store Canary</title></head>",
      "valid-charset.html",
    ),
  );
  assert.doesNotThrow(() =>
    assertDocumentTitleAndCharset(
      '<head><meta HTTP-EQUIV="Content-Type" content="text/html; charset=utf-8"><title>Store Canary</title></head>',
      "valid-content-type.html",
    ),
  );
});

test("every exported HTML document has one canonical Store Canary URL", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertCanonicalLink(html, htmlFile);
  }
});

test("the canonical-link scanner rejects missing or invalid canonicals", async () => {
  for (const [fixture, expectedError] of [
    ["canonical-missing.html", /must contain exactly one rel=canonical link/],
    ["canonical-duplicate.html", /must contain exactly one rel=canonical link/],
    ["canonical-empty.html", /canonical href must be non-empty/],
    ["canonical-relative.html", /canonical href must be an absolute URL/],
    ["canonical-http.html", /canonical href must use HTTPS/],
    ["canonical-wrong-host.html", /canonical href must use https:\/\/storecanary\.app/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertCanonicalLink(html, fixture), expectedError);
  }

  const valid = await readFile(
    path.join(staticExportFixtureDirectory, "canonical-valid.html"),
    "utf8",
  );
  assert.doesNotThrow(() => assertCanonicalLink(valid, "canonical-valid.html"));
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
