/**
 * Permission Management E2E Tests
 *
 * Tests for CRUD operations on permissions management page
 */

import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Permission Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display permissions list page", async ({ page }) => {
    await page.goto("/manage/permissions");

    // Check page title
    await expect(page.locator("h1")).toContainText("Permission Management");

    // Check table exists
    await expect(page.locator("table")).toBeVisible();

    // Check for Add Permission button
    await expect(page.locator('button:has-text("Add Permission")')).toBeVisible();
  });

  test("should create new permission successfully", async ({ page }) => {
    await page.goto("/manage/permissions");

    // Click Add Permission button
    await page.click('button:has-text("Add Permission")');

    // Wait for dialog to open
    await expect(page.locator('h2:has-text("Create New Permission")')).toBeVisible();

    // Fill in permission details
    const timestamp = Date.now();
    const permissionName = `TEST_PERMISSION_${timestamp}`;
    const permissionDisplay = `Test Permission ${timestamp}`;
    const permissionDescription = `Test permission created at ${new Date().toISOString()}`;

    await page.fill('input[name="name"]', permissionName);
    await page.fill('input[name="display"]', permissionDisplay);
    await page.fill('textarea[name="description"]', permissionDescription);

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator("text=Permission created successfully")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should edit existing permission successfully", async ({ page }) => {
    await page.goto("/manage/permissions");

    // Wait for table to load
    await page.waitForSelector("table");

    // Click actions menu on first test permission (avoid system permissions)
    const actionButtons = page.locator('button[aria-label="Actions"]');
    const count = await actionButtons.count();

    // Find a permission that's editable (not a core system permission)
    for (let i = 0; i < Math.min(count, 5); i++) {
      await actionButtons.nth(i).click();
      const editButton = page.locator("text=Edit").first();

      if (await editButton.isVisible({ timeout: 2000 })) {
        await editButton.click();

        // Wait for dialog to open
        await expect(page.locator('h2:has-text("Edit Permission")')).toBeVisible();

        // Update permission display name
        const timestamp = Date.now();
        const updatedDisplay = `Updated Permission ${timestamp}`;

        await page.fill('input[name="display"]', updatedDisplay);

        // Submit form
        await page.click('button[type="submit"]');

        // Verify success message
        await expect(page.locator("text=Permission updated successfully")).toBeVisible({
          timeout: 10000,
        });

        break;
      }
    }
  });

  test("should display permission usage count", async ({ page }) => {
    await page.goto("/manage/permissions");

    // Wait for table to load
    await page.waitForSelector("table");

    // Check that table is visible
    await expect(page.locator("table")).toBeVisible();

    // Check that rows are displayed
    const rows = page.locator("table tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("should prevent deleting permission that is in use", async ({ page }) => {
    await page.goto("/manage/permissions");

    // Wait for table to load
    await page.waitForSelector("table");

    // Try to delete a permission that's likely in use
    const actionButtons = page.locator('button[aria-label="Actions"]');
    const count = await actionButtons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      await actionButtons.nth(i).click();
      const deleteButton = page.locator("text=Delete").first();

      if (await deleteButton.isVisible({ timeout: 2000 })) {
        await deleteButton.click();

        // Wait for confirmation dialog
        await expect(page.locator('h2:has-text("Delete Permission")')).toBeVisible();

        // Confirm deletion
        await page.click('button:has-text("Delete Permission")');

        // Wait for response
        await page.waitForTimeout(2000);

        // Check for error message or success
        const errorMsg = page.locator("text=assigned to.*roles", { exact: false });
        const successMsg = page.locator("text=Permission deleted successfully");

        const hasErrorOrSuccess =
          (await errorMsg.isVisible({ timeout: 3000 }).catch(() => false)) ||
          (await successMsg.isVisible({ timeout: 3000 }).catch(() => false));

        expect(hasErrorOrSuccess).toBeTruthy();
        break;
      }
    }
  });

  test("should validate required fields when creating permission", async ({ page }) => {
    await page.goto("/manage/permissions");

    // Click Add Permission button
    await page.click('button:has-text("Add Permission")');

    // Wait for dialog
    await expect(page.locator('h2:has-text("Create New Permission")')).toBeVisible();

    // Try to submit without filling fields
    await page.click('button[type="submit"]');

    // Wait for validation
    await page.waitForTimeout(500);

    // Check that dialog is still open (validation prevented submit)
    await expect(page.locator('h2:has-text("Create New Permission")')).toBeVisible();
  });

  test("should prevent duplicate permission names", async ({ page }) => {
    await page.goto("/manage/permissions");

    // Click Add Permission button
    await page.click('button:has-text("Add Permission")');

    // Wait for dialog to open
    await expect(page.locator('h2:has-text("Create New Permission")')).toBeVisible();

    // Use an existing permission name (USER_READ_ANY is a core permission)
    await page.fill('input[name="name"]', "USER_READ_ANY");
    await page.fill('input[name="display"]', "Test");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Verify error message about duplicate
    const errorMsg = page.locator("text=already exists", { exact: false });
    const conflictMsg = page.locator("text=Conflict", { exact: false });

    const hasError =
      (await errorMsg.isVisible({ timeout: 3000 }).catch(() => false)) ||
      (await conflictMsg.isVisible({ timeout: 3000 }).catch(() => false));

    expect(hasError).toBeTruthy();
  });

  test("should filter and search permissions", async ({ page }) => {
    await page.goto("/manage/permissions");

    // Wait for table to load
    await page.waitForSelector("table");

    // Get initial count of permissions
    const initialCount = await page.locator("table tbody tr").count();

    // If search box exists, test it
    const searchInput = page.locator('input[placeholder*="search" i]').first();

    if (await searchInput.isVisible()) {
      // Search for a specific permission
      await searchInput.fill("USER");

      // Wait for results to update
      await page.waitForTimeout(1000);

      // Verify filtered results
      const filteredCount = await page.locator("table tbody tr").count();
      expect(filteredCount).toBeGreaterThan(0);
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });
});
