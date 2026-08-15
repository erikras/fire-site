import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { prohibitedMarketingClaims, supportedDailyOpsExceptions } from "../marketing-copy-contract";

async function expectReflowContractToHold(page: Page) {
  const issues = await page.evaluate(() => {
    const tolerance = 1;
    const findings: string[] = [];
    const contentRoot = document.querySelector("body");

    if (!contentRoot) {
      return ["The document has no body"];
    }

    // Tailwind scans test sources, so split layout keywords to avoid emitting test-only utilities.
    const clippedOverflow = ["cl", "ip"].join("");
    const concealedOverflow = ["hid", "den"].join("");
    const flexDisplay = ["fl", "ex"].join("");
    const gridDisplay = ["gr", "id"].join("");
    const describe = (element: Element) => {
      const id = element.id ? `#${element.id}` : "";
      const classes = Array.from(element.classList)
        .map((className) => `.${className}`)
        .join("");
      return `${element.tagName.toLowerCase()}${id}${classes}`;
    };
    const isRendered = (element: Element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== concealedOverflow &&
        Number.parseFloat(style.opacity) !== 0 &&
        rect.width > 0 &&
        rect.height > 0
      );
    };
    const overlaps = (first: DOMRect, second: DOMRect) =>
      Math.min(first.right, second.right) - Math.max(first.left, second.left) > tolerance &&
      Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top) > tolerance;

    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + tolerance) {
      findings.push(
        `document horizontally overflows by ${
          document.documentElement.scrollWidth - document.documentElement.clientWidth
        }px`,
      );
    }

    const elements = Array.from(contentRoot.querySelectorAll("header *, main *, footer *")).filter(
      isRendered,
    );

    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      if (rect.left < -tolerance || rect.right > window.innerWidth + tolerance) {
        findings.push(
          `${describe(element)} extends outside the horizontal viewport (${rect.left.toFixed(
            1,
          )}..${rect.right.toFixed(1)})`,
        );
      }

      const style = getComputedStyle(element);
      if (
        (style.overflowX === concealedOverflow || style.overflowX === clippedOverflow) &&
        element.scrollWidth > element.clientWidth + tolerance
      ) {
        findings.push(`${describe(element)} clips content horizontally`);
      }
      if (
        (style.overflowY === concealedOverflow || style.overflowY === clippedOverflow) &&
        element.scrollHeight > element.clientHeight + tolerance
      ) {
        findings.push(`${describe(element)} clips content vertically`);
      }

      if (style.display !== flexDisplay && style.display !== gridDisplay) {
        continue;
      }

      const children = Array.from(element.children).filter(isRendered);
      for (let firstIndex = 0; firstIndex < children.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < children.length; secondIndex += 1) {
          if (
            overlaps(
              children[firstIndex].getBoundingClientRect(),
              children[secondIndex].getBoundingClientRect(),
            )
          ) {
            findings.push(
              `${describe(children[firstIndex])} overlaps ${describe(children[secondIndex])}`,
            );
          }
        }
      }
    }

    const textFragments = elements.flatMap((element) =>
      Array.from(element.childNodes)
        .filter(
          (node): node is Text =>
            node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
        )
        .flatMap((node) => {
          const range = document.createRange();
          range.setStart(node, 0);
          range.setEnd(node, node.length);
          return Array.from(range.getClientRects()).map((rect) => ({ element, rect }));
        }),
    );

    for (let firstIndex = 0; firstIndex < textFragments.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < textFragments.length; secondIndex += 1) {
        const first = textFragments[firstIndex];
        const second = textFragments[secondIndex];
        if (
          first.element !== second.element &&
          !first.element.contains(second.element) &&
          !second.element.contains(first.element) &&
          overlaps(first.rect, second.rect)
        ) {
          findings.push(
            `text in ${describe(first.element)} overlaps text in ${describe(second.element)}`,
          );
        }
      }
    }

    return [...new Set(findings)].slice(0, 30);
  });

  expect(issues, "reflow contract violations").toEqual([]);
}

