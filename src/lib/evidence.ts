export type IncidentEvidence = {
  id: string;
  incidentId: string;
  src: string;
  capturedAt: string;
  savedAt: string;
  camera: "back" | "front";
  responderId: string;
  responderName: string;
};

export function appendIncidentEvidence(records: IncidentEvidence[], record: IncidentEvidence, activeIncidentId: string | undefined) {
  if (!activeIncidentId || record.incidentId !== activeIncidentId) return null;
  if (records.some((item) => item.id === record.id)) return records;
  return [...records, record];
}