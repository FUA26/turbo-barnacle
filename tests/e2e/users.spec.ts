/**
 * User Management E2E Tests
 *
 * Tests for CRUD operations on users management page
 */

import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("User Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display users list page", async ({ page }) => {
    await page.goto("/manage/users");

    // Check page title
    await expect(page.locator("h1")).toContainText("User Management");

    // Check table exists
    await expect(page.locator("table")).toBeVisible();

    // Check for Add User button
    await expect(page.locator('button:has-text("Add User")')).toBeVisible();
  });

  test("should create new user successfully", async ({ page }) => {
    await page.goto("/manage/users");

    // Click Add User button
    await page.click('button:has-text("Add User")');

    // Wait for dialog to open
    await expect(page.locator('h2:has-text("Create New User")')).toBeVisible();

    // Fill in user details
    const timestamp = Date.now();
    const testUser = {
      name: `Test User ${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: "Test1234!",
    };

    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);

    // Select role (click the select trigger)
    await page.click('[role="combobox"]');

    // Wait for dropdown and select first role
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]:first-child');

    // Submit form
    await page.click('button:has-text("Create User")');

    // Verify success message
    await expect(page.locator("text=User created successfully")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should edit existing user successfully", async ({ page }) => {
    await page.goto("/manage/users");

    // Wait for table to load
    await page.waitForSelector("table");

    // Click actions menu on first user
    await page.locator('button[aria-label="Actions"]').first().click();

    // Click Edit option
    await page.click("text=Edit");

    // Wait for dialog to open
    await expect(page.locator('h2:has-text("Edit User")')).toBeVisible();

    // Update user name
    const timestamp = Date.now();
    const updatedName = `Updated User ${timestamp}`;

    await page.fill('input[name="name"]', updatedName);

    // Submit form
    await page.click('button:has-text("Update User")');

    // Verify success message
    await expect(page.locator("text=User updated successfully")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should delete user successfully", async ({ page }) => {
    await page.goto("/manage/users");

    // Wait for table to load
    await page.waitForSelector("table");

    // Count users before deletion
    const usersBefore = await page.locator("table tbody tr").count();

    // Click actions menu on first user (skip admin if it's first)
    const actionButtons = page.locator('button[aria-label="Actions"]');
    await actionButtons.nth(1).click(); // Use second user to avoid deleting yourself

    // Click Delete option
    await page.click("text=Delete");

    // Wait for confirmation dialog
    await expect(page.locator('h2:has-text("Delete User")')).toBeVisible();

    // Confirm deletion
    await page.click('button:has-text("Delete User")');

    // Verify success message
    await expect(page.locator("text=User deleted successfully")).toBeVisible({
      timeout: 5000,
    });

    // Verify user count decreased
    await page.waitForTimeout(1000); // Wait for refresh
    const usersAfter = await page.locator("table tbody tr").count();
    expect(usersAfter).toBe(usersBefore - 1);
  });

  test("should validate required fields when creating user", async ({ page }) => {
    await page.goto("/manage/users");

    // Click Add User button
    await page.click('button:has-text("Add User")');

    // Wait for dialog
    await expect(page.locator('h2:has-text("Create New User")')).toBeVisible();

    // Try to submit without filling fields - the form should show validation
    await page.fill('input[name="name"]', ""); // Clear field
    await page.fill('input[name="email"]', ""); // Clear field

    // Click outside or try to submit to trigger validation
    await page.click('button[type="submit"]');

    // Wait a bit for validation to appear
    await page.waitForTimeout(500);

    // Check that we're still on the dialog (form didn't submit)
    await expect(page.locator('h2:has-text("Create New User")')).toBeVisible();
  });

  test("should prevent deleting own account", async ({ page }) => {
    await page.goto("/manage/users");

    // Wait for table to load
    await page.waitForSelector("table");

    // Try to find and click delete on admin user
    const rows = page.locator("table tbody tr");
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const email = await row.locator("td").nth(1).textContent();

      if (email?.includes("admin")) {
        // Click actions menu
        await row.locator('button[aria-label="Actions"]').click();

        // Check if Delete button exists or is disabled
        const deleteButton = page.locator("text=Delete");

        // The delete button might not exist for own account, or clicking it should show an error
        const isVisible = await deleteButton.isVisible();

        if (isVisible) {
          await deleteButton.click();
          await page.click('button:has-text("Delete User")');

          // Should get error about deleting own account
          await expect(
            page.locator("text=cannot delete your own account", { exact: false })
          ).toBeVisible({ timeout: 3000 });
        }

        break;
      }
    }
  });
});
