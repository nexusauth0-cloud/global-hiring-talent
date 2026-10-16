import { test, expect } from "@playwright/test";

test.describe("responsive navigation", () => {
  test.use({ viewport: { width: 375, height: 720 } });

  test("hamburger opens, closes, closes on Escape and on link selection", async ({
    page,
  }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /Open menu|Close menu/ });
    const menu = page.locator("#mobile-menu");

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toHaveCount(0);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toHaveCount(0);

    await toggle.click();
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toHaveCount(0);

    await toggle.click();
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(menu).toHaveCount(0);
  });

  test("desktop navigation shows links and hides the hamburger", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: /Open menu|Close menu/ })
    ).toBeHidden();
    await expect(page.locator('header nav[aria-label="Primary"]')).toBeVisible();
  });
});
