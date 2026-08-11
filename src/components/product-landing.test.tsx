import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getProduct } from "@/lib/products";
import { ProductLanding } from "./product-landing";

describe("ProductLanding", () => {
  it("renders accurate Daily Ops beta status and a functional application contact", () => {
    render(<ProductLanding product={getProduct("daily-ops")} />);

    expect(screen.getByRole("heading", { name: /quiet morning check/i })).toBeInTheDocument();
    expect(screen.getAllByText("Private beta").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/owner-approved private distribution/i).length).toBeGreaterThan(0);

    const apply = screen.getByRole("link", { name: /email the beta application/i });
    expect(apply).toHaveAttribute(
      "href",
      expect.stringMatching(/^mailto:homer\.agent\.erik@gmail\.com\?subject=/),
    );
  });

  it("does not claim private-beta availability for an earlier product", () => {
    render(<ProductLanding product={getProduct("scheduled-reports")} />);

    expect(screen.getAllByText("In development").length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /join the product waitlist/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/owner-approved private distribution/i)).not.toBeInTheDocument();
  });
});
