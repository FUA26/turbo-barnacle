import { getQueryClient } from "@/lib/state/queries/client";
import { describe, expect, it } from "vitest";

describe("QueryClient", () => {
  it("creates QueryClient with default config", () => {
    const client = getQueryClient();

    expect(client).toBeDefined();
    expect(client.getDefaultOptions().queries?.staleTime).toBe(1000 * 60 * 5);
  });
});
