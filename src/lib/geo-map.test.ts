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