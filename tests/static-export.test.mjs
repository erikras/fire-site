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
const resourceSourceAttributeNames = new Set(["poster", "src", "srcset"]);
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
const validAriaHaspopupTokens = new Set([
  "false",
  "true",
  "menu",
  "listbox",
  "tree",
  "grid",
  "dialog",
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

function documentHtmlTags(html) {
  const tags = [];
  const rawTextElements = new Set([
    "iframe",
    "noembed",
    "noframes",
    "script",
    "style",
    "textarea",
    "title",
    "xmp",
  ]);
  const voidElements = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);
  let index = 0;

  const tagEnd = (start) => {
    let quote;

    for (let cursor = start; cursor < html.length; cursor += 1) {
      const character = html[cursor];

      if (quote) {
        if (character === quote) {
          quote = undefined;
        }
      } else if (character === '"' || character === "'") {
        quote = character;
      } else if (character === ">") {
        return cursor;
      }
    }

    return html.length - 1;
  };

  while (index < html.length) {
    const openingBracket = html.indexOf("<", index);
    if (openingBracket === -1) {
      break;
    }

    if (html.startsWith("<!--", openingBracket)) {
      const commentEnd = html.indexOf("-->", openingBracket + 4);
      index = commentEnd === -1 ? html.length : commentEnd + 3;
      continue;
    }

    const tagMatch = html.slice(openingBracket).match(/^<(\/?)([A-Za-z][A-Za-z0-9:-]*)/);
    if (!tagMatch) {
      index = openingBracket + 1;
      continue;
    }

    const isClosing = tagMatch[1] === "/";
    const name = tagMatch[2].toLowerCase();
    const end = tagEnd(openingBracket + tagMatch[0].length);
    const tag = html.slice(openingBracket, end + 1);
    index = end + 1;

    tags.push({
      name,
      tag,
      isClosing,
      isVoid: !isClosing && (voidElements.has(name) || /\/\s*>$/.test(tag)),
    });

    if (isClosing) {
      continue;
    }

    if (name === "plaintext") {
      break;
    }

    if (rawTextElements.has(name)) {
      const closingTag = new RegExp(`</${name}(?=[\\s/>])`, "gi");
      closingTag.lastIndex = index;
      const match = closingTag.exec(html);
      if (!match) {
        index = html.length;
        continue;
      }

      const closingEnd = tagEnd(match.index + match[0].length);
      tags.push({
        name,
        tag: html.slice(match.index, closingEnd + 1),
        isClosing: true,
        isVoid: false,
      });
      index = closingEnd + 1;
    }
  }

  return tags;
}

function documentElementStartTags(html) {
  return documentHtmlTags(html).filter(
    ({ name, isClosing }) =>
      !isClosing && (name === "html" || name === "head" || name === "body" || name === "h1"),
  );
}

function documentElementStartTagCounts(html) {
  const counts = { html: 0, head: 0, body: 0, h1: 0 };

  for (const { name } of documentElementStartTags(html)) {
    counts[name] += 1;
  }

  return counts;
}

function assertSingleHtmlAndBody(html, sourceFile) {
  const counts = documentElementStartTagCounts(html);

  assert.equal(
    counts.html,
    1,
    `${sourceFile} must contain exactly one <html> element (found ${counts.html})`,
  );
  assert.equal(
    counts.body,
    1,
    `${sourceFile} must contain exactly one <body> element (found ${counts.body})`,
  );
}

function assertBodyIsNotAriaHidden(html, sourceFile) {
  const hiddenBodies = documentElementStartTags(html)
    .filter(({ name }) => name === "body")
    .filter(({ tag }) =>
      attributeValues(tag, "aria-hidden").some((value) => value.trim() === "true"),
    )
    .map(({ tag }) => tag);

  assert.deepEqual(
    hiddenBodies,
    [],
    `${sourceFile} contains a <body> with aria-hidden="true": ${hiddenBodies.join(", ")}`,
  );
}

function assertSingleHead(html, sourceFile) {
  const { head } = documentElementStartTagCounts(html);

  assert.equal(head, 1, `${sourceFile} must contain exactly one <head> element (found ${head})`);
}

function assertSingleH1(html, sourceFile) {
  const { h1 } = documentElementStartTagCounts(html);

  assert.equal(h1, 1, `${sourceFile} must contain exactly one <h1> element (found ${h1})`);
}

function assertHtmlNamespace(html, sourceFile) {
  const htmlTags = documentElementStartTags(html).filter(({ name }) => name === "html");

  for (const { tag } of htmlTags) {
    for (const namespace of attributeValues(tag, "xmlns")) {
      assert.equal(
        namespace,
        "http://www.w3.org/1999/xhtml",
        `${sourceFile} <html> xmlns must be exactly "http://www.w3.org/1999/xhtml" when present`,
      );
    }
  }
}

function assertHtmlDirection(html, sourceFile) {
  const validDirections = new Set(["ltr", "rtl", "auto"]);
  const htmlTags = documentElementStartTags(html).filter(({ name }) => name === "html");

  for (const { tag } of htmlTags) {
    for (const direction of attributeValues(tag, "dir")) {
      assert.ok(
        validDirections.has(direction.trim().toLowerCase()),
        `${sourceFile} <html> dir must be "ltr", "rtl", or "auto" when present`,
      );
    }
  }
}

function assertIframesHaveNonEmptyTitles(html, sourceFile) {
  const untitledIframes = documentHtmlTags(html)
    .filter(({ name, isClosing }) => name === "iframe" && !isClosing)
    .filter(({ tag }) => !attributeValues(tag, "title").some((title) => title.trim()))
    .map(({ tag }) => tag);

  assert.deepEqual(
    untitledIframes,
    [],
    `${sourceFile} contains iframe elements without a non-empty title: ${untitledIframes.join(", ")}`,
  );
}

function assertImagesHaveValidAltText(html, sourceFile) {
  const invalidImages = documentHtmlTags(html)
    .filter(({ name, isClosing }) => name === "img" && !isClosing)
    .filter(({ tag }) => {
      const altValues = attributeValues(tag, "alt");
      return altValues.length === 0 || (altValues[0] !== "" && !altValues[0].trim());
    })
    .map(({ tag }) => tag);

  assert.deepEqual(
    invalidImages,
    [],
    `${sourceFile} contains img elements with missing or whitespace-only alt attributes: ${invalidImages.join(", ")}`,
  );
}

function assertAreasHaveNonEmptyAltText(html, sourceFile) {
  const invalidAreas = documentHtmlTags(html)
    .filter(({ name, isClosing }) => name === "area" && !isClosing)
    .filter(({ tag }) => {
      const altValues = attributeValues(tag, "alt");
      return altValues.length === 0 || !altValues[0].trim();
    })
    .map(({ tag }) => tag);

  assert.deepEqual(
    invalidAreas,
    [],
    `${sourceFile} contains area elements without a non-empty alt attribute: ${invalidAreas.join(", ")}`,
  );
}

function isElementVisible(element) {
  for (let current = element; current; current = current.parentElement) {
    const ariaHidden = current.getAttribute("aria-hidden")?.trim().toLowerCase();
    if (
      current.hasAttribute("hidden") ||
      ariaHidden === "true" ||
      current.style.display === "none" ||
      current.style.visibility === "hidden" ||
      current.style.visibility === "collapse"
    ) {
      return false;
    }
  }

  return true;
}

function visibleElementText(element) {
  if (!isElementVisible(element)) {
    return "";
  }

  const { Node } = element.ownerDocument.defaultView;
  return [...element.childNodes]
    .map((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? "";
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        return visibleElementText(node);
      }
      return "";
    })
    .join("");
}

