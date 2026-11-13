import { describe, expect, it } from "vitest";
import { estimateCost, usageLevel } from "./places-usage";
describe("places usage", () => {
  it("warns from 80% of 6,000", () => { expect(usageLevel(4799)).toBe("ok"); expect(usageLevel(4800)).toBe("warn"); });
  it("flags the 6,000 daily limit", () => expect(usageLevel(6000)).toBe("limit"));
  it("estimates $32 per 1,000 searches", () => expect(estimateCost(1000)).toBe(32));
});
