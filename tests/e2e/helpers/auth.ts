/**
 * Authentication Helper for E2E Tests
 *
 * Provides utilities for logging in and setting up test users
 */

import { Page } from "@playwright/test";

const TEST_ADMIN = {
  email: "admin@example.com",
  password: "Admin123!",
};

export async function loginAsAdmin(page: Page) {
  await page.goto("/login");

  // Wait for page to load
  await page.waitForLoadState("networkidle");

  // Fill in credentials
  await page.fill('input[name="email"]', TEST_ADMIN.email);
  await page.fill('input[name="password"]', TEST_ADMIN.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL("/dashboard", { timeout: 5000 });
}

export async function logout(page: Page) {
  // Click user avatar to open dropdown
  await page.click('[data-testid="user-avatar"]');
  await page.click("text=Logout");

  // Wait for redirect to login
  await page.waitForURL("/login");
}
