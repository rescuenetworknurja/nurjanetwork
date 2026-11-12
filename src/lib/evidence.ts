export type IncidentEvidence = {
  id: string;
  incidentId: string;
  src: string;
  capturedAt: string;
  savedAt: string;
  camera: "back" | "front";
  responderId: string;
  responderName: string;
  tags?: string[];
};

export function appendIncidentEvidence(records: IncidentEvidence[], record: IncidentEvidence, activeIncidentId: string | undefined) {
  if (!activeIncidentId || record.incidentId !== activeIncidentId) return null;
  if (records.some((item) => item.id === record.id)) return records;
  return [...records, record];
}

export function updateEvidenceTags(records: IncidentEvidence[], id: string, tags: string[]) {
  const cleaned = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
  return records.map((item) => item.id === id ? { ...item, tags: cleaned } : item);
}

export function filterIncidentEvidence(records: IncidentEvidence[], incidentId: string, query: string) {
  const search = query.trim().toLocaleLowerCase();
  return records.filter((item) => item.incidentId === incidentId && (!search ||
    [item.responderName, item.capturedAt, new Date(item.capturedAt).toLocaleString(), ...(item.tags ?? [])]
      .some((value) => value.toLocaleLowerCase().includes(search))));
}