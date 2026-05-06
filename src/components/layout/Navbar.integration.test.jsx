import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { navigationItems } from "../../config/site";
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
    expect(within(mobileMenu).getByRole("link", { name: "Prayer" })).toHaveAttribute("href", "#prayer");

    await user.click(within(mobileMenu).getByRole("link", { name: "Prayer" }));

    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
