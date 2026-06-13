import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

const primarySections = [
  "home",
  "ministry-overview",
  "events",
  "testimonials",
  "partner",
];

test.describe("homepage flow", () => {
  test("loads the core page content and supports primary CTA navigation", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Chosen Warriors/);
    await expect(page.getByRole("heading", { name: "Raising revivalists for homes, communities, and nations." })).toBeVisible();

    for (const sectionId of primarySections) {
      await expect(page.locator(`#${sectionId}`)).toBeAttached();
    }

    await page.getByRole("link", { name: "Join Us" }).first().click();
    await expect(page.getByRole("heading", { name: "Connect with the ministry and take your next step." })).toBeVisible();

    await page.getByRole("link", { name: "Prayer Requests" }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "We will stand in prayer with you." })).toBeVisible();
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
  test("keeps desktop dropdowns open while moving into submenu links", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop dropdowns are only visible on desktop viewports.");

    await page.goto("/");

    const primaryNavigation = page.getByRole("navigation", { name: "Primary navigation" });
    await primaryNavigation.getByRole("link", { name: "About" }).hover();
    await expect(primaryNavigation.getByRole("link", { name: "Mission & Vision" })).toBeVisible();

    await primaryNavigation.getByRole("link", { name: "Mission & Vision" }).hover();
    await expect(primaryNavigation.getByRole("link", { name: "Mission & Vision" })).toBeVisible();

    await primaryNavigation.getByRole("link", { name: "Contact" }).hover();
    await expect(primaryNavigation.getByRole("link", { name: "Prayer Requests" })).toBeVisible();

    await primaryNavigation.getByRole("link", { name: "Prayer Requests" }).hover();
    await expect(primaryNavigation.getByRole("link", { name: "Prayer Requests" })).toBeVisible();
  });

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

test.describe("forms and ministry flows", () => {
  test("accepts user input in contact, prayer, and newsletter forms", async ({ page }) => {
    await page.goto("/");

    await page.goto("/#contact");
    const contactForm = page.getByRole("form", { name: "Contact form" });
    await contactForm.getByLabel("Name").fill("Test Visitor");
    await contactForm.getByLabel("Email").fill("visitor@example.com");
    await contactForm.getByLabel("Message").fill("I would like to connect.");
    await expect(contactForm.getByLabel("Message")).toHaveValue("I would like to connect.");
    await contactForm.getByRole("button", { name: "Send Message" }).click();
    await expect(page.getByRole("status")).toContainText("Thanks for reaching out");

    await page.goto("/#prayer-requests");
    const prayerForm = page.getByRole("form", { name: "Prayer request form" });
    await prayerForm.getByLabel("Name").fill("Prayer Partner");
    await prayerForm.getByLabel("Email").fill("prayer@example.com");
    await prayerForm.getByLabel("Prayer request").fill("Please pray for clarity.");
    await expect(prayerForm.getByLabel("Prayer request")).toHaveValue("Please pray for clarity.");
    await prayerForm.getByRole("button", { name: "Submit Prayer Request" }).click();
    await expect(page.getByRole("status")).toContainText("prayer request has been received");

    await page.goto("/");
    const newsletterForm = page.getByRole("form", { name: "Newsletter signup form" });
    await newsletterForm.getByLabel("Email address").fill("news@example.com");
    await expect(newsletterForm.getByLabel("Email address")).toHaveValue("news@example.com");
    await newsletterForm.getByRole("button", { name: "Subscribe" }).click();
    await expect(page.getByRole("status")).toContainText("signed up");
  });

  test("supports partner and event workflows", async ({ page }) => {
    await page.goto("/#partner");
    await expect(page.getByRole("heading", { name: "Take your next step in prayer, service, and community." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Connect With Us" })).toHaveAttribute("href", "#contact");
    await expect(page.getByRole("link", { name: "View Gatherings" })).toHaveAttribute("href", "#events");

    await page.goto("/#events");
    await expect(page.locator("#events").getByRole("link", { name: "Join" }).first()).toHaveAttribute("href", /zoom|chat\.whatsapp/);

    await page.goto("/#event-daily-prayer-meeting");
    await expect(page.getByRole("heading", { level: 1, name: "Daily Prayer Meeting" })).toBeVisible();
    await expect(page.getByText("Monday - Friday")).toBeVisible();
    await expect(page.getByText("6:00 AM EST")).toBeVisible();
    await expect(page.getByText("Online")).toBeVisible();
    await expect(page.getByText("Join us for daily prayer as we seek God together.")).toBeVisible();
    await expect(page.getByRole("form", { name: "Daily Prayer Meeting registration form" })).toHaveCount(0);
  });

  test("does not expose the removed member portal and protects admin editing", async ({ page }) => {
    await page.goto("/#member-portal");
    await expect(page.getByRole("heading", { level: 1, name: "Home" })).toBeVisible();
    await expect(page.getByRole("form", { name: "Member signup form" })).toHaveCount(0);

    await page.goto("/#admin");
    await expect(page.getByRole("heading", { level: 1, name: "Update ministry content safely." })).toBeVisible();
    await expect(page.getByRole("form", { name: "Admin login form" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Preview Admin Dashboard" })).toHaveCount(0);
  });

  test("does not expose the removed media route", async ({ page }) => {
    await page.goto("/#media");
    await expect(page.getByRole("heading", { level: 1, name: "Home" })).toBeVisible();
    await expect(page.locator("#media")).toHaveCount(0);
  });
});
