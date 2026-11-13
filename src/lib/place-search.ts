/** Place lookup used by the app: Google Places first, OpenStreetMap as a free fallback. */
import { searchPlaces, type PlaceHit } from "./places.functions";
import { geocode, type LatLng } from "./routing";
import { toast } from "sonner";
import { PLACES_DAILY_LIMIT, usageLevel } from "./places-usage";

let warned = false;

export async function findPlace(q: string, near?: LatLng): Promise<{ point: LatLng; label: string } | null> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return null;

  let googleError: string | null = null;
  try {
    const r = await searchPlaces({ data: { query: trimmed, nearLat: near?.[0], nearLng: near?.[1] } });
    const usage = "usage" in r ? r.usage ?? 0 : 0;
    if (!warned && usageLevel(usage) !== "ok") { warned = true; toast.warning("Google search limit nearly used", { description: `${usage} / ${PLACES_DAILY_LIMIT} searches today` }); }
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