async function expectTextToRemainReadable(locator: Locator, label: string) {
  await expect(locator, `${label} should be present`).not.toHaveCount(0);

  const issues = await locator.evaluateAll((elements) => {
    const tolerance = 1;
    const findings: string[] = [];
    // Tailwind scans test sources, so split layout keywords to avoid emitting test-only utilities.
    const clippedOverflow = ["cl", "ip"].join("");
    const concealedOverflow = ["hid", "den"].join("");
    const clippedValues = new Set([clippedOverflow, concealedOverflow]);
    const describe = (element: Element, index: number) => {
      const id = element.id ? `#${element.id}` : "";
      const classes = Array.from(element.classList)
        .map((className) => `.${className}`)
        .join("");
      return `${element.tagName.toLowerCase()}${id}${classes}[${index}]`;
    };

    for (const [index, element] of elements.entries()) {
      const name = describe(element, index);
      const text = element.textContent?.trim() ?? "";
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();

      if (!text) {
        findings.push(`${name} has no readable text`);
        continue;
      }
      if (
        style.display === "none" ||
        style.visibility === concealedOverflow ||
        Number.parseFloat(style.opacity) === 0 ||
        bounds.width <= 0 ||
        bounds.height <= 0
      ) {
        findings.push(`${name} is not rendered`);
        continue;
      }
      if (style.textOverflow === "ellipsis" || style.webkitLineClamp !== "none") {
        findings.push(`${name} truncates text`);
      }
      if (
        clippedValues.has(style.overflowX) &&
        element.scrollWidth > element.clientWidth + tolerance
      ) {
        findings.push(`${name} clips text horizontally`);
      }
      if (
        clippedValues.has(style.overflowY) &&
        element.scrollHeight > element.clientHeight + tolerance
      ) {
        findings.push(`${name} clips text vertically`);
      }

      const range = document.createRange();
      range.selectNodeContents(element);
      const textRects = Array.from(range.getClientRects()).filter(
        (rect) => rect.width > 0 && rect.height > 0,
      );
      if (textRects.length === 0) {
        findings.push(`${name} has no rendered text bounds`);
        continue;
      }

      for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
        const ancestorStyle = getComputedStyle(ancestor);
        const clipsX = clippedValues.has(ancestorStyle.overflowX);
        const clipsY = clippedValues.has(ancestorStyle.overflowY);
        if (!clipsX && !clipsY) {
          continue;
        }

        const ancestorBounds = ancestor.getBoundingClientRect();
        if (
          textRects.some(
            (rect) =>
              (clipsX &&
                (rect.left < ancestorBounds.left - tolerance ||
                  rect.right > ancestorBounds.right + tolerance)) ||
              (clipsY &&
                (rect.top < ancestorBounds.top - tolerance ||
                  rect.bottom > ancestorBounds.bottom + tolerance)),
          )
        ) {
          findings.push(`${name} is clipped by an ancestor`);
          break;
        }
      }
    }

    return [...new Set(findings)];
  });

  expect(issues, `${label} readability violations`).toEqual([]);
}

async function expectAccessCtasToRemainReachable(page: Page) {
  const main = page.getByRole("main");
  const requestAccess = main.getByRole("link", { name: "Request access" });
  const emailAccessRequest = main.getByRole("link", { name: "Email the access request" });

  await expect(requestAccess).toBeVisible();
  await requestAccess.scrollIntoViewIfNeeded();
  await expect(requestAccess).toBeInViewport();
  await requestAccess.focus();
  await expect(requestAccess).toBeFocused();
  await requestAccess.click();
  await expect(page).toHaveURL(/#apply$/);
  const applySection = page.locator("#apply");
  await applySection.scrollIntoViewIfNeeded();
  await expect(applySection).toBeInViewport();

  await expect(emailAccessRequest).toBeVisible();
  await emailAccessRequest.scrollIntoViewIfNeeded();
  await expect(emailAccessRequest).toBeInViewport();
  await emailAccessRequest.focus();
  await expect(emailAccessRequest).toBeFocused();
  await expect(emailAccessRequest).toHaveAttribute(
    "href",
    /^mailto:homer\.agent\.erik@gmail\.com\?subject=/,
  );
}

async function expectAccessCtasToMeetTargetSize(page: Page) {
  const minimumTargetSize = 24;
  const main = page.getByRole("main");
  const accessCtas = [
    ["Request access", main.getByRole("link", { name: "Request access", exact: true })],
    [
      "Email the access request",
      main.getByRole("link", { name: "Email the access request", exact: true }),
    ],
  ] as const;

  for (const [name, cta] of accessCtas) {
    await expect(cta).toBeVisible();
    const bounds = await cta.boundingBox();

    expect(bounds, `${name} should have rendered bounds`).not.toBeNull();
    expect(bounds!.width, `${name} target width`).toBeGreaterThanOrEqual(minimumTargetSize);
    expect(bounds!.height, `${name} target height`).toBeGreaterThanOrEqual(minimumTargetSize);
  }
}

async function expectDefaultColorFocusIndicator(control: Locator, label: string) {
  const minimumContrastRatio = 3;
  const minimumIndicatorWidth = 2;

  await expect(control, `${label} should receive keyboard focus`).toBeFocused();

  const result = await control.evaluate((element) => {
    type Rgba = [number, number, number, number];

    const style = getComputedStyle(element);
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      throw new Error("A canvas context is required to resolve computed colors");
    }

    const parseColor = (color: string): Rgba => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
      return [red / 255, green / 255, blue / 255, alpha / 255];
    };
    const composite = (foreground: Rgba, background: Rgba): Rgba => {
      const alpha = foreground[3] + background[3] * (1 - foreground[3]);
      if (alpha === 0) {
        return [0, 0, 0, 0];
      }

      return [
        (foreground[0] * foreground[3] + background[0] * background[3] * (1 - foreground[3])) /
          alpha,
        (foreground[1] * foreground[3] + background[1] * background[3] * (1 - foreground[3])) /
          alpha,
        (foreground[2] * foreground[3] + background[2] * background[3] * (1 - foreground[3])) /
          alpha,
        alpha,
      ];
    };
    const luminance = ([red, green, blue]: Rgba) => {
      const linearize = (channel: number) =>
        channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      return 0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue);
    };

    const ancestors: Element[] = [];
    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      ancestors.push(ancestor);
    }

    const adjacentBackground = ancestors.reverse().reduce<Rgba>(
      (background, ancestor) => {
        const ancestorStyle = getComputedStyle(ancestor);
        return composite(parseColor(ancestorStyle.backgroundColor), background);
      },
      [1, 1, 1, 1],
    );
    const outlineColor = parseColor(style.outlineColor);
    const lighter = Math.max(luminance(outlineColor), luminance(adjacentBackground));
    const darker = Math.min(luminance(outlineColor), luminance(adjacentBackground));

    return {
      adjacentBackground: adjacentBackground.map((channel) => Number(channel.toFixed(4))),
      contrastRatio: (lighter + 0.05) / (darker + 0.05),
      forcedColorsActive: matchMedia("(forced-colors: active)").matches,
      focusVisible: element.matches(":focus-visible"),
      outlineColor: style.outlineColor,
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth) || 0,
    };
  });

  expect(result.forcedColorsActive, `${label} should be tested in default colors`).toBe(false);
  expect(result.focusVisible, `${label} should match :focus-visible`).toBe(true);
  expect(result.outlineStyle, `${label} should render an ${["out", "line"].join("")}`).not.toBe(
    "none",
  );
  expect(result.outlineWidth, `${label} focus-indicator width`).toBeGreaterThanOrEqual(
    minimumIndicatorWidth,
  );
  expect(
    result.contrastRatio,
    `${label} ${result.outlineColor} focus indicator against adjacent ${result.adjacentBackground.join(
      ", ",
    )} background`,
  ).toBeGreaterThanOrEqual(minimumContrastRatio);
}

