import { describe, expect, it } from "vitest";
import { isValidBdPhone, normalizePhone, phoneToEmail } from "./auth";

describe("phone normalization", () => {
  it("accepts 01XXXXXXXXX and prefixes 880 without keeping the leading 0", () => {
    expect(normalizePhone("01700000001")).toBe("8801700000001");
  });
  it("accepts +880 and 880 forms", () => {
    expect(normalizePhone("+880 1700-000001")).toBe("8801700000001");
    expect(normalizePhone("8801700000001")).toBe("8801700000001");
  });
  it("validates only real BD mobile shapes", () => {
    expect(isValidBdPhone("01700000001")).toBe(true);
    expect(isValidBdPhone("02700000001")).toBe(false);
    expect(isValidBdPhone("0170000001")).toBe(false);
  });
  it("derives a deterministic synthetic email", () => {
    expect(phoneToEmail("01700000001")).toBe("8801700000001@phone.nurja.com");
  });
});
