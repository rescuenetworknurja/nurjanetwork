/** Place lookup used by the app: Google Places first, OpenStreetMap as a free fallback. */
import { searchPlaces, type PlaceHit } from "./places.functions";
import { geocode, type LatLng } from "./routing";

export async function findPlace(q: string, near?: LatLng): Promise<{ point: LatLng; label: string } | null> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return null;

  let googleError: string | null = null;
  try {
    const r = await searchPlaces({ data: { query: trimmed, nearLat: near?.[0], nearLng: near?.[1] } });
    const hit: PlaceHit | undefined = r.places[0];
    if (hit) return { point: hit.point, label: hit.label };
    googleError = r.error;
  } catch {
    googleError = "Place search is unavailable right now";
  }

  const fallback = await geocode(trimmed);
  if (fallback) return fallback;
  if (googleError) throw new Error(googleError);
  return null;
}