async function expectFocusedControlNotToBeObscured(control: Locator, label: string) {
  await expect(control, `${label} should be rendered`).toBeVisible();
  await control.focus();
  await expect(control, `${label} should receive focus`).toBeFocused();
  await control.scrollIntoViewIfNeeded();

  const result = await control.evaluate((element) => {
    type Box = { bottom: number; left: number; right: number; top: number };

    const tolerance = 1;
    // Tailwind scans test sources, so split layout keywords to avoid emitting test-only utilities.
    const clippedOverflow = ["cl", "ip"].join("");
    const concealedOverflow = ["hid", "den"].join("");
    const fixedPosition = ["fix", "ed"].join("");
    const stickyPosition = ["sti", "cky"].join("");
    const clippingValues = new Set([clippedOverflow, concealedOverflow, "auto", "scroll"]);
    const describe = (candidate: Element) => {
      const id = candidate.id ? `#${candidate.id}` : "";
      const classes = Array.from(candidate.classList)
        .map((className) => `.${className}`)
        .join("");
      return `${candidate.tagName.toLowerCase()}${id}${classes}`;
    };
    const intersect = (first: Box, second: Box, clipX = true, clipY = true): Box | null => {
      const intersection = {
        bottom: clipY ? Math.min(first.bottom, second.bottom) : first.bottom,
        left: clipX ? Math.max(first.left, second.left) : first.left,
        right: clipX ? Math.min(first.right, second.right) : first.right,
        top: clipY ? Math.max(first.top, second.top) : first.top,
      };

      return intersection.right - intersection.left > tolerance &&
        intersection.bottom - intersection.top > tolerance
        ? intersection
        : null;
    };
    const subtract = (region: Box, cover: Box): Box[] => {
      const overlap = intersect(region, cover);
      if (!overlap) {
        return [region];
      }

      return [
        { ...region, bottom: overlap.top },
        { ...region, top: overlap.bottom },
        { bottom: overlap.bottom, left: region.left, right: overlap.left, top: overlap.top },
        { bottom: overlap.bottom, left: overlap.right, right: region.right, top: overlap.top },
      ].filter(
        (remainder) =>
          remainder.right - remainder.left > tolerance &&
          remainder.bottom - remainder.top > tolerance,
      );
    };

    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const outlineWidth =
      style.outlineStyle === "none" ? 0 : Number.parseFloat(style.outlineWidth) || 0;
    const outlineOffset = Number.parseFloat(style.outlineOffset) || 0;
    const focusExpansion = Math.max(0, outlineWidth + outlineOffset);
    const focusBounds: Box = {
      bottom: bounds.bottom + focusExpansion,
      left: bounds.left - focusExpansion,
      right: bounds.right + focusExpansion,
      top: bounds.top - focusExpansion,
    };
    const viewport: Box = {
      bottom: window.innerHeight,
      left: 0,
      right: window.innerWidth,
      top: 0,
    };
    let visibleFocusArea = intersect(focusBounds, viewport);
    const clippingAncestors: string[] = [];

    for (
      let ancestor = element.parentElement;
      ancestor && visibleFocusArea;
      ancestor = ancestor.parentElement
    ) {
      const ancestorStyle = getComputedStyle(ancestor);
      const clipsX = clippingValues.has(ancestorStyle.overflowX);
      const clipsY = clippingValues.has(ancestorStyle.overflowY);
      if (!clipsX && !clipsY) {
        continue;
      }

      clippingAncestors.push(describe(ancestor));
      visibleFocusArea = intersect(
        visibleFocusArea,
        ancestor.getBoundingClientRect(),
        clipsX,
        clipsY,
      );
    }

    if (!visibleFocusArea) {
      return {
        clippingAncestors,
        coveringChrome: [] as string[],
        hasVisibleFocusArea: false,
      };
    }

    let uncoveredRegions = [visibleFocusArea];
    const coveringChrome: string[] = [];
    const chrome = Array.from(document.querySelectorAll("body *")).filter((candidate) => {
      if (candidate === element || candidate.contains(element) || element.contains(candidate)) {
        return false;
      }

      const candidateStyle = getComputedStyle(candidate);
      const candidateBounds = candidate.getBoundingClientRect();
      return (
        (candidateStyle.position === fixedPosition || candidateStyle.position === stickyPosition) &&
        candidateStyle.display !== "none" &&
        candidateStyle.visibility !== concealedOverflow &&
        Number.parseFloat(candidateStyle.opacity) !== 0 &&
        candidateBounds.width > tolerance &&
        candidateBounds.height > tolerance
      );
    });

    for (const candidate of chrome) {
      const candidateBounds = candidate.getBoundingClientRect();
      const overlapsFocusArea = uncoveredRegions.some((region) =>
        Boolean(intersect(region, candidateBounds)),
      );
      const nextRegions = uncoveredRegions.flatMap((region) => subtract(region, candidateBounds));
      if (overlapsFocusArea) {
        coveringChrome.push(describe(candidate));
      }
      uncoveredRegions = nextRegions;
      if (uncoveredRegions.length === 0) {
        break;
      }
    }

    return {
      clippingAncestors,
      coveringChrome,
      hasVisibleFocusArea: uncoveredRegions.length > 0,
    };
  });

  expect(
    result.hasVisibleFocusArea,
    `${label} focus bounds should not be fully obscured; clipping ancestors: ${
      result.clippingAncestors.join(", ") || "none"
    }; fixed/sticky chrome: ${result.coveringChrome.join(", ") || "none"}`,
  ).toBe(true);
}

