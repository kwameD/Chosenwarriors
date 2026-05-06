import { expect, test } from "@playwright/test";

const primarySections = [
  "home",
  "media",
  "testimonies",
  "events",
  "give",
  "about",
  "prayer",
  "connect",
  "foundation",
];

test.describe("homepage flow", () => {
  test("loads the core page content and supports primary CTA navigation", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Chosen Warriors/);
    await expect(page.getByRole("heading", { name: "You Were Chosen for More" })).toBeVisible();

    for (const sectionId of primarySections) {
      await expect(page.locator(`#${sectionId}`)).toBeAttached();
    }

    await page.getByRole("link", { name: "Join the Movement" }).click();
    await expect(page.locator("#connect")).toBeInViewport();

    await page.getByRole("link", { name: "Submit Prayer Request" }).click();
    await expect(page.locator("#prayer")).toBeInViewport();
  });

  test("keeps the page layout within the viewport", async ({ page }) => {
    await page.goto("/");

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });
});

test.describe("navigation", () => {
  test("opens the mobile menu and navigates to a section", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile menu is only visible on mobile viewports.");

    await page.goto("/");

    const menuButton = page.getByRole("button", { name: "Toggle menu" });
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await menuButton.click();

    await expect(menuButton).toHaveAttribute("aria-expanded", "true");

    const mobileNavigation = page.getByRole("navigation", { name: "Mobile navigation" });
    await expect(mobileNavigation.getByRole("link", { name: "Events" })).toBeVisible();

    await mobileNavigation.getByRole("link", { name: "Events" }).click();

    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#events")).toBeInViewport();
  });
});

test.describe("forms and media", () => {
  test("accepts user input in contact, prayer, and newsletter forms", async ({ page }) => {
    await page.goto("/");

    const contactForm = page.getByRole("form", { name: "Contact form" });
    const prayerForm = page.getByRole("form", { name: "Prayer request form" });
    const newsletterForm = page.getByRole("form", { name: "Newsletter signup form" });

    await contactForm.getByLabel("Name").fill("Test Visitor");
    await contactForm.getByLabel("Email").fill("visitor@example.com");
    await contactForm.getByLabel("Message").fill("I would like to connect.");

    await prayerForm.getByLabel("Name").fill("Prayer Partner");
    await prayerForm.getByLabel("Email").fill("prayer@example.com");
    await prayerForm.getByLabel("Prayer request").fill("Please pray for clarity.");

    await newsletterForm.getByLabel("Email address").fill("news@example.com");

    await expect(contactForm.getByLabel("Message")).toHaveValue("I would like to connect.");
    await expect(prayerForm.getByLabel("Prayer request")).toHaveValue("Please pray for clarity.");
    await expect(newsletterForm.getByLabel("Email address")).toHaveValue("news@example.com");
  });

  test("defers the YouTube iframe until the user chooses to play", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#media iframe")).toHaveCount(0);

    await page.getByRole("button", { name: /play chosen warriors youtube message/i }).click();

    await expect(page.locator("#media iframe")).toHaveAttribute("src", /youtube\.com\/embed\/3pAcTlJ-u9M/);
  });
});
