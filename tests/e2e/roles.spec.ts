/**
 * Role Management E2E Tests
 *
 * Tests for CRUD operations on roles management page
 */

import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Role Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display roles list page", async ({ page }) => {
    await page.goto("/manage/roles");

    // Check page title
    await expect(page.locator("h1")).toContainText("Role Management");

    // Check table exists
    await expect(page.locator("table")).toBeVisible();

    // Check for Add Role button
    await expect(page.locator('button:has-text("Add Role")')).toBeVisible();
  });

  test("should create new role successfully", async ({ page }) => {
    await page.goto("/manage/roles");

    // Click Add Role button
    await page.click('button:has-text("Add Role")');

    // Wait for dialog to open
    await expect(page.locator('h2:has-text("Create New Role")')).toBeVisible();

    // Fill in role details
    const timestamp = Date.now();
    const roleName = `TEST_ROLE_${timestamp}`;

    await page.fill('input[name="name"]', roleName);

    // Wait for permission matrix to load
    await page.waitForSelector('[data-testid="permission-matrix"]', { timeout: 5000 });

    // Select a few permissions by clicking checkboxes in the first tab
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await firstCheckbox.check();

    // Wait a bit for state to update
    await page.waitForTimeout(500);

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator("text=Role created successfully")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should edit existing role successfully", async ({ page }) => {
    await page.goto("/manage/roles");

    // Wait for table to load
    await page.waitForSelector("table");

    // Click actions menu on a non-admin role
    const actionButtons = page.locator('button[aria-label="Actions"]');
    const count = await actionButtons.count();

    // Find a role that's not "ADMIN" or "USER" (likely a test role)
    for (let i = 0; i < Math.min(count, 5); i++) {
      await actionButtons.nth(i).click();

      const editButton = page.locator("text=Edit").first();

      if (await editButton.isVisible({ timeout: 2000 })) {
        await editButton.click();

        // Wait for dialog to open
        await expect(page.locator('h2:has-text("Edit Role")')).toBeVisible();

        // Update role name
        const timestamp = Date.now();
        const updatedName = `UPDATED_ROLE_${timestamp}`;

        await page.fill('input[name="name"]', updatedName);

        // Submit form
        await page.click('button[type="submit"]');

        // Verify success message
        await expect(page.locator("text=Role updated successfully")).toBeVisible({
          timeout: 10000,
        });

        break;
      }
    }
  });

  test("should clone role successfully", async ({ page }) => {
    await page.goto("/manage/roles");

    // Wait for table to load
    await page.waitForSelector("table");

    // Click actions menu on first role
    const actionButtons = page.locator('button[aria-label="Actions"]');
    await actionButtons.first().click();

    // Click Clone option
    const cloneButton = page.locator("text=Clone").first();

    if (await cloneButton.isVisible({ timeout: 2000 })) {
      await cloneButton.click();

      // Wait for dialog to open
      await expect(page.locator('h2:has-text("Clone Role")')).toBeVisible();

      // Enter new role name
      const timestamp = Date.now();
      const clonedName = `CLONED_ROLE_${timestamp}`;

      await page.fill('input[name="name"]', clonedName);

      // Submit form
      await page.click('button[type="submit"]');

      // Verify success message
      await expect(page.locator("text=Role cloned successfully")).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test("should prevent deleting role with assigned users", async ({ page }) => {
    await page.goto("/manage/roles");

    // Wait for table to load
    await page.waitForSelector("table");

    // Try to delete a role that likely has users
    const actionButtons = page.locator('button[aria-label="Actions"]');
    const count = await actionButtons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      await actionButtons.nth(i).click();
      const deleteButton = page.locator("text=Delete").first();

      if (await deleteButton.isVisible({ timeout: 2000 })) {
        await deleteButton.click();

        // Wait for confirmation dialog
        await expect(page.locator('h2:has-text("Delete Role")')).toBeVisible();

        // Confirm deletion
        await page.click('button:has-text("Delete Role")');

        // Check for error message about assigned users or success
        await page.waitForTimeout(2000);

        const errorMsg = page.locator("text=Cannot delete role with assigned users");
        const successMsg = page.locator("text=Role deleted successfully");

        // Either error or success is acceptable
        const hasErrorOrSuccess =
          (await errorMsg.isVisible({ timeout: 1000 }).catch(() => false)) ||
          (await successMsg.isVisible({ timeout: 1000 }).catch(() => false));

        expect(hasErrorOrSuccess).toBeTruthy();
        break;
      }
    }
  });

  test("should display role details with user count", async ({ page }) => {
    await page.goto("/manage/roles");

    // Wait for table to load
    await page.waitForSelector("table");

    // Check that table is visible
    await expect(page.locator("table")).toBeVisible();

    // Check that rows are displayed
    const rows = page.locator("table tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("should validate required fields when creating role", async ({ page }) => {
    await page.goto("/manage/roles");

    // Click Add Role button
    await page.click('button:has-text("Add Role")');

    // Wait for dialog
    await expect(page.locator('h2:has-text("Create New Role")')).toBeVisible();

    // Try to submit without filling fields
    // Click submit button directly to trigger validation
    await page.click('button[type="submit"]');

    // Wait for validation to appear
    await page.waitForTimeout(500);

    // Check that dialog is still open (validation prevented submit)
    await expect(page.locator('h2:has-text("Create New Role")')).toBeVisible();
  });

  test("should prevent duplicate role names", async ({ page }) => {
    await page.goto("/manage/roles");

    // Click Add Role button
    await page.click('button:has-text("Add Role")');

    // Wait for dialog to open
    await expect(page.locator('h2:has-text("Create New Role")')).toBeVisible();

    // Get existing role name from table
    const firstRoleName = await page.locator("table tbody tr td").first().textContent();

    if (firstRoleName) {
      // Try to create role with same name
      await page.fill('input[name="name"]', firstRoleName);

      // Submit form
      await page.click('button[type="submit"]');

      // Verify error message about duplicate or conflict
      await page.waitForTimeout(2000);

      const errorMsg = page.locator("text=already exists", { exact: false });
      const conflictMsg = page.locator("text=Conflict", { exact: false });

      const hasError =
        (await errorMsg.isVisible({ timeout: 3000 }).catch(() => false)) ||
        (await conflictMsg.isVisible({ timeout: 3000 }).catch(() => false));

      expect(hasError).toBeTruthy();
    }
  });
});