async function expectKeyboardAccessPathToWork(page: Page) {
  await page.goto("/");

  const main = page.getByRole("main");
  await expect(main).toHaveCount(1);

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect(main).toBeFocused();

  const requestAccess = main.getByRole("link", { name: "Request access" });
  await page.keyboard.press("Tab");
  await expect(requestAccess).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#apply$/);
  const applySection = page.locator("#apply");
  await applySection.scrollIntoViewIfNeeded();
  await expect(applySection).toBeInViewport();

  const emailAccessRequest = main.getByRole("link", { name: "Email the access request" });
  await page.keyboard.press("Tab");
  await expect(emailAccessRequest).toBeFocused();
  await expect(emailAccessRequest).toBeInViewport();
  await expect(emailAccessRequest).toHaveAttribute(
    "href",
    /^mailto:homer\.agent\.erik@gmail\.com\?subject=/,
  );
}

test.describe("the static landing page without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("retains approved copy and the complete access-request path", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "The quiet morning check for a busy WooCommerce store.",
      }),
    ).toBeVisible();
    await expect(page.locator(".stage-badge")).toHaveText([
      "Available by request",
      "Available by request",
    ]);
    await expect(page.getByText(/private beta/i)).toHaveCount(0);

    const skipLink = page.locator('a.skip-link[href="#main"]');
    await expect(skipLink).toHaveCount(1);
    await expect(skipLink).toHaveText("Skip to main content");

    const main = page.getByRole("main");
    const requestAccess = main.getByRole("link", { name: "Request access", exact: true });
    await expect(requestAccess).toHaveAttribute("href", "#apply");
    await expect(page.locator("#apply")).toHaveCount(1);
    await requestAccess.click();
    await expect(page).toHaveURL(/#apply$/);

    const emailAccessRequest = main.getByRole("link", {
      name: "Email the access request",
      exact: true,
    });
    await expect(emailAccessRequest).toBeVisible();
    const emailHref = await emailAccessRequest.getAttribute("href");
    expect(emailHref).not.toBeNull();

    const emailUrl = new URL(emailHref!);
    expect(emailUrl.protocol).toBe("mailto:");
    expect(emailUrl.pathname).toBe("homer.agent.erik@gmail.com");
    expect(Array.from(emailUrl.searchParams.keys())).toEqual(["subject", "body"]);
    expect(emailUrl.searchParams.get("subject")).toBe("Daily Ops access request");
    expect(emailUrl.searchParams.get("body")).toBe(
      [
        "Hi Store Canary team,",
        "",
        "I’m interested in WooCommerce Daily Ops.",
        "",
        "Store URL:",
        "Your role:",
        "The operational problem you want Daily Ops to solve:",
        "WooCommerce version, if known:",
        "",
        "Thanks,",
      ].join("\n"),
    );
  });
});

