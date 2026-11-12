import type { IncidentEvidence } from "./evidence";

export async function compactEvidenceImage(src: string): Promise<string> {
  if (!src.startsWith("data:image/png")) return src;
  const image = new Image();
  image.src = src;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(1280, image.naturalWidth);
  canvas.height = Math.round(image.naturalHeight * canvas.width / image.naturalWidth);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image conversion unavailable");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export async function persistEvidenceState<T extends { evidence: IncidentEvidence[] }>(key: string, state: T): Promise<T> {
  try {
    localStorage.setItem(key, JSON.stringify(state));
    return state;
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== "QuotaExceededError") throw error;
    // Reclaim space from earlier PNG captures without deleting any records or tags.
    const evidence = await Promise.all(state.evidence.map(async (item) => ({ ...item, src: await compactEvidenceImage(item.src) })));
    const compacted = { ...state, evidence };
    localStorage.setItem(key, JSON.stringify(compacted));
    return compacted;
  }
}