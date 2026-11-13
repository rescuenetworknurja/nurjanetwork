import { describe, expect, it } from "vitest";
import { toXY, toLatLng } from "./geo-map";

describe("live map coordinates", () => {
  it("preserves GPS outside the initial Dhaka viewport", () => {
    const point = toXY(22.3569, 91.7832);
    const [lat, lng] = toLatLng(point.x, point.y);
    expect(lat).toBeCloseTo(22.3569, 8);
    expect(lng).toBeCloseTo(91.7832, 8);
  });
});
import { zoneMeters } from "./geo-map";
describe("zoneMeters", () => {
  it("clamps admin radius to 10–500 m", () => {
    expect(zoneMeters({ r: 1, meters: 5 })).toBe(10);
    expect(zoneMeters({ r: 1, meters: 900 })).toBe(500);
    expect(zoneMeters({ r: 1, meters: 120 })).toBe(120);
  });
});