test("Store Canary presents Daily Ops as an established product", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Store Canary · WooCommerce Daily Ops/);
  await expect(
    page.getByRole("heading", { name: /quiet morning check for a busy WooCommerce store/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /request access/i }).first()).toHaveAttribute(
    "href",
    "#apply",
  );
  await expect(page.getByRole("link", { name: /email the access request/i })).toHaveAttribute(
    "href",
    /^mailto:homer\.agent\.erik@gmail\.com\?subject=/,
  );
  await expect(page.getByText("Store URL")).toBeVisible();
  await expect(page.getByText("Your role")).toBeVisible();
  await expect(page.getByText(/WooCommerce version, if known/i)).toBeVisible();
  await expect(page.getByText("homer.agent.erik@gmail.com")).toBeVisible();
  await expect(page.getByText(/sales calls?/i)).toHaveCount(0);

  const metadataCopy = await page
    .locator('meta[name="description"], meta[property^="og:"]')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute("content") ?? ""));
  const publicCopy = [
    await page.title(),
    await page.locator("body").innerText(),
    ...metadataCopy,
  ].join(" ");

  for (const exception of supportedDailyOpsExceptions) {
    expect(publicCopy.toLowerCase()).toContain(exception);
  }
  for (const { category, pattern } of prohibitedMarketingClaims) {
    expect(publicCopy, category).not.toMatch(pattern);
  }
});

test("keyboard users can skip the navigation and reach the main content", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);

  const main = page.getByRole("main");
  await expect(main).toBeFocused();
  await expect(
    main.getByRole("heading", { name: /quiet morning check for a busy WooCommerce store/i }),
  ).toBeVisible();
});

test("keyboard users can activate the existing mailto access request", async ({ page }) => {
  await page.addInitScript(() => {
    window.addEventListener(
      "click",
      (event) => {
        const mailto = event
          .composedPath()
          .find(
            (target): target is HTMLAnchorElement =>
              target instanceof HTMLAnchorElement && target.protocol === "mailto:",
          );

        if (!mailto) {
          return;
        }

        event.preventDefault();
        Reflect.set(window, "__storeCanaryActivatedMailto", {
          detail: event.detail,
          href: mailto.getAttribute("href"),
        });
      },
      { capture: true },
    );
  });

  await expectKeyboardAccessPathToWork(page);

  const emailAccessRequest = page.getByRole("main").getByRole("link", {
    name: "Email the access request",
    exact: true,
  });
  const expectedMailtoHref = await emailAccessRequest.getAttribute("href");
  expect(expectedMailtoHref).not.toBeNull();

  await page.keyboard.press("Enter");
  expect(
    await page.evaluate(() => Reflect.get(window, "__storeCanaryActivatedMailto")),
  ).toEqual({
    detail: 0,
    href: expectedMailtoHref,
  });
  await expect(emailAccessRequest).toBeFocused();
  await expect(page).toHaveURL(/#apply$/);
});

test("keyboard focus follows document order without trapping users", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  const main = page.getByRole("main");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  const emailAccessRequest = main.getByRole("link", {
    name: "Email the access request",
    exact: true,
  });
  const focusOrder = [
    skipLink,
    page.getByRole("link", { name: "Store Canary home" }),
    navigation.getByRole("link", { name: "How it works", exact: true }),
    navigation.getByRole("link", { name: "Request access", exact: true }),
    main.getByRole("link", { name: "Request access", exact: true }),
    emailAccessRequest,
  ];

  for (const control of focusOrder) {
    await expect(control).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(control).toBeFocused();
  }

  await page.keyboard.press("Tab");
  await expect(emailAccessRequest).not.toBeFocused();
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(skipLink).not.toBeFocused();

  for (const control of [...focusOrder].reverse()) {
    await page.keyboard.press("Shift+Tab");
    await expect(control).toBeFocused();
  }

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect(main).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(main.getByRole("link", { name: "Request access", exact: true })).toBeFocused();
});

test("default-color keyboard focus indicators remain visible at 3:1 against adjacent backgrounds", async ({
  page,
}) => {
  await page.goto("/");

  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  const main = page.getByRole("main");
  const howItWorks = navigation.getByRole("link", { name: "How it works", exact: true });
  const keyboardFocusOrder: [string, Locator, boolean][] = [
    ["skip link", page.getByRole("link", { name: "Skip to main content" }), true],
    ["home link", page.getByRole("link", { name: "Store Canary home" }), false],
    ...((await howItWorks.isVisible())
      ? ([["primary navigation “How it works” link", howItWorks, true]] as [
          string,
          Locator,
          boolean,
        ][])
      : []),
    [
      "primary navigation “Request access” link",
      navigation.getByRole("link", { name: "Request access", exact: true }),
      true,
    ],
    [
      "hero Request access CTA",
      main.getByRole("link", { name: "Request access", exact: true }),
      true,
    ],
    [
      "Email the access request CTA",
      main.getByRole("link", { name: "Email the access request", exact: true }),
      true,
    ],
  ];

  for (const [label, control, hasFocusIndicatorContract] of keyboardFocusOrder) {
    await page.keyboard.press("Tab");
    await expect(control, `${label} should follow the keyboard focus order`).toBeFocused();
    if (hasFocusIndicatorContract) {
      await expectDefaultColorFocusIndicator(control, label);
    }
  }
});

