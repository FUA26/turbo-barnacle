import {
  emailValidator,
  optionalString,
  passwordValidator,
  phoneValidator,
  requiredString,
  urlValidator,
} from "@/lib/form/validators/common";
import { describe, expect, it } from "vitest";

describe("Common Validators", () => {
  it("validates email correctly", () => {
    const result = emailValidator.safeParse("test@example.com");
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = emailValidator.safeParse("invalid-email");
    expect(result.success).toBe(false);
  });

  it("validates strong password", () => {
    const result = passwordValidator.safeParse("StrongPass123");
    expect(result.success).toBe(true);
  });

  it("rejects weak password", () => {
    const result = passwordValidator.safeParse("weak");
    expect(result.success).toBe(false);
  });

  it("validates phone number", () => {
    const result = phoneValidator.safeParse("+1 (555) 123-4567");
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone number", () => {
    const result = phoneValidator.safeParse("abc");
    expect(result.success).toBe(false);
  });

  it("validates URL", () => {
    const result = urlValidator.safeParse("https://example.com");
    expect(result.success).toBe(true);
  });

  it("rejects invalid URL", () => {
    const result = urlValidator.safeParse("not-a-url");
    expect(result.success).toBe(false);
  });

  it("validates required string", () => {
    const result = requiredString("Name").safeParse("John");
    expect(result.success).toBe(true);
  });

  it("rejects empty required string", () => {
    const result = requiredString("Name").safeParse("");
    expect(result.success).toBe(false);
  });

  it("validates optional string", () => {
    const result = optionalString().safeParse("optional");
    expect(result.success).toBe(true);
  });

  it("accepts undefined for optional string", () => {
    const result = optionalString().safeParse(undefined);
    expect(result.success).toBe(true);
  });
});
