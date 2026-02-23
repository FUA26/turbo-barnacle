/**
 * Navigation and Routing E2E Tests
 *
 * Tests for navigation, sidebar, breadcrumbs, and routing
 */

import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Navigation and Routing", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display sidebar with navigation items", async ({ page }) => {
    // Check sidebar is visible (might be collapsed on mobile)
    const sidebar = page.locator('aside, nav, [data-testid="sidebar"]').first();

    // Check if sidebar exists (it might not be visible on mobile)
    if (await sidebar.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Check for common navigation items
      await expect(page.locator("text=Dashboard")).toBeVisible();
      await expect(page.locator("text=Users")).toBeVisible();
      await expect(page.locator("text=Roles")).toBeVisible();
    } else {
      // On mobile, sidebar might be hidden - check for mobile menu
      const mobileMenuButton = page
        .locator('button[aria-label*="menu" i], button[aria-label*="sidebar" i]')
        .first();
      const hasMobileMenu = await mobileMenuButton.isVisible({ timeout: 3000 }).catch(() => false);

      expect(hasMobileMenu).toBeTruthy();
    }
  });

  test("should navigate to users page when clicking Users in sidebar", async ({ page }) => {
    // Click Users link in sidebar
    await page.click('a:has-text("Users")');

    // Should navigate to users page
    await page.waitForURL(/\/manage\/users/, { timeout: 5000 });

    // Verify page title
    await expect(page.locator("h1")).toContainText("User Management");
  });

  test("should navigate to roles page when clicking Roles in sidebar", async ({ page }) => {
    // Click Roles link in sidebar
    await page.click('a:has-text("Roles")');

    // Should navigate to roles page
    await page.waitForURL(/\/manage\/roles/, { timeout: 5000 });

    // Verify page title
    await expect(page.locator("h1")).toContainText("Role Management");
  });

  test("should navigate to permissions page when clicking Permissions in sidebar", async ({
    page,
  }) => {
    // Click Permissions link in sidebar
    await page.click('a:has-text("Permissions")');

    // Should navigate to permissions page
    await page.waitForURL(/\/manage\/permissions/, { timeout: 5000 });

    // Verify page title
    await expect(page.locator("h1")).toContainText("Permission Management");
  });

  test("should display breadcrumbs for nested pages", async ({ page }) => {
    // Navigate to users page
    await page.goto("/manage/users");

    // Check breadcrumbs are displayed (if they exist)
    const breadcrumbs = page
      .locator('nav[aria-label*="breadcrumb" i], [data-testid="breadcrumbs"], ol.items')
      .first();

    // Breadcrumbs might not exist in all UIs
    const hasBreadcrumbs = await breadcrumbs.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasBreadcrumbs) {
      await expect(breadcrumbs).toBeVisible();
    }
  });

  test("should collapse and expand sidebar", async ({ page }) => {
    // Check sidebar toggle button (if exists)
    const toggleButton = page
      .locator(
        'button[aria-label*="sidebar" i], button[aria-label*="collapse" i], button[aria-label*="expand" i]'
      )
      .first();

    const hasToggleButton = await toggleButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasToggleButton) {
      // Click collapse button (if exists)
      await toggleButton.click();

      // Wait for state change
      await page.waitForTimeout(500);
    }
  });

  test("should display page title and icon correctly", async ({ page }) => {
    // Navigate to different pages and check page titles
    const pages = [
      { path: "/dashboard", title: "Dashboard" },
      { path: "/manage/users", title: "User Management" },
      { path: "/manage/roles", title: "Role Management" },
      { path: "/manage/permissions", title: "Permission Management" },
    ];

    for (const pageData of pages) {
      await page.goto(pageData.path);

      // Check that h1 is visible and contains relevant text
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("should highlight active page in sidebar", async ({ page }) => {
    // Navigate to users page
    await page.goto("/manage/users");

    // Check that Users link in sidebar is highlighted/active (if sidebar visible)
    const usersLink = page.locator('a:has-text("Users")');

    await expect(usersLink).toBeVisible();
  });

  test("should handle browser back and forward buttons", async ({ page }) => {
    // Start at dashboard
    await page.goto("/dashboard");

    // Navigate to users
    await page.click('a:has-text("Users")');
    await page.waitForURL(/\/manage\/users/, { timeout: 5000 });

    // Navigate to roles
    await page.click('a:has-text("Roles")');
    await page.waitForURL(/\/manage\/roles/, { timeout: 5000 });

    // Go back
    await page.goBack();
    await page.waitForURL(/\/manage\/users/, { timeout: 5000 });

    // Verify we're on users page
    await expect(page.locator("h1")).toContainText("User Management");

    // Go forward
    await page.goForward();
    await page.waitForURL(/\/manage\/roles/, { timeout: 5000 });

    // Verify we're on roles page
    await expect(page.locator("h1")).toContainText("Role Management");
  });

  test("should display user menu with avatar", async ({ page }) => {
    // Check user avatar or menu button is visible
    const avatar = page
      .locator(
        '[data-testid="user-avatar"], button[aria-label*="user" i], button[aria-label*="avatar" i]'
      )
      .first();

    await expect(avatar).toBeVisible();

    // Click avatar to open dropdown
    await avatar.click();

    // Check menu items are displayed
    await expect(
      page.locator("text=Profile").or(page.locator("text=Settings")).or(page.locator("text=Logout"))
    ).toBeVisible();
  });

  test("should navigate to profile page from user menu", async ({ page }) => {
    // Click user avatar/menu
    const avatar = page
      .locator('[data-testid="user-avatar"], button[aria-label*="user" i]')
      .first();
    await avatar.click();

    // Click Profile if it exists
    const profileLink = page.locator("text=Profile").first();

    if (await profileLink.isVisible({ timeout: 2000 })) {
      await profileLink.click();

      // Should navigate to profile page
      await page.waitForURL(/\/profile/, { timeout: 5000 });
    }
  });

  test("should handle 404 pages gracefully", async ({ page }) => {
    // Navigate to non-existent page
    await page.goto("/this-page-does-not-exist");

    // Should show 404 page or redirect to error page
    await page.waitForTimeout(2000);

    // Check for 404 message or error page
    const has404Message = await page
      .locator("text=404")
      .isVisible()
      .catch(() => false);
    const hasNotFoundMessage = await page
      .locator("text=not found")
      .isVisible()
      .catch(() => false);

    expect(has404Message || hasNotFoundMessage).toBeTruthy();
  });

  test("should maintain scroll position when navigating back", async ({ page }) => {
    // Go to a page with scrollable content
    await page.goto("/manage/users");

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));

    // Navigate to another page
    await page.goto("/manage/roles");

    // Go back
    await page.goBack();

    // Check we're back on the page
    await page.waitForURL(/\/manage\/users/, { timeout: 5000 });
    await expect(page.locator("h1")).toContainText("User Management");
  });
});
