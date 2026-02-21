import { POST } from "@/app/api/users/route";
import { describe, expect, it } from "vitest";

describe("POST /api/users", () => {
  it("requires authentication", async () => {
    const request = new Request("http://localhost:3000/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", name: "Test" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it("validates request body", async () => {
    const request = new Request("http://localhost:3000/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
