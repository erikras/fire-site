import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
    expect(screen.queryByText(/beta|early access|waitlist/i)).not.toBeInTheDocument();
  });
});
