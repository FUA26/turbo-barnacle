import { sendVerificationEmail } from "@/lib/email/utils";
import { describe, expect, it, vi } from "vitest";

// Mock the email service
vi.mock("@/lib/email/utils", async () => {
  const actual = await vi.importActual<typeof import("@/lib/email/utils")>("@/lib/email/utils");
  return {
    ...actual,
    sendVerificationEmail: vi.fn(),
  };
});

describe("Email Utilities", () => {
  it("sendVerificationEmail is defined", () => {
    expect(typeof sendVerificationEmail).toBe("function");
  });

  it("sendPasswordResetEmail is exported", async () => {
    const { sendPasswordResetEmail } = await import("@/lib/email/utils");
    expect(typeof sendPasswordResetEmail).toBe("function");
  });

  it("sendWelcomeEmail is exported", async () => {
    const { sendWelcomeEmail } = await import("@/lib/email/utils");
    expect(typeof sendWelcomeEmail).toBe("function");
  });
});
