import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders an internal link without external-link attributes", () => {
    render(<Button href="#connect">Join Us</Button>);

    const link = screen.getByRole("link", { name: /join us/i });

    expect(link).toHaveAttribute("href", "#connect");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
    expect(link).toHaveClass("btn", "btn-primary");
  });

  it("renders an external link with safe external-link attributes", () => {
    render(
      <Button href="https://example.com" variant="white">
        Open Site
      </Button>,
    );

    const link = screen.getByRole("link", { name: /open site/i });

    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(link).toHaveClass("btn-white");
  });
});