test("reduced motion keeps the keyboard access path static and usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectKeyboardAccessPathToWork(page);

  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(
    true,
  );

  const requestAccess = page.getByRole("main").getByRole("link", { name: "Request access" });
  await requestAccess.hover();
  expect(
    await requestAccess.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        animationName: style.animationName,
        transform: style.transform,
        transitionDuration: style.transitionDuration,
      };
    }),
  ).toEqual({
    animationName: "none",
    transform: "none",
    transitionDuration: "0s",
  });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    "auto",
  );
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test("forced colors preserves landmarks, focus, CTAs, and textual status cues", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await expectKeyboardAccessPathToWork(page);

  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);

  const emailAccessRequest = page.getByRole("link", { name: "Email the access request" });
  const focusStyle = await emailAccessRequest.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  expect(focusStyle.outlineStyle).toBe("solid");
  expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(3);

  const previewRows = page.locator(".preview-row");
  await expect(previewRows).toHaveCount(3);
  for (const row of await previewRows.all()) {
    await expect(row.locator(".signal")).toHaveAttribute("aria-hidden", "true");
    await expect(row.locator("span")).not.toHaveText("");
    await expect(row.locator("strong")).not.toHaveText("");
  }
  await expect(page.locator(".product-preview")).toHaveCSS("box-shadow", "none");
});

test("print media keeps the explanation and both access CTAs readable", async ({ page }) => {
  await page.emulateMedia({ media: "print" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  expect(await page.evaluate(() => matchMedia("print").matches)).toBe(true);

  const main = page.getByRole("main");
  const keyExplanation = [
    main.getByRole("heading", {
      level: 1,
      name: "The quiet morning check for a busy WooCommerce store.",
    }),
    main.getByText(
      "Daily Ops finds operational exceptions—stuck paid orders, failed payments, new stockouts, and broken scheduled actions—and turns them into one concise, actionable digest.",
      { exact: true },
    ),
    main.getByRole("heading", {
      name: "Operational truth without another cloud dashboard.",
    }),
    main.getByText(
      "Store owners and WooCommerce operators who want fewer surprises and less dashboard patrol.",
      { exact: true },
    ),
    main.getByRole("heading", { name: "Put Daily Ops to work on your store." }),
  ];
  const availability = main.getByText("Available by request", { exact: true });
  const requestDetails = page.locator("#apply li");
  const requestAccess = main.getByRole("link", { name: "Request access", exact: true });
  const emailAccessRequest = main.getByRole("link", {
    name: "Email the access request",
    exact: true,
  });

  for (const copy of keyExplanation) {
    await expect(copy).toBeVisible();
  }
  await expect(availability).toHaveCount(2);
  await expect(requestDetails).toHaveCount(4);
  await expect(page.getByText("homer.agent.erik@gmail.com")).toBeVisible();
  await expect(requestAccess).toBeVisible();
  await expect(requestAccess).toHaveAttribute("href", "#apply");
  await expect(emailAccessRequest).toBeVisible();
  await expect(emailAccessRequest).toHaveAttribute(
    "href",
    /^mailto:homer\.agent\.erik@gmail\.com\?subject=/,
  );

  await expectTextToRemainReadable(availability, "print availability");
  await expectTextToRemainReadable(requestDetails, "print access-request details");
  await expectTextToRemainReadable(main.locator("a.button"), "print access CTAs");
  await expect(page.locator(".preview-chrome")).toBeHidden();
  await expect(page.locator(".product-preview")).toBeVisible();
});

test("the browser privacy boundary permits only the email CTA", async ({
  baseURL,
  context,
  page,
}) => {
  expect(baseURL).toBeTruthy();
  const firstPartyOrigin = new URL(baseURL!).origin;
  const thirdPartyRequests: string[] = [];
  const cookieResponses: string[] = [];
  const responseHeaderChecks: Promise<void>[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.origin !== firstPartyOrigin
    ) {
      thirdPartyRequests.push(request.url());
    }
  });
  page.on("response", (response) => {
    responseHeaderChecks.push(
      response.allHeaders().then((headers) => {
        if (headers["set-cookie"]) {
          cookieResponses.push(response.url());
        }
      }),
    );
  });

  await page.addInitScript(() => {
    const browserDataWrites: string[] = [];
    Object.defineProperty(window, "__storeCanaryBrowserDataWrites", {
      value: browserDataWrites,
    });

    const cookie = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
    if (cookie?.get && cookie.set) {
      Object.defineProperty(Document.prototype, "cookie", {
        ...cookie,
        set(this: Document, value: string) {
          browserDataWrites.push("document.cookie");
          cookie.set!.call(this, value);
        },
      });
    }

    const wrap = (target: object, method: string, label: string) => {
      const original = Reflect.get(target, method) as (...args: unknown[]) => unknown;
      Reflect.set(target, method, function (this: unknown, ...args: unknown[]) {
        browserDataWrites.push(label);
        return Reflect.apply(original, this, args);
      });
    };

    wrap(Storage.prototype, "setItem", "Storage.setItem");
    wrap(Storage.prototype, "removeItem", "Storage.removeItem");
    wrap(Storage.prototype, "clear", "Storage.clear");
    wrap(indexedDB, "open", "indexedDB.open");
    wrap(indexedDB, "deleteDatabase", "indexedDB.deleteDatabase");
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await Promise.all(responseHeaderChecks);

  const scriptSources = await page
    .locator("script[src]")
    .evaluateAll((scripts) => scripts.map((script) => (script as HTMLScriptElement).src));
  const thirdPartyScripts = scriptSources.filter((source) => {
    const url = new URL(source);
    return (
      (url.protocol === "http:" || url.protocol === "https:") && url.origin !== firstPartyOrigin
    );
  });
  const browserData = await page.evaluate(async () => ({
    indexedDB: (await indexedDB.databases()).map(({ name }) => name),
    localStorage: Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ),
    sessionStorage: Array.from({ length: sessionStorage.length }, (_, index) =>
      sessionStorage.key(index),
    ),
    writes: Reflect.get(window, "__storeCanaryBrowserDataWrites") as string[],
  }));

  expect(await page.locator("form").count()).toBe(0);
  await expect(page.getByRole("link", { name: /email the access request/i })).toHaveAttribute(
    "href",
    /^mailto:/,
  );
  expect(thirdPartyScripts).toEqual([]);
  expect(thirdPartyRequests).toEqual([]);
  expect(cookieResponses).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  expect(browserData).toEqual({
    indexedDB: [],
    localStorage: [],
    sessionStorage: [],
    writes: [],
  });
});

test("the landing page emits canonical Store Canary metadata", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Store Canary · WooCommerce Daily Ops");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://storecanary.app",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Catch stuck paid orders, failed payments, new stockouts, and broken scheduled actions in one concise WooCommerce daily digest.",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://storecanary.app",
  );
});

