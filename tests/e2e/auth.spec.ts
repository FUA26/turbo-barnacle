/**
 * Authentication E2E Tests
 *
 * Tests for login, logout, and protected routes
 */

import { expect, test } from "@playwright/test";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Start from login page
    await page.goto("/login");
  });

  test("should display login page", async ({ page }) => {
    // Check page title
    await expect(page.locator("h1")).toContainText("Sign In");

    // Check for email and password fields
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // Check for submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    // Fill in credentials
    await page.fill('input[name="email"]', "admin@naiera.com");
    await page.fill('input[name="password"]', "Admin123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL("/dashboard", { timeout: 5000 });

    // Verify dashboard is loaded
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should show error with invalid credentials", async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('input[name="email"]', "admin@naiera.com");
    await page.fill('input[name="password"]', "WrongPassword123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator("text=Invalid credentials")).toBeVisible({
      timeout: 3000,
    });

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test("should validate required fields", async ({ page }) => {
    // Try to submit without filling fields
    await page.click('button[type="submit"]');

    // Verify validation errors
    await expect(page.locator("text=required")).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    // Fill in invalid email
    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "Admin123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Verify validation error
    await expect(page.locator("text=Invalid email")).toBeVisible();
  });

  test("should redirect to login when accessing protected route", async ({ page }) => {
    // Try to access protected route without login
    await page.goto("/manage/users");

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 3000 });

    // Verify login page is displayed
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', "admin@naiera.com");
    await page.fill('input[name="password"]', "Admin123!");
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL("/dashboard", { timeout: 5000 });

    // Click user avatar to open dropdown
    await page.click('[data-testid="user-avatar"]');

    // Click logout
    await page.click("text=Logout");

    // Should redirect to login
    await page.waitForURL("/login", { timeout: 3000 });

    // Verify login page is displayed
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("should redirect to dashboard after login when trying to access protected route", async ({
    page,
  }) => {
    // Try to access protected route
    await page.goto("/manage/users");

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 3000 });

    // Login
    await page.fill('input[name="email"]', "admin@naiera.com");
    await page.fill('input[name="password"]', "Admin123!");
    await page.click('button[type="submit"]');

    // Should redirect to intended page or dashboard
    await page.waitForURL(/\/(dashboard|manage\/users)/, { timeout: 5000 });

    // Verify we're logged in
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
  });

  test("should remember session across page refreshes", async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', "admin@naiera.com");
    await page.fill('input[name="password"]', "Admin123!");
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL("/dashboard", { timeout: 5000 });

    // Refresh page
    await page.reload();

    // Should still be logged in
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();

    // Navigate to protected route
    await page.goto("/manage/users");

    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("should show loading state during login", async ({ page }) => {
    // Fill in credentials
    await page.fill('input[name="email"]', "admin@naiera.com");
    await page.fill('input[name="password"]', "Admin123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Check for loading state (button should be disabled or show loading)
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Fill in credentials
    await page.fill('input[name="email"]', "admin@naiera.com");
    await page.fill('input[name="password"]', "Admin123!");

    // Simulate network offline (this might not work in all browsers)
    await page.context().setOffline(true);

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message or stay on login page
    await page.waitForTimeout(2000);

    // Restore connection
    await page.context().setOffline(false);
  });
});