function hasNonEmptyAccessibleName(element, { includeText = false, includeValue = false } = {}) {
  const { document } = element.ownerDocument.defaultView;

  if (element.hasAttribute("aria-labelledby")) {
    const value = element.getAttribute("aria-labelledby") ?? "";
    const referencedIds = value.trim() ? value.trim().split(/\s+/) : [];
    const referencedElements = referencedIds.map((id) => document.getElementById(id));

    return (
      referencedIds.length > 0 &&
      referencedElements.every((referencedElement) => referencedElement !== null) &&
      referencedElements
        .map((referencedElement) => visibleElementText(referencedElement))
        .join(" ")
        .trim().length > 0
    );
  }

  if (element.hasAttribute("aria-label")) {
    return (element.getAttribute("aria-label") ?? "").trim().length > 0;
  }

  const labelText = [...(element.labels ?? [])]
    .map((label) => visibleElementText(label))
    .join(" ")
    .trim();
  if (labelText) {
    return true;
  }

  if (includeText && visibleElementText(element).trim()) {
    return true;
  }

  return includeValue && (element.getAttribute("value") ?? "").trim().length > 0;
}

const landmarkRoles = new Set([
  "banner",
  "complementary",
  "contentinfo",
  "form",
  "main",
  "navigation",
  "region",
  "search",
]);
const sectioningElements = "article, aside, main, nav, section";

function normalizeAccessibleName(value) {
  return value.trim().replace(/\s+/gu, " ");
}

function landmarkAccessibleName(element) {
  const { document } = element.ownerDocument.defaultView;

  if (element.hasAttribute("aria-labelledby")) {
    const referencedIds = (element.getAttribute("aria-labelledby") ?? "").trim().split(/\s+/);
    if (referencedIds.length === 0 || referencedIds.includes("")) {
      return "";
    }

    const referencedElements = referencedIds.map((id) => document.getElementById(id));
    if (referencedElements.some((referencedElement) => referencedElement === null)) {
      return "";
    }

    return normalizeAccessibleName(
      referencedElements
        .map((referencedElement) => visibleElementText(referencedElement))
        .join(" "),
    );
  }

  return normalizeAccessibleName(element.getAttribute("aria-label") ?? "");
}

function nativeLandmarkRole(element, accessibleName) {
  const explicitRole = (element.getAttribute("role") ?? "")
    .trim()
    .split(/\s+/)
    .find((role) => validAriaRoleTokens.has(role));

  if (explicitRole) {
    return landmarkRoles.has(explicitRole) ? explicitRole : undefined;
  }

  switch (element.localName) {
    case "aside":
      return "complementary";
    case "footer":
      return element.parentElement?.closest(sectioningElements) ? undefined : "contentinfo";
    case "form":
      return accessibleName ? "form" : undefined;
    case "header":
      return element.parentElement?.closest(sectioningElements) ? undefined : "banner";
    case "main":
      return "main";
    case "nav":
      return "navigation";
    case "section":
      return accessibleName ? "region" : undefined;
    default:
      return undefined;
  }
}

function assertRepeatedLandmarksHaveUniqueAccessibleNames(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const landmarksByRole = new Map();

    for (const element of dom.window.document.querySelectorAll("*")) {
      if (!isElementVisible(element)) {
        continue;
      }

      const accessibleName = landmarkAccessibleName(element);
      const role = nativeLandmarkRole(element, accessibleName);
      if (!role) {
        continue;
      }

      const landmarks = landmarksByRole.get(role) ?? [];
      landmarks.push({ accessibleName, element });
      landmarksByRole.set(role, landmarks);
    }

    const violations = [];
    for (const [role, landmarks] of landmarksByRole) {
      if (landmarks.length < 2) {
        continue;
      }

      const nameCounts = new Map();
      for (const { accessibleName } of landmarks) {
        if (accessibleName) {
          nameCounts.set(accessibleName, (nameCounts.get(accessibleName) ?? 0) + 1);
        }
      }

      if (landmarks.some(({ accessibleName }) => !accessibleName)) {
        violations.push(`${role} landmarks include an empty accessible name`);
      }
      for (const [accessibleName, count] of nameCounts) {
        if (count > 1) {
          violations.push(
            `${role} landmarks repeat accessible name ${JSON.stringify(accessibleName)}`,
          );
        }
      }
    }

    assert.deepEqual(
      violations,
      [],
      `${sourceFile} contains repeated same-type landmarks without unique non-empty accessible names: ${violations.join("; ")}`,
    );
  } finally {
    dom.window.close();
  }
}

const buttonInputTypes = new Set(["button", "reset", "submit"]);

function isButtonInput(element) {
  return element.localName === "input" && buttonInputTypes.has(element.type);
}

function assertFormControlsHaveAccessibleNames(html, sourceFile) {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  try {
    const unnamedControls = [...document.querySelectorAll("input, select, textarea")]
      .filter((control) => control.localName !== "input" || control.type !== "hidden")
      .filter((control) => !isButtonInput(control))
      .filter((control) => !hasNonEmptyAccessibleName(control))
      .map((control) => control.outerHTML);

    assert.deepEqual(
      unnamedControls,
      [],
      `${sourceFile} contains input, select, or textarea controls without a non-empty accessible name: ${unnamedControls.join(", ")}`,
    );
  } finally {
    dom.window.close();
  }
}

