import { describe, expect, it } from "vitest";
import { findAccount, isFixedUnit, isType1, seedResponders } from "./mock-data";

describe("Responder GPS rules", () => {
  it("Thana and Fari are fixed installations; patrols, volunteers and officers are live GPS", () => {
    expect(isFixedUnit("station")).toBe(true);
    expect(isFixedUnit("fari")).toBe(true);
    expect(isFixedUnit("patrol")).toBe(false);
    expect(isFixedUnit("volunteer")).toBe(false);
    expect(isFixedUnit("officer")).toBe(false);
  });

  it("Type 1 covers station, fari and patrol only", () => {
    expect(isType1("station")).toBe(true);
    expect(isType1("fari")).toBe(true);
    expect(isType1("patrol")).toBe(true);
    expect(isType1("volunteer")).toBe(false);
    expect(isType1("officer")).toBe(false);
  });

  it("every seeded fixed unit has a pinned map position", () => {
    for (const r of seedResponders.filter((x) => isFixedUnit(x.kind))) {
      expect(r.fixed).toBe(true);
      expect(r.x).toBeDefined();
      expect(r.y).toBeDefined();
    }
  });

  it("seeded patrolling units carry a vehicle number and patrol zone", () => {
    for (const r of seedResponders.filter((x) => x.kind === "patrol")) {
      expect(r.vehicleNo).toBeTruthy();
      expect(r.patrolZone).toBeTruthy();
    }
  });

  it("volunteer codes follow V-XXXXXX and officer codes follow TF-XXX", () => {
    for (const r of seedResponders.filter((x) => x.kind === "volunteer")) expect(r.code).toMatch(/^V-[A-Z2-9]{6}$/);
    for (const r of seedResponders.filter((x) => x.kind === "officer")) expect(r.code).toMatch(/^TF-\d+$/);
  });
});

describe("findAccount (responder login)", () => {
  it("finds accounts by unit code, volunteer ID, TaskForce ID and phone", () => {
    expect(findAccount(seedResponders, "THANA-DHK-01")?.id).toBe("r4");
    expect(findAccount(seedResponders, "v-j75un2")?.id).toBe("r5");
    expect(findAccount(seedResponders, "TF-902")?.id).toBe("r6");
    expect(findAccount(seedResponders, "01320000007")?.id).toBe("r1");
  });
  it("returns undefined for unknown or empty credentials", () => {
    expect(findAccount(seedResponders, "V-XXXXXX")).toBeUndefined();
    expect(findAccount(seedResponders, "  ")).toBeUndefined();
  });
});
