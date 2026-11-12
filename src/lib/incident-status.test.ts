import { describe, expect, it } from "vitest";
import { updateIncidentStatus } from "./incident-status";

const incident = { id: "SOS-1", acceptedBy: ["PU-07"] };
describe("incident status workflow", () => {
  it("lets RescueTeam mark arrived without ending the incident", () => {
    const action = { interface: "RescueTeam", status: "arrived", code: "PU-07", at: "2026-11-12T22:19:00Z" } as const;
    const arrived = updateIncidentStatus(incident, action);
    expect(arrived).toEqual({ ...incident, arrivedBy: [{ code: "PU-07", arrivedAt: action.at }] });
    if (!arrived) throw new Error("Arrival ended the incident");
    expect(updateIncidentStatus(arrived, action)).toEqual(arrived);
  });
  it("only lets rpanel mark rescued and end the incident", () => {
    expect(updateIncidentStatus(incident, { interface: "RescueTeam", status: "rescued" })).toEqual(incident);
    expect(updateIncidentStatus(incident, { interface: "rpanel", status: "rescued" })).toBeNull();
  });
  it("rejects arrival by a responder who has not accepted", () => {
    expect(updateIncidentStatus(incident, { interface: "RescueTeam", status: "arrived", code: "OTHER" })).toEqual(incident);
  });
});