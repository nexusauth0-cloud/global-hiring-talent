import { test, expect } from "@playwright/test";

test("homepage renders and key pages are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1").first()).toContainText(/Connecting talent/i);

  await page.goto("/jobs");
  await expect(page.locator("h1")).toContainText(/Find your next opportunity/i);

  await page.goto("/about");
  await expect(page.locator("h1")).toContainText(/recruitment partner/i);

  await page.goto("/contact");
  await expect(page.locator("h1")).toContainText(/talk/i);

  await page.goto("/login");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
});

test("auth-protected routes redirect to login", async ({ page }) => {
  const resp = await page.goto("/candidate");
  // Playwright follows redirects; expect final URL to include /login
  await expect(page).toHaveURL(/login/);
});
