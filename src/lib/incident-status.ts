export type ActiveIncident = {
  id: string;
  acceptedBy: string[];
  arrivedBy?: { code: string; arrivedAt: string }[];
};

/** Prototype workflow boundaries, not a substitute for server authorization. */
export function updateIncidentStatus<T extends ActiveIncident>(
  incident: T,
  action: { interface: "RescueTeam" | "rpanel"; status: "arrived" | "rescued"; code?: string; at?: string },
): T | null {
  if (action.status === "rescued") return action.interface === "rpanel" ? null : incident;
  const code = action.code;
  if (!code || !incident.acceptedBy.includes(code) || incident.arrivedBy?.some((r) => r.code === code)) return incident;
  return { ...incident, arrivedBy: [...(incident.arrivedBy ?? []), { code, arrivedAt: action.at ?? new Date().toISOString() }] };
}