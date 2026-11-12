import { describe, expect, it } from "vitest";
import { fmtCoord, geoToMap, isLat, isLng, mapToGeo, parseCoordPair } from "./geo";

describe("parseCoordPair (smart paste)", () => {
  it("splits a combined coordinate string", () => {
    expect(parseCoordPair("23.6384699,90.4354191")).toEqual({ lat: 23.6384699, lng: 90.4354191 });
  });
  it("accepts spaces around the comma", () => {
    expect(parseCoordPair("23.6384699, 90.4354191")).toEqual({ lat: 23.6384699, lng: 90.4354191 });
  });
  it("rejects single values, text and out-of-range coordinates", () => {
    expect(parseCoordPair("23.6384699")).toBeNull();
    expect(parseCoordPair("hello")).toBeNull();
    expect(parseCoordPair("123.5,90.4")).toBeNull();
    expect(parseCoordPair("23.6,190.4")).toBeNull();
  });
});

describe("mapToGeo / geoToMap", () => {
  it("round-trips a position within map precision", () => {
    const g = mapToGeo(74, 70);
    const p = geoToMap(g.lat, g.lng);
    expect(p.x).toBeCloseTo(74, 0);
    expect(p.y).toBeCloseTo(70, 0);
  });
  it("keeps north at the top of the map", () => {
    expect(mapToGeo(50, 0).lat).toBeGreaterThan(mapToGeo(50, 100).lat);
  });
  it("clamps out-of-map coordinates", () => {
    expect(geoToMap(24.5, 91.5)).toEqual({ x: 100, y: 0 });
  });
});

describe("fmtCoord / validators", () => {
  it("formats up to 7 decimals without trailing zeros", () => {
    expect(fmtCoord(23.6384699)).toBe("23.6384699");
    expect(fmtCoord(90.4)).toBe("90.4");
  });
  it("validates latitude and longitude ranges", () => {
    expect(isLat("23.6384699")).toBe(true);
    expect(isLat("95")).toBe(false);
    expect(isLng("90.4354191")).toBe(true);
    expect(isLng("200")).toBe(false);
  });
});
