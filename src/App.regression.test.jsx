import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App regression", () => {
  it("keeps the expected primary page sections in order", () => {
    const expectedSectionMarkers = [
      "home",
      "ministry-overview",
      "events",
      "testimonials",
      "partner",
      "Stay connected to what God is doing",
    ];

    render(<App />);

    const actualSectionMarkers = [...document.querySelectorAll("main > section")].map((section) => {
      return section.id || section.querySelector("h1, h2, p")?.textContent;
    });

    expect(actualSectionMarkers).toEqual(expectedSectionMarkers);
  });

  it("renders the key user-facing calls to action", () => {
    render(<App />);

    expect(screen.getAllByRole("link", { name: /join us/i })[0]).toHaveAttribute("href", "#contact");
    expect(screen.getByRole("link", { name: /request prayer/i })).toHaveAttribute("href", "#prayer-requests");
    expect(screen.getByRole("link", { name: /join prayer/i })).toHaveAttribute("href", "#events");
  });
});
