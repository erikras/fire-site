import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getProduct } from "@/lib/products";
import { ProductLanding } from "./product-landing";

describe("ProductLanding", () => {
  it("renders Daily Ops with established positioning and a functional access request", () => {
    render(<ProductLanding product={getProduct("daily-ops")} />);

    expect(screen.getByRole("heading", { name: /quiet morning check/i })).toBeInTheDocument();
    expect(screen.getAllByText("Available by request").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/guided staging-site installation/i).length).toBeGreaterThan(0);

    const apply = screen.getByRole("link", { name: /email the access request/i });
    expect(apply).toHaveAttribute(
      "href",
      expect.stringMatching(/^mailto:homer\.agent\.erik@gmail\.com\?subject=/),
    );
    expect(screen.queryByText(/beta|early access|waitlist/i)).not.toBeInTheDocument();
  });
});