test("robots.txt allows all crawlers and names the canonical sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  const body = await response.text();

  expect(response.ok()).toBe(true);
  expect(body).toMatch(/^User-Agent: \*$/m);
  expect(body).toMatch(/^Allow: \/$/m);
  expect(body).not.toMatch(/^Disallow:/m);
  expect(body).toMatch(/^Sitemap: https:\/\/storecanary\.app\/sitemap\.xml$/m);
});

test("sitemap.xml lists only the canonical landing page", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  const body = await response.text();

  expect(response.ok()).toBe(true);
  expect(body.match(/<url>/g) ?? []).toHaveLength(1);
  expect(body.match(/<loc>/g) ?? []).toHaveLength(1);
  expect(body).toContain("<loc>https://storecanary.app</loc>");
});

test("the site does not expose unrelated Fire product pages", async ({ page }) => {
  for (const slug of [
    "margin-monitor",
    "feed-failure-monitor",
    "accessibility-monitor",
    "scheduled-reports",
  ]) {
    const response = await page.goto(`/products/${slug}`);
    expect(response?.status()).toBe(404);
  }
});

test("the landing page keeps its semantic structure and descriptive link names", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("main")).toHaveCount(1);

  const semanticResults = await new AxeBuilder({ page })
    .withRules([
      "heading-order",
      "landmark-no-duplicate-main",
      "landmark-one-main",
      "landmark-unique",
      "link-name",
      "page-has-heading-one",
    ])
    .analyze();
  expect(semanticResults.violations).toEqual([]);

  const headingLevels = await page
    .getByRole("heading")
    .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
  expect(headingLevels[0], "the heading sequence should start with an h1").toBe(1);
  for (let index = 1; index < headingLevels.length; index += 1) {
    expect(
      headingLevels[index],
      `heading ${index + 1} should not skip a level after h${headingLevels[index - 1]}`,
    ).toBeLessThanOrEqual(headingLevels[index - 1] + 1);
  }

  for (const genericName of ["click here", "learn more"]) {
    await expect(page.getByRole("link", { name: new RegExp(`^${genericName}$`, "i") })).toHaveCount(
      0,
    );
  }

  const main = page.getByRole("main");
  await expect(main.getByRole("link", { name: "Request access", exact: true })).toHaveCount(1);
  await expect(
    main.getByRole("link", { name: "Email the access request", exact: true }),
  ).toHaveCount(1);
});

