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
    const requestUrl = new URL(apply.getAttribute("href")!);
    expect(`${requestUrl.protocol}${requestUrl.pathname}`).toBe(
      "mailto:homer.agent.erik@gmail.com",
    );
    expect(requestUrl.searchParams.get("subject")).toBe("Daily Ops access request");
    expect(requestUrl.searchParams.get("body")).toBe(
      "Hi Store Canary team,\n\nI’m interested in WooCommerce Daily Ops.\n\nStore URL:\nYour role:\nThe operational problem you want Daily Ops to solve:\nWooCommerce version, if known:\n\nThanks,",
    );

    expect(screen.getByText("Store URL")).toBeInTheDocument();
    expect(screen.getByText("Your role")).toBeInTheDocument();
    expect(
      screen.getByText("The operational problem you want Daily Ops to solve"),
    ).toBeInTheDocument();
    expect(screen.getByText("WooCommerce version, if known")).toBeInTheDocument();
    expect(screen.getByText("homer.agent.erik@gmail.com")).toBeInTheDocument();
    expect(screen.queryByText(/beta|early access|waitlist/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sales calls?/i)).not.toBeInTheDocument();
  });
});
