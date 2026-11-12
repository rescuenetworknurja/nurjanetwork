import { describe, expect, it } from "vitest";
import { appendIncidentEvidence, filterIncidentEvidence, updateEvidenceTags, type IncidentEvidence } from "./evidence";

const frame: IncidentEvidence = { id: "frame-1", incidentId: "SOS-1", src: "data:image/png;base64,AAA", capturedAt: "2026-11-12T22:03:00Z", savedAt: "2026-11-12T22:04:00Z", camera: "back", responderId: "r1", responderName: "Patrol" };

describe("incident frame evidence", () => {
  it("edits tags without changing the original capture time or image", () => {
    const updated = updateEvidenceTags([frame], frame.id, [" vehicle ", "suspect", "vehicle", ""]);
    expect(updated[0]).toEqual({ ...frame, tags: ["vehicle", "suspect"] });
    expect(updateEvidenceTags(updated, frame.id, [])[0]?.tags).toEqual([]);
  });
  it("finds tagged frames only within the related incident", () => {
    const tagged = { ...frame, tags: ["গাড়ি", "Suspect"] };
    expect(filterIncidentEvidence([tagged], "SOS-1", "suspect")).toEqual([tagged]);
    expect(filterIncidentEvidence([tagged], "SOS-1", "গাড়ি")).toEqual([tagged]);
    expect(filterIncidentEvidence([tagged], "SOS-2", "suspect")).toEqual([]);
    expect(filterIncidentEvidence([tagged], "SOS-1", "missing")).toEqual([]);
  });
  it("links the captured still to its incident with capture time and responder intact", () => {
    expect(appendIncidentEvidence([], frame, "SOS-1")).toEqual([frame]);
  });
  it("does not attach a stale frame to a different or ended incident", () => {
    expect(appendIncidentEvidence([], frame, "SOS-2")).toBeNull();
    expect(appendIncidentEvidence([], frame, undefined)).toBeNull();
  });
  it("retains earlier incident evidence when another incident saves a frame", () => {
    const next = { ...frame, id: "frame-2", incidentId: "SOS-2" };
    expect(appendIncidentEvidence([frame], next, "SOS-2")).toEqual([frame, next]);
  });
});