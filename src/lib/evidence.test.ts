import { describe, expect, it } from "vitest";
import { appendIncidentEvidence, type IncidentEvidence } from "./evidence";

const frame: IncidentEvidence = { id: "frame-1", incidentId: "SOS-1", src: "data:image/png;base64,AAA", capturedAt: "2026-11-12T22:03:00Z", savedAt: "2026-11-12T22:04:00Z", camera: "back", responderId: "r1", responderName: "Patrol" };

describe("incident frame evidence", () => {
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