function assertButtonsHaveAccessibleNames(html, sourceFile) {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  try {
    const unnamedButtons = [...document.querySelectorAll("button, input")]
      .filter((control) => control.localName === "button" || isButtonInput(control))
      .filter(
        (control) =>
          !hasNonEmptyAccessibleName(control, {
            includeText: control.localName === "button",
            includeValue: isButtonInput(control),
          }),
      )
      .map((control) => control.outerHTML);

    assert.deepEqual(
      unnamedButtons,
      [],
      `${sourceFile} contains button controls without a non-empty accessible name: ${unnamedButtons.join(", ")}`,
    );
  } finally {
    dom.window.close();
  }
}

function assertTablesHaveAccessibleNames(html, sourceFile) {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  try {
    const unnamedTables = [...document.querySelectorAll("table")]
      .filter((table) => {
        const captionText = table.caption?.textContent ?? "";
        return !captionText.trim() && !hasNonEmptyAccessibleName(table);
      })
      .map((table) => table.outerHTML);

    assert.deepEqual(
      unnamedTables,
      [],
      `${sourceFile} contains table elements without a non-empty caption or accessible name: ${unnamedTables.join(", ")}`,
    );
  } finally {
    dom.window.close();
  }
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

function hasAttribute(tag, attributeName) {
  return attributeValues(tag, attributeName).length > 0;
}

function isFocusableStartTag(name, tag) {
  const isDisabled = hasAttribute(tag, "disabled");

  if (name === "a") {
    return hasAttribute(tag, "href");
  }
  if (name === "button") {
    return !isDisabled;
  }
  if (name === "input") {
    const type = attributeValues(tag, "type")[0]?.trim().toLowerCase();
    return type !== "hidden" && !isDisabled;
  }
  if (name === "select" || name === "textarea") {
    return !isDisabled;
  }
  if (name === "iframe" || name === "summary") {
    return true;
  }
  if (name === "audio" || name === "video") {
    return hasAttribute(tag, "controls");
  }
  if (hasAttribute(tag, "contenteditable")) {
    return true;
  }

  return attributeValues(tag, "tabindex").some((value) => value.trim() !== "-1");
}

function assertAriaHiddenContainsNoFocusableElements(html, sourceFile) {
  const openElements = [];
  const focusableElements = [];
  let hiddenDepth = 0;

  for (const { name, tag, isClosing, isVoid } of documentHtmlTags(html)) {
    if (isClosing) {
      const openingIndex = openElements.findLastIndex((element) => element.name === name);
      if (openingIndex !== -1) {
        for (const element of openElements.splice(openingIndex)) {
          hiddenDepth -= Number(element.isAriaHidden);
        }
      }
      continue;
    }

    const isAriaHidden = attributeValues(tag, "aria-hidden").some(
      (value) => value.trim() === "true",
    );
    if ((hiddenDepth > 0 || isAriaHidden) && isFocusableStartTag(name, tag)) {
      focusableElements.push(`<${name}>`);
    }

    if (!isVoid) {
      openElements.push({ name, isAriaHidden });
      hiddenDepth += Number(isAriaHidden);
    }
  }

  assert.deepEqual(
    focusableElements,
    [],
    `${sourceFile} contains focusable elements inside aria-hidden="true" subtrees: ${focusableElements.join(", ")}`,
  );
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

function assertValidAriaHaspopupValues(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const invalidValues = [...dom.window.document.querySelectorAll("[aria-haspopup]")]
      .map((element) => element.getAttribute("aria-haspopup") ?? "")
      .filter((value) => !validAriaHaspopupTokens.has(value.trim().toLowerCase()));

    assert.deepEqual(
      invalidValues,
      [],
      `${sourceFile} contains invalid aria-haspopup values: ${invalidValues
        .map((value) => JSON.stringify(value))
        .join(", ")}; expected false, true, menu, listbox, tree, grid, or dialog when present`,
    );
  } finally {
    dom.window.close();
  }
}

function assertNoAriaBusyTrue(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const busyElements = [...dom.window.document.querySelectorAll("*")]
      .filter((element) =>
        element
          .getAttributeNames()
          .some(
            (attributeName) =>
              attributeName.toLowerCase() === "aria-busy" &&
              element.getAttribute(attributeName)?.trim().toLowerCase() === "true",
          ),
      )
      .map((element) => element.outerHTML);

    assert.deepEqual(
      busyElements,
      [],
      `${sourceFile} contains elements with aria-busy="true": ${busyElements.join(", ")}`,
    );
  } finally {
    dom.window.close();
  }
}

function assertNoAriaInvalidTrue(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const invalidElements = [...dom.window.document.querySelectorAll("*")]
      .filter((element) =>
        element
          .getAttributeNames()
          .some(
            (attributeName) =>
              attributeName.toLowerCase() === "aria-invalid" &&
              element.getAttribute(attributeName)?.trim().toLowerCase() === "true",
          ),
      )
      .map((element) => element.outerHTML);

    assert.deepEqual(
      invalidElements,
      [],
      `${sourceFile} contains elements with aria-invalid="true": ${invalidElements.join(", ")}`,
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

function assertNoAutofocusAttributes(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const autofocusAttributes = [...dom.window.document.querySelectorAll("[autofocus]")].map(
      (element) =>
        `"autofocus" on <${element.localName}>: ${JSON.stringify(
          element.getAttribute("autofocus"),
        )}`,
    );

    assert.deepEqual(
      autofocusAttributes,
      [],
      `${sourceFile} contains autofocus attributes: ${autofocusAttributes.join(", ")}`,
    );
  } finally {
    dom.window.close();
  }
}

function assertNoAccesskeyAttributes(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const accesskeyAttributes = [...dom.window.document.querySelectorAll("[accesskey]")].map(
      (element) =>
        `"accesskey" on <${element.localName}>: ${JSON.stringify(
          element.getAttribute("accesskey"),
        )}`,
    );

    assert.deepEqual(
      accesskeyAttributes,
      [],
      `${sourceFile} contains accesskey attributes: ${accesskeyAttributes.join(", ")}`,
    );
  } finally {
    dom.window.close();
  }
}

