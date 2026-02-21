import { queryKeys } from "@/lib/state/cache/keys";
import { describe, expect, it } from "vitest";

describe("Query Keys", () => {
  it("generates user list keys", () => {
    const keys = queryKeys.users.lists();
    expect(keys).toContain("users");
    expect(keys).toContain("list");
  });

  it("generates user detail keys", () => {
    const keys = queryKeys.users.detail("user-123");
    expect(keys).toContain("users");
    expect(keys).toContain("detail");
    expect(keys).toContain("user-123");
  });

  it("generates role keys", () => {
    const keys = queryKeys.roles.all;
    expect(keys).toContain("roles");
  });

  it("generates permission keys", () => {
    const keys = queryKeys.permissions.all;
    expect(keys).toContain("permissions");
  });

  it("generates file keys", () => {
    const keys = queryKeys.files.lists();
    expect(keys).toContain("files");
    expect(keys).toContain("list");
  });
});
