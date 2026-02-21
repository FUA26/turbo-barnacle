import { expect } from "vitest";

// Custom assertion for session data
expect.extend({
  toHavePermission(received: { permissions?: string[] }, permission: string) {
    const hasPermission = received?.permissions?.includes(permission);
    return {
      pass: hasPermission,
      message: () =>
        hasPermission
          ? `expected permissions not to include ${permission}`
          : `expected permissions to include ${permission}`,
    };
  },
});

declare module "vitest" {
  interface Assertion<T = unknown> {
    toHavePermission(permission: string): T;
  }
}