function assertNoPingAttributes(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const pingAttributes = [...dom.window.document.querySelectorAll("[ping]")].map(
      (element) =>
        `"ping" on <${element.localName}>: ${JSON.stringify(element.getAttribute("ping"))}`,
    );

    assert.deepEqual(
      pingAttributes,
      [],
      `${sourceFile} contains ping attributes: ${pingAttributes.join(", ")}`,
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

function assertNoDataLinkUrls(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const dataUrls = [...dom.window.document.querySelectorAll("a[href], area[href], link[href]")]
      .filter((element) => /^\s*data:/i.test(element.getAttribute("href") ?? ""))
      .map(
        (element) => `"href" on <${element.localName}>: "${element.getAttribute("href") ?? ""}"`,
      );

    assert.deepEqual(
      dataUrls,
      [],
      `${sourceFile} contains data: link URLs: ${dataUrls.join(", ")}`,
    );
  } finally {
    dom.window.close();
  }
}

function assertNoEmptyLinkHrefs(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const emptyHrefs = [...dom.window.document.querySelectorAll("a[href], area[href], link[href]")]
      .filter((element) => !(element.getAttribute("href") ?? "").trim())
      .map(
        (element) =>
          `"href" on <${element.localName}>: ${JSON.stringify(element.getAttribute("href") ?? "")}`,
      );

    assert.deepEqual(
      emptyHrefs,
      [],
      `${sourceFile} contains empty href attributes: ${emptyHrefs.join(", ")}`,
    );
  } finally {
    dom.window.close();
  }
}

function assertNoDataResourceUrls(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const dataUrls = [...dom.window.document.querySelectorAll("*")].flatMap((element) =>
      element
        .getAttributeNames()
        .filter((attributeName) => resourceSourceAttributeNames.has(attributeName.toLowerCase()))
        .filter((attributeName) => {
          const value = element.getAttribute(attributeName) ?? "";
          return attributeName.toLowerCase() === "srcset"
            ? /(?:^|,)\s*data:/i.test(value)
            : /^\s*data:/i.test(value);
        })
        .map((attributeName) => {
          const value = element.getAttribute(attributeName) ?? "";
          return `"${attributeName}" on <${element.localName}>: "${value}"`;
        }),
    );

    assert.deepEqual(
      dataUrls,
      [],
      `${sourceFile} contains data: resource source URLs: ${dataUrls.join(", ")}`,
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

function assertDownloadUrlsStayOnCanonicalOrigin(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    for (const element of dom.window.document.querySelectorAll("a[download], area[download]")) {
      const href = element.getAttribute("href");
      assert.ok(
        href?.trim(),
        `${sourceFile} <${element.localName} download> href must be non-empty`,
      );

      let url;
      try {
        url = new URL(href, `${canonicalOrigin}/`);
      } catch (error) {
        assert.fail(
          `${sourceFile} contains an invalid <${element.localName} download> href "${href}": ${error.message}`,
        );
      }

      assert.equal(
        url.origin,
        canonicalOrigin,
        `${sourceFile} <${element.localName} download> href must stay on ${canonicalOrigin}: "${href}"`,
      );
    }
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

function assertExactlyOneNonEmptyMetaDescription(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const descriptions = [...dom.window.document.querySelectorAll("meta")].filter(
      (meta) => meta.getAttribute("name")?.toLowerCase() === "description",
    );

    assert.equal(descriptions.length, 1, `${sourceFile} must contain exactly one meta description`);
    assert.ok(
      descriptions[0].getAttribute("content")?.trim(),
      `${sourceFile} meta description content must be non-empty`,
    );
  } finally {
    dom.window.close();
  }
}

function assertNoMetaRefresh(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const refreshMetadata = [...dom.window.document.querySelectorAll("meta")]
      .filter((meta) => meta.getAttribute("http-equiv")?.trim().toLowerCase() === "refresh")
      .map((meta) => meta.outerHTML);

    assert.deepEqual(
      refreshMetadata,
      [],
      `${sourceFile} contains meta refresh directives: ${refreshMetadata.join(", ")}`,
    );
  } finally {
    dom.window.close();
  }
}

function assertLandingPageAllowsIndexing(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const disallowedDirectives = [...dom.window.document.querySelectorAll("meta")]
      .filter((meta) => meta.getAttribute("name")?.trim().toLowerCase() === "robots")
      .flatMap((meta) =>
        (meta.getAttribute("content") ?? "")
          .toLowerCase()
          .split(/[\s,]+/)
          .filter((token) => token === "noindex" || token === "none"),
      );

    assert.deepEqual(
      disallowedDirectives,
      [],
      `${sourceFile} meta robots must not contain noindex or none`,
    );
  } finally {
    dom.window.close();
  }
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

function assertBaseUrlsStayOnCanonicalOrigin(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    for (const base of dom.window.document.querySelectorAll("base[href]")) {
      const href = base.getAttribute("href") ?? "";

      assert.doesNotMatch(
        href,
        /^\s*[/\\]{2}/,
        `${sourceFile} base href must not be protocol-relative: "${href}"`,
      );

      let url;
      try {
        url = new URL(href, `${canonicalOrigin}/`);
      } catch (error) {
        assert.fail(`${sourceFile} contains an invalid base href "${href}": ${error.message}`);
      }

      assert.equal(
        url.origin,
        canonicalOrigin,
        `${sourceFile} base href must stay on ${canonicalOrigin}: "${href}"`,
      );
    }
  } finally {
    dom.window.close();
  }
}

function assertManifestUrlsStayOnCanonicalOrigin(html, sourceFile) {
  const dom = new JSDOM(html);

  try {
    const manifestLinks = [...dom.window.document.querySelectorAll("link")].filter((link) =>
      (link.getAttribute("rel") ?? "")
        .split(/\s+/)
        .some((token) => token.toLowerCase() === "manifest"),
    );

    for (const link of manifestLinks) {
      const href = (link.getAttribute("href") ?? "").trim();
      assert.ok(href, `${sourceFile} manifest href must be non-empty`);

      let url;
      try {
        url = new URL(href, `${canonicalOrigin}/`);
      } catch (error) {
        assert.fail(`${sourceFile} contains an invalid manifest href "${href}": ${error.message}`);
      }

      assert.equal(
        url.origin,
        canonicalOrigin,
        `${sourceFile} manifest href must stay on ${canonicalOrigin}: "${href}"`,
      );
    }
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

test("every exported HTML document has exactly one html and one body element", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertSingleHtmlAndBody(html, htmlFile);
  }
});

