import { Session } from "next-auth";

export function mockSession(overrides?: Partial<Session>): Session {
  return {
    user: {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      roleId: "test-role-id",
      permissions: ["USER_READ_ANY"],
    },
    expires: new Date(Date.now() + 3600000).toISOString(),
    ...overrides,
  };
}

export function mockUser(overrides?: Record<string, unknown>) {
  return {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    roleId: "test-role-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockFile(name = "test.jpg", type = "image/jpeg") {
  const file = new File(["test"], name, { type });
  return file;
}
