import { describe, expect, it } from "vitest";
import { DISPATCH_LIMITS, mayCompleteIncident, mayStartIncident, distanceKm } from "./live-rules";
describe("live incident rules", () => {
  it("dispatches at most two patrols", () => expect(DISPATCH_LIMITS.patrol).toBe(2));
  it("dispatches at most one fari", () => expect(DISPATCH_LIMITS.fari).toBe(1));
  it("dispatches at most one station", () => expect(DISPATCH_LIMITS.station).toBe(1));
  it("alerts at most ten personal responders", () => expect(DISPATCH_LIMITS.personal).toBe(10));
  it("responders cannot mark rescued", () => expect(mayCompleteIncident(["responder"], "rescued")).toBe(false));
  it("only admins confirm rescue", () => expect(mayCompleteIncident(["admin"], "rescued")).toBe(true));
  it("unapproved accounts cannot start SOS", () => expect(mayStartIncident("active", "pending")).toBe(false));
  it("banned accounts cannot start SOS", () => expect(mayStartIncident("banned", "approved")).toBe(false));
  it("uses real geographic distance", () => expect(distanceKm({lat:0,lng:0},{lat:0,lng:1})).toBeCloseTo(111.195, 2));
});