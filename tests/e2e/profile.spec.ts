/**
 * Profile Management E2E Tests
 *
 * Tests for profile editing, password change, and avatar upload
 */

import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Profile Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display profile page", async ({ page }) => {
    await page.goto("/profile");

    // Check page title
    await expect(page.locator("h1")).toContainText("Profile");

    // Check for profile sections
    await expect(page.locator("text=Profile Information")).toBeVisible();
  });

  test("should update profile information successfully", async ({ page }) => {
    await page.goto("/profile");

    // Click edit button
    await page.click('button:has-text("Edit Profile")');

    // Wait for dialog/form to open
    await expect(page.locator("text=Name")).toBeVisible();

    // Update name
    const timestamp = Date.now();
    const updatedName = `Admin User ${timestamp}`;

    await page.fill('input[name="name"]', updatedName);

    // Update bio
    await page.fill('textarea[name="bio"]', `Updated bio at ${new Date().toISOString()}`);

    // Submit form
    await page.click('button:has-text("Save Changes")');

    // Verify success message
    await expect(page.locator("text=Profile updated successfully", { exact: false })).toBeVisible({
      timeout: 5000,
    });

    // Verify updated name is displayed
    await expect(page.locator(`text=${updatedName}`)).toBeVisible();
  });

  test("should validate email format when updating profile", async ({ page }) => {
    await page.goto("/profile");

    // Click edit button
    await page.click('button:has-text("Edit Profile")');

    // Enter invalid email
    await page.fill('input[name="email"]', "invalid-email");

    // Submit form
    await page.click('button:has-text("Save Changes")');

    // Verify validation error
    await expect(page.locator("text=Invalid email")).toBeVisible();
  });

  test("should change password successfully", async ({ page }) => {
    await page.goto("/profile");

    // Click change password button/link
    const changePasswordButton = page.locator("text=Change Password").first();

    if (await changePasswordButton.isVisible()) {
      await changePasswordButton.click();

      // Wait for dialog to open
      await expect(page.locator("text=Current Password")).toBeVisible();

      // Fill in password change form
      await page.fill('input[name="currentPassword"]', "Admin123!");
      await page.fill('input[name="newPassword"]', "NewAdmin123!");
      await page.fill('input[name="confirmPassword"]', "NewAdmin123!");

      // Submit form
      await page.click('button:has-text("Change Password")');

      // Verify success message
      await expect(page.locator("text=Password changed successfully")).toBeVisible({
        timeout: 5000,
      });

      // Change password back to original for cleanup
      await changePasswordButton.click();
      await page.fill('input[name="currentPassword"]', "NewAdmin123!");
      await page.fill('input[name="newPassword"]', "Admin123!");
      await page.fill('input[name="confirmPassword"]', "Admin123!");
      await page.click('button:has-text("Change Password")');
    }
  });

  test("should validate password confirmation", async ({ page }) => {
    await page.goto("/profile");

    // Click change password button
    const changePasswordButton = page.locator("text=Change Password").first();

    if (await changePasswordButton.isVisible()) {
      await changePasswordButton.click();

      // Fill in mismatched passwords
      await page.fill('input[name="currentPassword"]', "Admin123!");
      await page.fill('input[name="newPassword"]', "NewAdmin123!");
      await page.fill('input[name="confirmPassword"]', "DifferentPassword123!");

      // Submit form
      await page.click('button:has-text("Change Password")');

      // Verify error message
      await expect(page.locator("text=don't match", { exact: false })).toBeVisible();
    }
  });

  test("should require current password for password change", async ({ page }) => {
    await page.goto("/profile");

    // Click change password button
    const changePasswordButton = page.locator("text=Change Password").first();

    if (await changePasswordButton.isVisible()) {
      await changePasswordButton.click();

      // Fill in wrong current password
      await page.fill('input[name="currentPassword"]', "WrongPassword123!");
      await page.fill('input[name="newPassword"]', "NewAdmin123!");
      await page.fill('input[name="confirmPassword"]', "NewAdmin123!");

      // Submit form
      await page.click('button:has-text("Change Password")');

      // Verify error message
      await expect(
        page.locator("text=Current password is incorrect", { exact: false })
      ).toBeVisible();
    }
  });

  test("should validate new password is different from current", async ({ page }) => {
    await page.goto("/profile");

    // Click change password button
    const changePasswordButton = page.locator("text=Change Password").first();

    if (await changePasswordButton.isVisible()) {
      await changePasswordButton.click();

      // Fill in same password as current
      await page.fill('input[name="currentPassword"]', "Admin123!");
      await page.fill('input[name="newPassword"]', "Admin123!");
      await page.fill('input[name="confirmPassword"]', "Admin123!");

      // Submit form
      await page.click('button:has-text("Change Password")');

      // Verify error message
      await expect(page.locator("text=different from current", { exact: false })).toBeVisible();
    }
  });

  test("should display user information correctly", async ({ page }) => {
    await page.goto("/profile");

    // Check that user information is displayed
    await expect(page.locator("text=Email")).toBeVisible();
    await expect(page.locator("text=Role")).toBeVisible();

    // Verify admin role is displayed
    await expect(page.locator("text=Admin")).toBeVisible();
  });

  test("should cancel profile editing", async ({ page }) => {
    await page.goto("/profile");

    // Get original name
    const originalName = await page.locator('[data-testid="user-name"]').textContent();

    // Click edit button
    await page.click('button:has-text("Edit Profile")');

    // Change name
    await page.fill('input[name="name"]', "Temporary Name");

    // Click cancel
    await page.click('button:has-text("Cancel")');

    // Verify name was not changed
    await page.waitForTimeout(500);
    const currentName = await page.locator('[data-testid="user-name"]').textContent();
    expect(currentName).toBe(originalName);
  });
});
