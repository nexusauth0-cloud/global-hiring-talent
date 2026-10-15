import { test, expect } from "@playwright/test";

test("homepage renders and key pages are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Connecting talent");

  await page.goto("/jobs");
  await expect(page.locator("h1")).toContainText(/Jobs/i);

  await page.goto("/about");
  await expect(page.locator("h1")).toContainText(/About/i);

  await page.goto("/contact");
  await expect(page.locator("h1")).toContainText(/Contact/i);

  await page.goto("/login");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
});

test("auth-protected routes redirect to login", async ({ page }) => {
  const resp = await page.goto("/candidate");
  expect(resp?.status()).toBe(307);
  await expect(page).toHaveURL(/login/);
});