test("the document-element scanner enforces one html and one body element", async () => {
  for (const [fixture, expectedError] of [
    ["document-missing-html.html", /exactly one <html> element \(found 0\)/],
    ["document-missing-body.html", /exactly one <body> element \(found 0\)/],
    ["document-two-html.html", /exactly one <html> element \(found 2\)/],
    ["document-two-body.html", /exactly one <body> element \(found 2\)/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertSingleHtmlAndBody(html, fixture), expectedError);
  }

  const valid = await readFile(
    path.join(staticExportFixtureDirectory, "document-elements-valid.html"),
    "utf8",
  );
  assert.doesNotThrow(() => assertSingleHtmlAndBody(valid, "document-elements-valid.html"));
});

test('every exported HTML document body does not have aria-hidden="true"', async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertBodyIsNotAriaHidden(html, htmlFile);
  }
});

test("the body aria-hidden scanner accepts omitted, false, and lookalike attributes", async () => {
  for (const fixture of [
    "body-aria-hidden-omitted.html",
    "body-aria-hidden-false.html",
    "body-aria-hidden-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertBodyIsNotAriaHidden(html, fixture));
  }
});

test('the body aria-hidden scanner rejects aria-hidden="true"', async () => {
  for (const fixture of ["body-aria-hidden-true.html", "body-aria-hidden-mixed-case.html"]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertBodyIsNotAriaHidden(html, fixture),
      /contains a <body> with aria-hidden="true"/,
    );
  }
});

test("every exported HTML document has exactly one head element", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertSingleHead(html, htmlFile);
  }
});

test("the document-element scanner enforces one head element", async () => {
  for (const [fixture, expectedError] of [
    ["document-missing-head.html", /exactly one <head> element \(found 0\)/],
    ["document-two-heads.html", /exactly one <head> element \(found 2\)/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertSingleHead(html, fixture), expectedError);
  }

  const valid = await readFile(
    path.join(staticExportFixtureDirectory, "document-head-lookalikes-valid.html"),
    "utf8",
  );
  assert.doesNotThrow(() => assertSingleHead(valid, "document-head-lookalikes-valid.html"));
});

test("every exported HTML document has exactly one h1 element", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertSingleH1(html, htmlFile);
  }
});

test("the document-element scanner enforces one h1 element", async () => {
  for (const [fixture, expectedError] of [
    ["document-missing-h1.html", /exactly one <h1> element \(found 0\)/],
    ["document-two-h1s.html", /exactly one <h1> element \(found 2\)/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertSingleH1(html, fixture), expectedError);
  }

  const valid = await readFile(
    path.join(staticExportFixtureDirectory, "document-h1-lookalikes-valid.html"),
    "utf8",
  );
  assert.doesNotThrow(() => assertSingleH1(valid, "document-h1-lookalikes-valid.html"));
});

test("every exported html element uses the HTML namespace when xmlns is present", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertHtmlNamespace(html, htmlFile);
  }
});

test("the html namespace scanner accepts absent and exact HTML namespaces", async () => {
  for (const fixture of [
    "html-xmlns-none.html",
    "html-xmlns-valid.html",
    "html-xmlns-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertHtmlNamespace(html, fixture));
  }
});

test("the html namespace scanner rejects empty and non-HTML namespaces", async () => {
  for (const fixture of [
    "html-xmlns-empty.html",
    "html-xmlns-whitespace.html",
    "html-xmlns-wrong.html",
    "html-xmlns-svg.html",
    "html-xmlns-mathml.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertHtmlNamespace(html, fixture),
      /<html> xmlns must be exactly "http:\/\/www\.w3\.org\/1999\/xhtml" when present/,
    );
  }
});

test("every exported html element has a valid direction when dir is present", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertHtmlDirection(html, htmlFile);
  }
});

test("the html direction scanner accepts omitted, ltr, rtl, auto, and lookalike values", async () => {
  for (const fixture of [
    "html-dir-none.html",
    "html-dir-ltr.html",
    "html-dir-rtl.html",
    "html-dir-auto.html",
    "html-dir-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertHtmlDirection(html, fixture));
  }
});

test("the html direction scanner rejects empty, whitespace-only, and unknown values", async () => {
  for (const fixture of [
    "html-dir-empty.html",
    "html-dir-whitespace.html",
    "html-dir-invalid.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertHtmlDirection(html, fixture),
      /<html> dir must be "ltr", "rtl", or "auto" when present/,
    );
  }
});

test("every exported iframe has a non-empty title", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertIframesHaveNonEmptyTitles(html, htmlFile);
  }
});

test("the iframe title scanner accepts absent, titled, and lookalike iframes", async () => {
  for (const fixture of [
    "iframe-none.html",
    "iframe-titled.html",
    "iframe-comment-text-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertIframesHaveNonEmptyTitles(html, fixture));
  }
});

test("the iframe title scanner rejects missing, empty, and whitespace-only titles", async () => {
  for (const fixture of [
    "iframe-title-missing.html",
    "iframe-title-empty.html",
    "iframe-title-whitespace.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertIframesHaveNonEmptyTitles(html, fixture),
      /contains iframe elements without a non-empty title/,
    );
  }
});

test("every exported image has an alt attribute", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertImagesHaveValidAltText(html, htmlFile);
  }
});

test("the image alt scanner accepts absent, informative, decorative, and lookalike images", async () => {
  for (const fixture of [
    "image-none.html",
    "image-informative-alt.html",
    "image-decorative-alt.html",
    "image-comment-text-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertImagesHaveValidAltText(html, fixture));
  }
});

test("the image alt scanner rejects missing and whitespace-only alt attributes", async () => {
  for (const fixture of ["image-alt-missing.html", "image-alt-whitespace.html"]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertImagesHaveValidAltText(html, fixture),
      /contains img elements with missing or whitespace-only alt attributes/,
    );
  }
});

test("every exported image-map area has a non-empty alt attribute", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertAreasHaveNonEmptyAltText(html, htmlFile);
  }
});

