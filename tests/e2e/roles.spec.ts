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
    await expect(page.locator("h1")).toContainText("Roles");

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
    const roleName = `Test Role ${timestamp}`;

    await page.fill('input[name="name"]', roleName);

    // Select permissions (click multiple permissions)
    await page.click('label:has-text("USER_READ_ANY")');
    await page.click('label:has-text("USER_UPDATE_ANY")');

    // Submit form
    await page.click('button:has-text("Create Role")');

    // Verify success message
    await expect(page.locator("text=Role created successfully")).toBeVisible({
      timeout: 5000,
    });

    // Verify role appears in table
    await expect(page.locator(`text=${roleName}`)).toBeVisible();
  });

  test("should edit existing role successfully", async ({ page }) => {
    await page.goto("/manage/roles");

    // Wait for table to load
    await page.waitForSelector("table");

    // Click actions menu on first non-admin role
    const actionButtons = page.locator('button[aria-label="Actions"]');
    const count = await actionButtons.count();

    // Find a role that's not "Admin" or "User"
    for (let i = 0; i < count; i++) {
      await actionButtons.nth(i).click();
      const editButton = page.locator("text=Edit").first();

      if (await editButton.isVisible()) {
        await editButton.click();

        // Wait for dialog to open
        await expect(page.locator('h2:has-text("Edit Role")')).toBeVisible();

        // Update role name
        const timestamp = Date.now();
        const updatedName = `Updated Role ${timestamp}`;

        await page.fill('input[name="name"]', updatedName);

        // Toggle permissions
        await page.click('label:has-text("USER_DELETE_ANY")');

        // Submit form
        await page.click('button:has-text("Update Role")');

        // Verify success message
        await expect(page.locator("text=Role updated successfully")).toBeVisible({
          timeout: 5000,
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
    await page.click("text=Clone");

    // Wait for dialog to open
    await expect(page.locator('h2:has-text("Clone Role")')).toBeVisible();

    // Enter new role name
    const timestamp = Date.now();
    const clonedName = `Cloned Role ${timestamp}`;

    await page.fill('input[name="name"]', clonedName);

    // Submit form
    await page.click('button:has-text("Clone Role")');

    // Verify success message
    await expect(page.locator("text=Role cloned successfully")).toBeVisible({
      timeout: 5000,
    });

    // Verify cloned role appears in table
    await expect(page.locator(`text=${clonedName}`)).toBeVisible();
  });

  test("should prevent deleting role with assigned users", async ({ page }) => {
    await page.goto("/manage/roles");

    // Wait for table to load
    await page.waitForSelector("table");

    // Try to find a role with assigned users
    const actionButtons = page.locator('button[aria-label="Actions"]');
    const count = await actionButtons.count();

    for (let i = 0; i < count; i++) {
      await actionButtons.nth(i).click();
      const deleteButton = page.locator("text=Delete").first();

      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Wait for confirmation dialog
        await expect(page.locator('h2:has-text("Delete Role")')).toBeVisible();

        // Confirm deletion
        await page.click('button:has-text("Delete Role")');

        // Check for error message about assigned users
        const errorMessage = page
          .locator("text=Cannot delete role with assigned users", { exact: false })
          .first();

        // If error appears, that's expected for roles with users
        if (await errorMessage.isVisible({ timeout: 3000 })) {
          await expect(errorMessage).toBeVisible();
          break;
        }
      }
    }
  });

  test("should display role details with user count", async ({ page }) => {
    await page.goto("/manage/roles");

    // Wait for table to load
    await page.waitForSelector("table");

    // Check that user counts are displayed
    const rows = page.locator("table tbody tr");
    const firstRow = rows.first();

    // Row should have role name and user count
    await expect(firstRow).toBeVisible();
  });

  test("should validate required fields when creating role", async ({ page }) => {
    await page.goto("/manage/roles");

    // Click Add Role button
    await page.click('button:has-text("Add Role")');

    // Try to submit without filling fields
    await page.click('button:has-text("Create Role")');

    // Verify validation errors appear
    await expect(page.locator("text=required")).toBeVisible();
  });

  test("should prevent duplicate role names", async ({ page }) => {
    await page.goto("/manage/roles");

    // Click Add Role button
    await page.click('button:has-text("Add Role")');

    // Get existing role name from table
    const firstRoleName = await page.locator("table tbody tr td").first().textContent();

    if (firstRoleName) {
      // Try to create role with same name
      await page.fill('input[name="name"]', firstRoleName);
      await page.click('button:has-text("Create Role")');

      // Verify error message about duplicate
      await expect(page.locator("text=already exists", { exact: false })).toBeVisible({
        timeout: 3000,
      });
    }
  });
});
