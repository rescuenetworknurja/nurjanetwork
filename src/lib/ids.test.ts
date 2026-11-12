import { describe, expect, it } from "vitest";
import { ageFromDob, generateVolunteerId, isAdult, isValidBdPhone } from "./ids";

describe("NURJA rules", () => {
  it("volunteer IDs look like V-XXXXXX", () => {
    for (let i = 0; i < 50; i++) expect(generateVolunteerId()).toMatch(/^V-[A-Z0-9]{6}$/);
  });
  it("someone turning 18 today is an adult", () => {
    expect(isAdult("2008-11-13", new Date("2026-11-13"))).toBe(true);
  });
  it("one day before 18th birthday is a minor", () => {
    expect(isAdult("2008-11-14", new Date("2026-11-13"))).toBe(false);
    expect(ageFromDob("2008-11-14", new Date("2026-11-13"))).toBe(17);
  });
  it("accepts 01XXXXXXXXX phones only", () => {
    expect(isValidBdPhone("01712345678")).toBe(true);
    expect(isValidBdPhone("0171234567")).toBe(false);
    expect(isValidBdPhone("02712345678")).toBe(false);
  });
});