test("the area alt scanner accepts named areas, lookalikes, and documents without areas", async () => {
  for (const fixture of [
    "area-named.html",
    "area-comment-text-lookalikes.html",
    "area-none.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertAreasHaveNonEmptyAltText(html, fixture));
  }
});

test("the area alt scanner rejects missing, empty, and whitespace-only alt attributes", async () => {
  for (const fixture of [
    "area-alt-missing.html",
    "area-alt-empty.html",
    "area-alt-whitespace.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertAreasHaveNonEmptyAltText(html, fixture),
      /contains area elements without a non-empty alt attribute/,
    );
  }
});

test("every exported non-button input, select, and textarea has a non-empty accessible name", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertFormControlsHaveAccessibleNames(html, htmlFile);
  }
});

test("the form-control name scanner accepts labels, ARIA names, hidden inputs, and lookalikes", async () => {
  for (const fixture of [
    "form-control-labels.html",
    "form-control-aria-label.html",
    "form-control-aria-labelledby.html",
    "form-control-hidden-input.html",
    "form-control-comment-text-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertFormControlsHaveAccessibleNames(html, fixture));
  }
});

test("the form-control name scanner rejects missing and empty accessible names", async () => {
  for (const fixture of [
    "form-control-unlabeled-input.html",
    "form-control-unlabeled-select.html",
    "form-control-unlabeled-textarea.html",
    "form-control-whitespace-aria-label.html",
    "form-control-missing-aria-labelledby.html",
    "form-control-empty-aria-labelledby-text.html",
    "form-control-hidden-aria-labelledby-text.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertFormControlsHaveAccessibleNames(html, fixture),
      /contains input, select, or textarea controls without a non-empty accessible name/,
    );
  }
});

test("every exported button control has a non-empty accessible name", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertButtonsHaveAccessibleNames(html, htmlFile);
  }
});

test("the button name scanner accepts text, labels, ARIA names, values, and lookalikes", async () => {
  for (const fixture of [
    "button-text.html",
    "button-label.html",
    "button-aria-label.html",
    "button-aria-labelledby.html",
    "button-input-values.html",
    "button-comment-text-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertButtonsHaveAccessibleNames(html, fixture));
  }
});

test("the button name scanner rejects missing and empty accessible names", async () => {
  for (const fixture of [
    "button-empty.html",
    "button-whitespace.html",
    "button-icon-only.html",
    "button-whitespace-aria-label.html",
    "button-missing-aria-labelledby.html",
    "button-empty-aria-labelledby-text.html",
    "button-hidden-aria-labelledby-text.html",
    "button-input-empty-values.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertButtonsHaveAccessibleNames(html, fixture),
      /contains button controls without a non-empty accessible name/,
    );
  }
});

test("every exported table has a non-empty caption or accessible name", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertTablesHaveAccessibleNames(html, htmlFile);
  }
});

test("the table name scanner accepts captions, ARIA names, lookalikes, and documents without tables", async () => {
  for (const fixture of [
    "table-captioned.html",
    "table-aria-label.html",
    "table-aria-labelledby.html",
    "table-comment-text-lookalikes.html",
    "table-none.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertTablesHaveAccessibleNames(html, fixture));
  }
});

test("the table name scanner rejects missing and whitespace-only names", async () => {
  for (const fixture of [
    "table-unlabeled.html",
    "table-whitespace-caption.html",
    "table-whitespace-aria-label.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertTablesHaveAccessibleNames(html, fixture),
      /contains table elements without a non-empty caption or accessible name/,
    );
  }
});

test("repeated same-type landmarks in exported HTML have unique non-empty accessible names", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertRepeatedLandmarksHaveUniqueAccessibleNames(html, htmlFile);
  }
});

test("the repeated-landmark scanner accepts single, distinctly named, and lookalike landmarks", async () => {
  for (const fixture of [
    "landmark-one-nav-unnamed.html",
    "landmark-two-navs-distinct-names.html",
    "landmark-all-types-distinct-names.html",
    "landmark-comment-text-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertRepeatedLandmarksHaveUniqueAccessibleNames(html, fixture));
  }
});

test("the repeated-landmark scanner rejects empty and duplicate accessible names", async () => {
  for (const [fixture, expectedError] of [
    ["landmark-two-navs-unnamed.html", /navigation landmarks include an empty accessible name/],
    [
      "landmark-two-asides-same-name.html",
      /complementary landmarks repeat accessible name "Related"/,
    ],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertRepeatedLandmarksHaveUniqueAccessibleNames(html, fixture),
      expectedError,
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

test("every exported HTML aria-haspopup attribute uses a recognized WAI-ARIA 1.2 token", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertValidAriaHaspopupValues(html, htmlFile);
  }
});

test("the aria-haspopup scanner accepts omitted, recognized, mixed-case, and lookalike values", async () => {
  for (const fixture of [
    "aria-haspopup-omitted.html",
    "aria-haspopup-true.html",
    "aria-haspopup-menu.html",
    "aria-haspopup-dialog.html",
    "aria-haspopup-other-recognized-tokens.html",
    "aria-haspopup-mixed-case.html",
    "aria-haspopup-comment-text-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertValidAriaHaspopupValues(html, fixture));
  }
});

test("the aria-haspopup scanner rejects empty, whitespace-only, and unknown values", async () => {
  for (const fixture of [
    "aria-haspopup-empty.html",
    "aria-haspopup-whitespace.html",
    "aria-haspopup-bogus.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertValidAriaHaspopupValues(html, fixture),
      /contains invalid aria-haspopup values/,
    );
  }
});

test('every exported HTML document contains no aria-busy="true" attributes', async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertNoAriaBusyTrue(html, htmlFile);
  }
});

test("the aria-busy scanner accepts omitted, false, and comment or text lookalikes", async () => {
  for (const fixture of [
    "aria-busy-omitted.html",
    "aria-busy-false.html",
    "aria-busy-comment-text-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertNoAriaBusyTrue(html, fixture));
  }
});

test("the aria-busy scanner rejects true values case-insensitively", async () => {
  for (const fixture of ["aria-busy-true.html", "aria-busy-mixed-case.html"]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertNoAriaBusyTrue(html, fixture),
      /contains elements with aria-busy="true"/,
    );
  }
});

test('every exported HTML document contains no aria-invalid="true" attributes', async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertNoAriaInvalidTrue(html, htmlFile);
  }
});

