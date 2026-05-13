import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { navigationItems } from "../../config/siteConfig";
import { Navbar } from "./Navbar";

describe("Navbar integration", () => {
  it("renders configured navigation links", () => {
    render(<Navbar />);

    navigationItems.forEach((item) => {
      expect(screen.getAllByRole("link", { name: item.label })[0]).toHaveAttribute("href", item.href);
    });
  });

  it("opens and closes the mobile menu", async () => {
    const user = userEvent.setup();

    render(<Navbar />);

    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const mobileMenu = screen.getByRole("navigation", { name: /mobile navigation/i });
    expect(within(mobileMenu).getAllByRole("link", { name: "Prayer Requests" })[0]).toHaveAttribute("href", "#prayer-requests");

    await user.click(within(mobileMenu).getAllByRole("link", { name: "Prayer Requests" })[0]);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("renders dropdown submenu links", () => {
    render(<Navbar />);

    expect(screen.getAllByRole("link", { name: "Mission & Vision" })[0]).toHaveAttribute("href", "#mission-vision");
    expect(screen.getAllByRole("link", { name: "Leadership" })[0]).toHaveAttribute("href", "#leadership");
    expect(screen.getAllByRole("link", { name: "Testimonials" })[0]).toHaveAttribute("href", "#testimonials");
  });
});
