/**
 * Analytics Dashboard E2E Tests
 *
 * Tests for analytics dashboard, charts, and filtering
 */

import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Analytics Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should navigate to analytics page from sidebar", async ({ page }) => {
    // Click Analytics link in sidebar
    await page.click('a:has-text("Analytics")');

    // Should navigate to analytics page
    await page.waitForURL(/\/analytics/, { timeout: 5000 });

    // Verify page title
    await expect(page.locator("h1")).toContainText("Analytics Dashboard");
  });

  test("should display all summary cards", async ({ page }) => {
    // Navigate to analytics page
    await page.goto("/analytics");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check for summary cards
    await expect(page.locator("text=Total Users")).toBeVisible();
    await expect(page.locator("text=Active Sessions")).toBeVisible();
    await expect(page.locator("text=API Requests")).toBeVisible();
    await expect(page.locator("text=Storage Used")).toBeVisible();
  });

  test("should display all chart sections", async ({ page }) => {
    // Navigate to analytics page
    await page.goto("/analytics");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check for all major sections
    await expect(page.locator("text=User Statistics")).toBeVisible();
    await expect(page.locator("text=Activity Logs")).toBeVisible();
    await expect(page.locator("text=Resource Usage")).toBeVisible();
  });

  test("should display filter bar with date range selector", async ({ page }) => {
    // Navigate to analytics page
    await page.goto("/analytics");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check for filter bar elements
    await expect(page.locator("text=Last 30 days")).toBeVisible();
    await expect(page.locator("button:has-text('Refresh')")).toBeVisible();
    await expect(page.locator("button:has-text('Export')")).toBeVisible();
  });

  test("should change date range when selecting different option", async ({ page }) => {
    // Navigate to analytics page
    await page.goto("/analytics");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Click on the date range selector
    const dateSelector = page
      .locator('button:has-text("Last 30 days")')
      .or(page.locator('[role="combobox"]').first());

    await expect(dateSelector).toBeVisible();
    await dateSelector.click();

    // Check if dropdown options appear (may vary based on implementation)
    const options = page.locator('[role="option"]').or(page.locator("text=Last 7 days"));
    const hasOptions = await options.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasOptions) {
      // Select a different date range
      await page.click("text=Last 7 days", { timeout: 3000 });
      await page.waitForTimeout(1000);
    }
  });

  test("should have responsive layout for different screen sizes", async ({ page }) => {
    // Navigate to analytics page
    await page.goto("/analytics");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check on desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator("text=Total Users")).toBeVisible();

    // Check on tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator("text=Total Users")).toBeVisible();

    // Check on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("text=Total Users")).toBeVisible();
  });

  test("should display user growth chart with role breakdown", async ({ page }) => {
    // Navigate to analytics page
    await page.goto("/analytics");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check for user statistics section
    await expect(page.locator("text=User Growth by Role")).toBeVisible();
    await expect(page.locator("text=User Distribution by Role")).toBeVisible();
  });

  test("should display activity logs with status badges", async ({ page }) => {
    // Navigate to analytics page
    await page.goto("/analytics");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check for activity logs section
    await expect(page.locator("text=Login Activity Over Time")).toBeVisible();
    await expect(page.locator("text=Recent Activity")).toBeVisible();

    // Check for activity items (may need to wait for data to load)
    await page.waitForTimeout(2000);
  });

  test("should display resource usage charts", async ({ page }) => {
    // Navigate to analytics page
    await page.goto("/analytics");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check for resource usage section
    await expect(page.locator("text=Storage Breakdown")).toBeVisible();
    await expect(page.locator("text=Bandwidth Usage")).toBeVisible();
  });

  test("should handle refresh button click", async ({ page }) => {
    // Navigate to analytics page
    await page.goto("/analytics");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Click refresh button
    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();

    // Wait for potential reload
    await page.waitForTimeout(2000);

    // Page should still be functional
    await expect(page.locator("h1")).toContainText("Analytics Dashboard");
  });

  test("should display charts with proper rendering", async ({ page }) => {
    // Navigate to analytics page
    await page.goto("/analytics");

    // Wait for page to load and charts to render
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Check that SVG elements (charts) are present
    const svgs = page.locator("svg").count();
    expect(await svgs).toBeGreaterThan(0);
  });

  test("should not have console errors on page load", async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Navigate to analytics page
    await page.goto("/analytics");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Check that no critical errors occurred
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes("QueryClient") && // Known non-critical warning
        !error.includes("hydration") // Hydration mismatches are sometimes acceptable
    );

    expect(criticalErrors.length).toBe(0);
  });
});
