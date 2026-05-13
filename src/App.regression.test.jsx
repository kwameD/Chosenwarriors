import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App regression", () => {
  it("keeps the expected primary page sections in order", () => {
    const expectedSectionMarkers = [
      "home",
      "ministry-overview",
      "events",
      "media",
      "testimonials",
      "give",
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
    expect(screen.getByRole("link", { name: /watch sermons/i })).toHaveAttribute("href", "#media");
    expect(screen.getAllByRole("link", { name: /give online/i })[0]).toHaveAttribute("href", "#give-online");
  });
});
