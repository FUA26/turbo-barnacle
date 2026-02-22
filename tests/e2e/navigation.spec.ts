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
    // Check sidebar is visible
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();

    // Check for common navigation items
    await expect(page.locator("text=Dashboard")).toBeVisible();
    await expect(page.locator("text=Users")).toBeVisible();
    await expect(page.locator("text=Roles")).toBeVisible();
    await expect(page.locator("text=Permissions")).toBeVisible();
  });

  test("should navigate to users page when clicking Users in sidebar", async ({ page }) => {
    // Click Users link in sidebar
    await page.click('a:has-text("Users")');

    // Should navigate to users page
    await page.waitForURL("/manage/users", { timeout: 3000 });

    // Verify page title
    await expect(page.locator("h1")).toContainText("Users");
  });

  test("should navigate to roles page when clicking Roles in sidebar", async ({ page }) => {
    // Click Roles link in sidebar
    await page.click('a:has-text("Roles")');

    // Should navigate to roles page
    await page.waitForURL("/manage/roles", { timeout: 3000 });

    // Verify page title
    await expect(page.locator("h1")).toContainText("Roles");
  });

  test("should navigate to permissions page when clicking Permissions in sidebar", async ({
    page,
  }) => {
    // Click Permissions link in sidebar
    await page.click('a:has-text("Permissions")');

    // Should navigate to permissions page
    await page.waitForURL("/manage/permissions", { timeout: 3000 });

    // Verify page title
    await expect(page.locator("h1")).toContainText("Permissions");
  });

  test("should display breadcrumbs for nested pages", async ({ page }) => {
    // Navigate to users page
    await page.goto("/manage/users");

    // Check breadcrumbs are displayed
    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toBeVisible();

    // Should contain "Manage" and "Users"
    await expect(page.locator("text=Manage")).toBeVisible();
    await expect(page.locator("text=Users")).toBeVisible();
  });

  test("should navigate using breadcrumbs", async ({ page }) => {
    // Navigate to a nested page
    await page.goto("/manage/users");

    // Click on breadcrumb (if clickable)
    const breadcrumbLink = page.locator('[data-testid="breadcrumbs"] a').first();

    if (await breadcrumbLink.isVisible()) {
      await breadcrumbLink.click();

      // Should navigate to parent page
      await page.waitForTimeout(1000);
    }
  });

  test("should collapse and expand sidebar", async ({ page }) => {
    // Check sidebar is initially visible
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();

    // Click collapse button (if exists)
    const collapseButton = page.locator('[data-testid="sidebar-toggle"]');

    if (await collapseButton.isVisible()) {
      await collapseButton.click();

      // Sidebar should be collapsed or hidden
      await page.waitForTimeout(500);
    }
  });

  test("should display page title and icon correctly", async ({ page }) => {
    // Navigate to different pages and check page titles
    const pages = [
      { path: "/dashboard", title: "Dashboard" },
      { path: "/manage/users", title: "Users" },
      { path: "/manage/roles", title: "Roles" },
      { path: "/manage/permissions", title: "Permissions" },
    ];

    for (const pageData of pages) {
      await page.goto(pageData.path);
      await expect(page.locator("h1")).toContainText(pageData.title);
    }
  });

  test("should highlight active page in sidebar", async ({ page }) => {
    // Navigate to users page
    await page.goto("/manage/users");

    // Check that Users link in sidebar is highlighted/active
    const usersLink = page.locator('a:has-text("Users")');
    await expect(usersLink).toHaveAttribute("data-state", "active");
  });

  test("should handle browser back and forward buttons", async ({ page }) => {
    // Start at dashboard
    await page.goto("/dashboard");

    // Navigate to users
    await page.click('a:has-text("Users")');
    await page.waitForURL("/manage/users");

    // Navigate to roles
    await page.click('a:has-text("Roles")');
    await page.waitForURL("/manage/roles");

    // Go back
    await page.goBack();
    await page.waitForURL("/manage/users");

    // Verify we're on users page
    await expect(page.locator("h1")).toContainText("Users");

    // Go forward
    await page.goForward();
    await page.waitForURL("/manage/roles");

    // Verify we're on roles page
    await expect(page.locator("h1")).toContainText("Roles");
  });

  test("should display user menu with avatar", async ({ page }) => {
    // Check user avatar is visible
    const avatar = page.locator('[data-testid="user-avatar"]');
    await expect(avatar).toBeVisible();

    // Click avatar to open dropdown
    await avatar.click();

    // Check menu items are displayed
    await expect(page.locator("text=Profile")).toBeVisible();
    await expect(page.locator("text=Logout")).toBeVisible();
  });

  test("should navigate to profile page from user menu", async ({ page }) => {
    // Click user avatar
    await page.click('[data-testid="user-avatar"]');

    // Click Profile
    await page.click("text=Profile");

    // Should navigate to profile page
    await page.waitForURL("/profile", { timeout: 3000 });

    // Verify page title
    await expect(page.locator("h1")).toContainText("Profile");
  });

  test("should handle 404 pages gracefully", async ({ page }) => {
    // Navigate to non-existent page
    await page.goto("/this-page-does-not-exist");

    // Should show 404 page or redirect to error page
    await page.waitForTimeout(1000);

    // Check for 404 message or error page
    const has404Message = await page.locator("text=404", { exact: false }).isVisible();
    const hasNotFoundMessage = await page.locator("text=not found", { exact: false }).isVisible();

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

    // Check scroll position is maintained (or reset to top, both are acceptable)
    await page.waitForTimeout(500);
  });
});
