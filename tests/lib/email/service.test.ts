import { ResendEmailService } from "@/lib/email/service/resend";
import { describe, expect, it } from "vitest";

describe("Email Service", () => {
  it("initializes ResendEmailService", () => {
    const service = new ResendEmailService("test-api-key", "test@example.com");

    expect(service).toBeDefined();
  });

  it("has send method", () => {
    const service = new ResendEmailService("test-api-key", "test@example.com");

    expect(typeof service.send).toBe("function");
  });

  it("has bulkSend method", () => {
    const service = new ResendEmailService("test-api-key", "test@example.com");

    expect(typeof service.bulkSend).toBe("function");
  });
});