test("the aria-invalid scanner accepts omitted, false, and comment or text lookalikes", async () => {
  for (const fixture of [
    "aria-invalid-omitted.html",
    "aria-invalid-false.html",
    "aria-invalid-comment-text-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertNoAriaInvalidTrue(html, fixture));
  }
});

test("the aria-invalid scanner rejects true values case-insensitively", async () => {
  for (const fixture of ["aria-invalid-true.html", "aria-invalid-mixed-case.html"]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertNoAriaInvalidTrue(html, fixture),
      /contains elements with aria-invalid="true"/,
    );
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

test('every exported HTML aria-hidden="true" subtree contains no focusable elements', async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertAriaHiddenContainsNoFocusableElements(html, htmlFile);
  }
});

test("the aria-hidden focus scanner accepts decorative, disabled, and lookalike content", async () => {
  for (const fixture of [
    "aria-hidden-decorative-valid.html",
    "aria-hidden-disabled-controls-valid.html",
    "aria-hidden-lookalikes-valid.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertAriaHiddenContainsNoFocusableElements(html, fixture));
  }
});

test("the aria-hidden focus scanner rejects hidden links, tabindex controls, and nesting", async () => {
  for (const [fixture, expectedElement] of [
    ["aria-hidden-link.html", "<a>"],
    ["aria-hidden-tabindex.html", "<div>"],
    ["aria-hidden-nested.html", "<button>"],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertAriaHiddenContainsNoFocusableElements(html, fixture),
      new RegExp(`focusable elements inside aria-hidden="true" subtrees: ${expectedElement}`),
    );
  }
});

test("the aria-hidden focus scanner recognizes every supported focusable element", async () => {
  const fixture = "aria-hidden-focusable-controls.html";
  const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");

  assert.throws(
    () => assertAriaHiddenContainsNoFocusableElements(html, fixture),
    (error) => {
      assert.match(error.message, /focusable elements inside aria-hidden="true" subtrees/);
      for (const element of [
        "<button>",
        "<input>",
        "<select>",
        "<textarea>",
        "<iframe>",
        "<audio>",
        "<video>",
        "<summary>",
        "<span>",
        "<div>",
        "<a>",
      ]) {
        assert.match(error.message, new RegExp(element));
      }
      return true;
    },
  );
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

test("every exported HTML document contains no autofocus attributes", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertNoAutofocusAttributes(html, htmlFile);
  }
});

test("the autofocus scanner rejects boolean and valued attributes", async () => {
  for (const [fixture, expectedError] of [
    ["autofocus-boolean.html", /"autofocus" on <input>: ""/],
    ["autofocus-empty.html", /"autofocus" on <textarea>: ""/],
    ["autofocus-valued.html", /"autofocus" on <select>: "autofocus"/],
    ["autofocus-other-value.html", /"autofocus" on <button>: "unexpected"/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertNoAutofocusAttributes(html, fixture), expectedError);
  }

  for (const fixture of ["no-autofocus.html", "autofocus-lookalikes.html"]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertNoAutofocusAttributes(html, fixture));
  }
});

test("every exported HTML document contains no accesskey attributes", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertNoAccesskeyAttributes(html, htmlFile);
  }
});

test("the accesskey scanner rejects boolean, empty, and valued attributes", async () => {
  for (const [fixture, expectedError] of [
    ["accesskey-boolean.html", /"accesskey" on <button>: ""/],
    ["accesskey-empty.html", /"accesskey" on <a>: ""/],
    ["accesskey-valued.html", /"accesskey" on <input>: "s"/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertNoAccesskeyAttributes(html, fixture), expectedError);
  }

  for (const fixture of ["no-accesskey.html", "accesskey-lookalikes.html"]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertNoAccesskeyAttributes(html, fixture));
  }
});

test("every exported HTML document contains no ping attributes", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertNoPingAttributes(html, htmlFile);
  }
});

test("the ping scanner rejects present, empty, and mixed-case attributes", async () => {
  for (const [fixture, expectedError] of [
    ["ping-present.html", /"ping" on <a>: "https:\/\/tracker\.example\/audit"/],
    ["ping-empty.html", /"ping" on <area>: ""/],
    ["ping-mixed-case.html", /"ping" on <a>: "https:\/\/tracker\.example\/mixed-case"/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertNoPingAttributes(html, fixture), expectedError);
  }

  for (const fixture of ["no-ping.html", "ping-comment-text-lookalikes.html"]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertNoPingAttributes(html, fixture));
  }
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

test("every exported HTML document contains no data: link URLs", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertNoDataLinkUrls(html, htmlFile);
  }
});

test("the link URL-scheme scanner rejects data: hrefs and accepts safe URL forms", async () => {
  for (const [fixture, expectedError] of [
    ["data-link-a.html", /contains data: link URLs: "href" on <a>/],
    ["data-link-area-uppercase.html", /contains data: link URLs: "href" on <area>/],
    ["data-link-link-leading-whitespace.html", /contains data: link URLs: "href" on <link>/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertNoDataLinkUrls(html, fixture), expectedError);
  }

  const safeUrls = await readFile(
    path.join(staticExportFixtureDirectory, "no-data-link-urls.html"),
    "utf8",
  );
  assert.doesNotThrow(() => assertNoDataLinkUrls(safeUrls, "no-data-link-urls.html"));
});

test("every exported link href is non-empty", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertNoEmptyLinkHrefs(html, htmlFile);
  }
});

test("the link href scanner rejects empty values and accepts non-empty hrefs and lookalikes", async () => {
  for (const [fixture, expectedError] of [
    ["empty-href-a.html", /contains empty href attributes: "href" on <a>: ""/],
    ["empty-href-area.html", /contains empty href attributes: "href" on <area>: ""/],
    ["whitespace-href-link.html", /contains empty href attributes: "href" on <link>:/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertNoEmptyLinkHrefs(html, fixture), expectedError);
  }

  for (const fixture of ["nonempty-link-hrefs.html", "empty-href-lookalikes.html"]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertNoEmptyLinkHrefs(html, fixture));
  }
});

test("every exported HTML document contains no data: resource source URLs", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertNoDataResourceUrls(html, htmlFile);
  }
});

