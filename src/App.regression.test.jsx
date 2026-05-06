import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App regression", () => {
  it("keeps the expected primary page sections in order", () => {
    const expectedSectionMarkers = [
      "home",
      "Connect with our live prayer community and walk with people who will stand with you.",
      "media",
      "testimonies",
      "Need prayer today?",
      "events",
      "give",
      "Stay connected to what God is doing",
      "about",
      "prayer",
      "connect",
      "foundation",
    ];

    render(<App />);

    const actualSectionMarkers = [...document.querySelectorAll("main > section")].map((section) => {
      return section.id || section.querySelector("h1, h2, p")?.textContent;
    });

    expect(actualSectionMarkers).toEqual(expectedSectionMarkers);
  });

  it("renders the key user-facing calls to action", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: /join the movement/i })).toHaveAttribute("href", "#connect");
    expect(screen.getByRole("link", { name: /submit prayer request/i })).toHaveAttribute("href", "#prayer");
    expect(screen.getByRole("link", { name: /give to the foundation/i })).toHaveAttribute("href", "#give");
  });
});