test("Store Canary has no horizontal overflow or detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("WCAG text spacing keeps key copy and both access CTAs readable", async ({ page }) => {
  await page.goto("/");
  await page.addStyleTag({
    content: `
      * {
        line-height: 1.5 !important;
        letter-spacing: 0.12em !important;
        word-spacing: 0.16em !important;
      }
      p {
        margin-bottom: 2em !important;
      }
    `,
  });
  await page.evaluate(() => document.fonts.ready);

  const appliedSpacing = await page.locator("main h1").evaluate((heading) => {
    const headingStyle = getComputedStyle(heading);
    const paragraphStyle = getComputedStyle(document.querySelector("main p")!);
    return {
      letterSpacing: Number.parseFloat(headingStyle.letterSpacing),
      lineHeight: Number.parseFloat(headingStyle.lineHeight),
      paragraphSpacing: Number.parseFloat(paragraphStyle.marginBottom),
      paragraphTextSize: Number.parseFloat(paragraphStyle.fontSize),
      textSize: Number.parseFloat(headingStyle.fontSize),
      wordSpacing: Number.parseFloat(headingStyle.wordSpacing),
    };
  });
  expect(appliedSpacing.lineHeight / appliedSpacing.textSize).toBeCloseTo(1.5);
  expect(appliedSpacing.paragraphSpacing / appliedSpacing.paragraphTextSize).toBeCloseTo(2);
  expect(appliedSpacing.letterSpacing / appliedSpacing.textSize).toBeCloseTo(0.12);
  expect(appliedSpacing.wordSpacing / appliedSpacing.textSize).toBeCloseTo(0.16);

  const main = page.getByRole("main");
  const previewRows = page.locator(".preview-row");
  const accessCtas = main.locator("a.button");
  await expect(previewRows).toHaveCount(3);
  await expect(accessCtas).toHaveCount(2);
  await expectTextToRemainReadable(main.getByRole("heading"), "headings");
  await expectTextToRemainReadable(previewRows.locator("span, strong"), "Daily Ops preview rows");
  await expectTextToRemainReadable(
    page.locator("#apply p, #apply li, #apply small"),
    "request details",
  );
  await expectTextToRemainReadable(accessCtas, "access CTAs");
  await expectReflowContractToHold(page);
  await expectAccessCtasToRemainReachable(page);
});

for (const targetSizeMode of [
  { name: "desktop", viewport: { width: 1280, height: 720 } },
  { name: "320 CSS-pixel reflow", viewport: { width: 320, height: 720 } },
]) {
  test(`both access CTAs meet the WCAG 2.5.8 target-size minimum at ${targetSizeMode.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(targetSizeMode.viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    expect(await page.evaluate(() => window.innerWidth)).toBe(targetSizeMode.viewport.width);
    await expectAccessCtasToMeetTargetSize(page);
  });
}

for (const focusObscurationMode of [
  {
    name: "desktop",
    navigationLinks: ["How it works", "Request access"],
    viewport: { width: 1280, height: 720 },
  },
  {
    name: "320 CSS-pixel reflow",
    navigationLinks: ["Request access"],
    viewport: { width: 320, height: 720 },
  },
]) {
  test(`focused controls are not fully obscured at ${focusObscurationMode.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(focusObscurationMode.viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    expect(await page.evaluate(() => window.innerWidth)).toBe(focusObscurationMode.viewport.width);

    const navigation = page.getByRole("navigation", { name: "Primary navigation" });
    const main = page.getByRole("main");
    const controls: [string, Locator][] = [
      ["skip link", page.getByRole("link", { name: "Skip to main content" })],
      ...focusObscurationMode.navigationLinks.map(
        (name) =>
          [
            `primary navigation “${name}” link`,
            navigation.getByRole("link", { name, exact: true }),
          ] as [string, Locator],
      ),
      ["hero Request access CTA", main.getByRole("link", { name: "Request access", exact: true })],
      [
        "Email the access request CTA",
        main.getByRole("link", { name: "Email the access request", exact: true }),
      ],
    ];

    if (focusObscurationMode.viewport.width === 320) {
      await expect(
        navigation.getByRole("link", { name: "How it works", exact: true }),
      ).toBeHidden();
    }

    for (const [label, control] of controls) {
      await expectFocusedControlNotToBeObscured(control, label);
    }
  });
}

for (const reflowMode of [
  {
    name: "at a 320 CSS-pixel viewport",
    viewport: { width: 320, height: 720 },
    textScale: 1,
  },
  {
    name: "with 200% text sizing",
    viewport: { width: 1280, height: 720 },
    textScale: 2,
  },
]) {
  test(`content reflows and both access CTAs remain reachable ${reflowMode.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(reflowMode.viewport);
    await page.goto("/");
    const defaultTextSize = await page.evaluate(() =>
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
    );
    await page.addStyleTag({
      content: `html { font-size: ${reflowMode.textScale * 100}% !important; }`,
    });
    await page.evaluate(() => document.fonts.ready);

    expect(await page.evaluate(() => window.innerWidth)).toBe(reflowMode.viewport.width);
    expect(
      await page.evaluate(() =>
        Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
      ),
    ).toBe(defaultTextSize * reflowMode.textScale);
    await expectReflowContractToHold(page);
    await expectAccessCtasToRemainReachable(page);
  });
}