test("the resource URL-scheme scanner rejects data: sources and accepts safe URL forms", async () => {
  for (const [fixture, expectedError] of [
    ["data-resource-src.html", /contains data: resource source URLs: "src" on <img>/],
    [
      "data-resource-srcset-candidate.html",
      /contains data: resource source URLs: "srcset" on <source>/,
    ],
    [
      "data-resource-poster-leading-whitespace.html",
      /contains data: resource source URLs: "poster" on <video>/,
    ],
    ["data-resource-src-uppercase.html", /contains data: resource source URLs: "src" on <script>/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertNoDataResourceUrls(html, fixture), expectedError);
  }

  const safeUrls = await readFile(
    path.join(staticExportFixtureDirectory, "no-data-resource-urls.html"),
    "utf8",
  );
  assert.doesNotThrow(() => assertNoDataResourceUrls(safeUrls, "no-data-resource-urls.html"));
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

test("every exported download link stays on the Store Canary origin", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertDownloadUrlsStayOnCanonicalOrigin(html, htmlFile);
  }
});

test("the download URL scanner accepts same-origin, relative, absent, and lookalike downloads", async () => {
  for (const fixture of [
    "download-same-origin.html",
    "download-relative.html",
    "download-none.html",
    "download-comment-text-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertDownloadUrlsStayOnCanonicalOrigin(html, fixture));
  }
});

test("the download URL scanner rejects cross-origin and unsupported download URLs", async () => {
  for (const fixture of [
    "download-cross-origin.html",
    "download-protocol-relative-cross-origin.html",
    "download-data.html",
    "download-javascript.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertDownloadUrlsStayOnCanonicalOrigin(html, fixture),
      /download> href must stay on https:\/\/storecanary\.app/,
    );
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

test("every exported HTML document has exactly one meta description with non-empty content", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertExactlyOneNonEmptyMetaDescription(html, htmlFile);
  }
});

test("the meta-description scanner accepts exactly one non-empty description", async () => {
  const html = await readFile(
    path.join(staticExportFixtureDirectory, "meta-description-valid.html"),
    "utf8",
  );

  assert.doesNotThrow(() => assertExactlyOneNonEmptyMetaDescription(html, "valid fixture"));
});

test("the meta-description scanner rejects missing, empty, whitespace-only, and multiple values", async () => {
  for (const [fixture, expectedError] of [
    ["meta-description-missing.html", /must contain exactly one meta description/],
    ["meta-description-empty.html", /meta description content must be non-empty/],
    ["meta-description-whitespace.html", /meta description content must be non-empty/],
    ["meta-description-multiple.html", /must contain exactly one meta description/],
    ["meta-description-lookalikes.html", /must contain exactly one meta description/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertExactlyOneNonEmptyMetaDescription(html, fixture), expectedError);
  }
});

test("every exported HTML document contains no meta refresh directives", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertNoMetaRefresh(html, htmlFile);
  }
});

test("the meta refresh scanner accepts absent, other http-equiv, and lookalike metadata", async () => {
  for (const fixture of ["meta-refresh-none.html", "meta-refresh-lookalikes.html"]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertNoMetaRefresh(html, fixture));
  }
});

test("the meta refresh scanner rejects delay, URL, mixed-case, and padded values", async () => {
  for (const fixture of [
    "meta-refresh-delay.html",
    "meta-refresh-url.html",
    "meta-refresh-mixed-case.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertNoMetaRefresh(html, fixture), /contains meta refresh directives/);
  }
});

test("the landing-page export does not block search indexing", async () => {
  const html = await readFile(path.join(exportDirectory, "index.html"), "utf8");

  assertLandingPageAllowsIndexing(html, "index.html");
});

test("the robots metadata scanner allows omitted and indexing-safe directives", async () => {
  for (const fixture of [
    "meta-robots-missing.html",
    "meta-robots-index.html",
    "meta-robots-nofollow.html",
    "meta-robots-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertLandingPageAllowsIndexing(html, fixture));
  }
});

test("the robots metadata scanner rejects noindex, none, and mixed directives", async () => {
  for (const fixture of [
    "meta-robots-noindex.html",
    "meta-robots-none.html",
    "meta-robots-mixed.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertLandingPageAllowsIndexing(html, fixture),
      /meta robots must not contain noindex or none/,
    );
  }
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

test("every base URL in exported HTML stays on the Store Canary origin", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertBaseUrlsStayOnCanonicalOrigin(html, htmlFile);
  }
});

test("the base URL scanner accepts absent and same-origin bases", async () => {
  for (const fixture of [
    "base-none.html",
    "base-same-origin-absolute.html",
    "base-same-origin-relative.html",
    "base-empty-relative.html",
    "base-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertBaseUrlsStayOnCanonicalOrigin(html, fixture));
  }
});

test("the base URL scanner rejects unsafe origins and schemes", async () => {
  for (const [fixture, expectedError] of [
    ["base-cross-origin.html", /base href must stay on https:\/\/storecanary\.app/],
    ["base-http.html", /base href must stay on https:\/\/storecanary\.app/],
    ["base-javascript.html", /base href must stay on https:\/\/storecanary\.app/],
    ["base-data.html", /base href must stay on https:\/\/storecanary\.app/],
    ["base-protocol-relative.html", /base href must not be protocol-relative/],
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(() => assertBaseUrlsStayOnCanonicalOrigin(html, fixture), expectedError);
  }
});

test("every manifest URL in exported HTML stays on the Store Canary origin", async () => {
  const files = await inventory(exportDirectory);

  for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(path.join(exportDirectory, htmlFile), "utf8");
    assertManifestUrlsStayOnCanonicalOrigin(html, htmlFile);
  }
});

test("the manifest URL scanner accepts absent, same-origin, and lookalike manifests", async () => {
  for (const fixture of [
    "manifest-none.html",
    "manifest-same-origin-relative.html",
    "manifest-same-origin-absolute.html",
    "manifest-lookalikes.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.doesNotThrow(() => assertManifestUrlsStayOnCanonicalOrigin(html, fixture));
  }
});

test("the manifest URL scanner rejects unsafe origins and schemes", async () => {
  for (const fixture of [
    "manifest-cross-origin.html",
    "manifest-protocol-relative-cross-origin.html",
    "manifest-data.html",
    "manifest-javascript.html",
  ]) {
    const html = await readFile(path.join(staticExportFixtureDirectory, fixture), "utf8");
    assert.throws(
      () => assertManifestUrlsStayOnCanonicalOrigin(html, fixture),
      /manifest href must stay on https:\/\/storecanary\.app/,
    );
  }
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
