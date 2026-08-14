import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  prohibitedMarketingClaims,
  supportedDailyOpsExceptions,
} from "../../tests/marketing-copy-contract";
import Home from "./page";

describe("Store Canary landing page", () => {
  it("presents Daily Ops as Store Canary's single public product", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: /store canary home/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /quiet morning check for a busy WooCommerce store/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/WooCommerce Daily Ops/i).length).toBeGreaterThan(0);
    expect(screen.queryByText("Margin Monitor")).not.toBeInTheDocument();
    expect(screen.queryByText("Fire HQ")).not.toBeInTheDocument();
  });

  it("renders every supported Daily Ops exception", () => {
    render(<Home />);

    for (const exception of supportedDailyOpsExceptions) {
      expect(screen.getByText(new RegExp(exception, "i"))).toBeInTheDocument();
    }
  });

  it("does not make prohibited marketing claims", () => {
    const { container } = render(<Home />);
    const publicCopy = container.textContent ?? "";

    for (const { category, pattern } of prohibitedMarketingClaims) {
      expect(publicCopy, category).not.toMatch(pattern);
    }
  });

  it("uses an established-product access request rather than beta language", () => {
    render(<Home />);

    expect(screen.getAllByRole("link", { name: /request access/i })[0]).toHaveAttribute(
      "href",
      "#apply",
    );
    expect(screen.getByRole("link", { name: /email the access request/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/^mailto:homer\.agent\.erik@gmail\.com\?subject=/),
    );
    expect(screen.getByText("Store URL")).toBeInTheDocument();
    expect(screen.getByText("Your role")).toBeInTheDocument();
    expect(screen.getByText(/WooCommerce version, if known/i)).toBeInTheDocument();
    expect(screen.getByText("homer.agent.erik@gmail.com")).toBeInTheDocument();
    expect(
      screen.queryByText(/private beta|beta|early access|waitlist|newly launched|launching soon/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/asynchronous support|sales calls?/i)).not.toBeInTheDocument();
  });
});
