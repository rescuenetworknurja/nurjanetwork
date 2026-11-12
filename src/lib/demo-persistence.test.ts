import { afterEach, expect, it, vi } from "vitest";
import { persistEvidenceState } from "./demo-persistence";

afterEach(() => vi.restoreAllMocks());

it("recovers from a full store without losing capture metadata or tags", async () => {
  const write = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
    throw new DOMException("full", "QuotaExceededError");
  }).mockImplementation(() => {});
  const state = { evidence: [{ id: "f1", incidentId: "SOS-1", src: "data:image/jpeg;base64,AAA", capturedAt: "2026-11-12T22:03:00Z", savedAt: "2026-11-12T22:04:00Z", camera: "back" as const, responderId: "r1", responderName: "Patrol", tags: ["vehicle"] }] };
  expect(await persistEvidenceState("demo", state)).toEqual(state);
  expect(write).toHaveBeenCalledTimes(2);
});

it("does not report a save when browser storage is unavailable", async () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("blocked", "SecurityError"); });
  await expect(persistEvidenceState("demo", { evidence: [] })).rejects.toThrow("blocked");
});