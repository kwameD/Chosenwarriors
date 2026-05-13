import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

const primarySections = [
  "home",
  "ministry-overview",
  "events",
  "media",
  "testimonials",
  "give",
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

  test("supports Sprint 3 giving, member, event, and admin workflows", async ({ page }) => {
    await page.goto("/#give-online");
    const givingForm = page.getByRole("form", { name: "Online giving form" });
    await givingForm.getByLabel("Donation purpose").selectOption("Outreach");
    await givingForm.getByLabel("Giving frequency").selectOption("Monthly recurring");
    await givingForm.getByLabel("Donor name").fill("Generous Visitor");
    await givingForm.getByLabel("Email for receipt").fill("giver@example.com");
    await givingForm.getByRole("button", { name: /create secure checkout/i }).click();
    await expect(page.getByRole("status")).toContainText("Donation intent saved");

    await page.goto("/#member-portal");
    const signupForm = page.getByRole("form", { name: "Member signup form" });
    await signupForm.getByLabel("Full name").fill("Portal Member");
    await signupForm.getByLabel("Signup email").fill("member@example.com");
    await signupForm.getByLabel("Phone number").fill("555-0100");
    await signupForm.getByLabel("Location").fill("New York");
    await signupForm.getByRole("button", { name: "Create Profile" }).click();
    await expect(page.getByRole("heading", { name: "Portal Member" })).toBeVisible();

    await page.goto("/#event-daily-prayer-meeting");
    const eventForm = page.getByRole("form", { name: "Daily Prayer Meeting registration form" });
    await expect(eventForm.getByLabel("Full name")).toHaveValue("Portal Member");
    await eventForm.getByRole("button", { name: "Register for Event" }).click();
    await expect(page.getByRole("status")).toContainText("Registration confirmed");

    await page.goto("/#admin");
    await page.getByRole("button", { name: "Preview Admin Dashboard" }).click();
    await expect(page.getByRole("heading", { name: "CRM Lite Contacts" })).toBeVisible();
    await expect(page.getByText("Member • member@example.com")).toBeVisible();
  });

  test("lets admins upload pictures and load YouTube videos", async ({ page }) => {
    await page.goto("/#admin");
    await page.getByRole("button", { name: "Preview Admin Dashboard" }).click();

    const imageForm = page.getByRole("form", { name: "Admin media image form" });
    await imageForm.getByLabel("Picture file").setInputFiles("public/chosen-warriors-logo.jpg");
    await imageForm.getByLabel("Image description").fill("Admin test gallery image");
    await imageForm.getByLabel("Image category").fill("Admin Upload");
    await imageForm.getByRole("button", { name: "Save Picture" }).click();
    await expect(page.getByRole("status")).toContainText("Gallery image uploaded");
    await expect(page.getByRole("heading", { name: "Uploaded Pictures" }).locator("xpath=ancestor::article").getByText("Admin test gallery image").first()).toBeVisible();

    const videoForm = page.getByRole("form", { name: "Admin YouTube video form" });
    await videoForm.getByLabel("Video title").fill("Admin Test Message");
    await videoForm.getByLabel("YouTube URL or video ID").fill("https://youtu.be/3pAcTlJ-u9M");
    await videoForm.getByLabel("Video category").fill("Teaching");
    await videoForm.getByLabel("Video description").fill("A message loaded from the admin dashboard.");
    await videoForm.getByRole("button", { name: "Load Video" }).click();
    await expect(page.getByRole("status")).toContainText("YouTube video loaded");
    await expect(page.getByRole("heading", { name: "Loaded Videos" }).locator("xpath=ancestor::article").getByText("Admin Test Message").first()).toBeVisible();

    await page.goto("/#media-gallery");
    await expect(page.getByRole("button", { name: /admin upload/i }).first()).toBeVisible();

    await page.goto("/#media");
    await expect(page.getByRole("heading", { name: "Admin Test Message" }).first()).toBeVisible();
  });

  test("defers the YouTube iframe until the user chooses to play", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#media iframe")).toHaveCount(0);

    await page.getByRole("button", { name: /play chosen warriors youtube message/i }).click();

    await expect(page.locator("#media iframe")).toHaveAttribute("src", /youtube\.com\/embed\/3pAcTlJ-u9M/);
  });
});
