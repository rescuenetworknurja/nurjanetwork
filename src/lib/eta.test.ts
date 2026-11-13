import { describe, it, expect } from "vitest";
import { estimateEta } from "./eta";
describe("estimateEta", () => {
  it("returns null without coordinates", () => expect(estimateEta({}, { lat: 23, lng: 90 })).toBeNull());
  it("uses 20 km/h driving and 5 km/h walking", () => {
    const e = estimateEta({ lat: 0, lng: 0 }, { lat: 0, lng: 0.0899 })!; // ~10 km
    expect(e.driveMin).toBe(30); expect(e.walkMin).toBe(120);
  });
});
