import { describe, it, expect } from "vitest";
import { analyzePath, rankRoutes } from "./safe-route";
import { toLatLng } from "./geo-map";
import type { Zone } from "./mock-data";

const danger: Zone = { id: "z", name: "Danger", x: 50, y: 50, r: 5, rating: 5 };
const through = [toLatLng(30, 50), toLatLng(50, 50), toLatLng(70, 50)];
const around = [toLatLng(30, 50), toLatLng(50, 20), toLatLng(70, 50)];

describe("safe route", () => {
  it("flags a path crossing a high-risk zone", () => {
    expect(analyzePath(through, [danger])[0]!.inside).toBe(true);
  });
  it("ignores low-risk zones (rating below 3)", () => {
    expect(analyzePath(through, [{ ...danger, rating: 2 }])).toHaveLength(0);
  });
  it("ranks a slower route avoiding the zone above a faster one crossing it", () => {
    const r = rankRoutes([{ path: through, meters: 1, seconds: 100 }, { path: around, meters: 2, seconds: 300 }], [danger]);
    expect(r[0]!.seconds).toBe(300);
    expect(r[0]!.crossings).toBe(0);
  });
});
