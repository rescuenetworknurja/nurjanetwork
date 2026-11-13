import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

export type PlaceHit = { point: [number, number]; label: string };

const searchInput = z.object({
  query: z.string().trim().min(2).max(120),
  nearLat: z.number().min(-90).max(90).optional(),
  nearLng: z.number().min(-180).max(180).optional(),
});

/** Google Places (New) text search through the connector gateway. Server-side only. */
export const searchPlaces = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => searchInput.parse(d))
  .handler(async ({ data }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const mapsKey = process.env["GOOGLE_MAPS_API_KEY"];
    if (!lovableKey || !mapsKey) return { places: [] as PlaceHit[], error: "Google Maps is not connected" };

    const body: Record<string, unknown> = {
      textQuery: data.query,
      pageSize: 3,
      regionCode: "BD",
      languageCode: "bn",
    };
    if (data.nearLat !== undefined && data.nearLng !== undefined) {
      body["locationBias"] = {
        circle: { center: { latitude: data.nearLat, longitude: data.nearLng }, radius: 30000 },
      };
    }

    const { PLACES_DAILY_LIMIT } = await import("./places-usage");
    const usage = await recordPlacesUsage();
    if (usage > PLACES_DAILY_LIMIT) return { places: [] as PlaceHit[], error: "Daily Google search limit reached", usage };
    const res = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": mapsKey,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 403) {
      const parsed = (await res.json().catch(() => null)) as { error?: { details?: { reason?: string }[] } } | null;
      const reason = parsed?.error?.details?.find((x) => x.reason)?.reason;
      if (reason === "API_KEY_HTTP_REFERRER_BLOCKED") {
        return { places: [] as PlaceHit[], error: 'Google Maps key is referrer-restricted. In Google Cloud Console, set the server key\'s application restrictions to "None" or "IP addresses".' };
      }
      if (reason === "API_KEY_SERVICE_BLOCKED") {
        return { places: [] as PlaceHit[], error: "Google Maps key does not allow Places. Add Places API (New) to the key's allowed APIs in Google Cloud Console." };
      }
      return { places: [] as PlaceHit[], error: "Google Maps request was denied (403). Check the key's restrictions in Google Cloud Console." };
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(`Google Places search failed [${res.status}]: ${errBody}`);
      return { places: [] as PlaceHit[], error: "Place search is unavailable right now" };
    }

    const j = (await res.json().catch(() => null)) as {
      places?: { location?: { latitude?: number; longitude?: number }; formattedAddress?: string; displayName?: { text?: string } }[];
    } | null;

    const places: PlaceHit[] = (j?.places ?? [])
      .filter((p) => typeof p.location?.latitude === "number" && typeof p.location?.longitude === "number")
      .map((p) => ({
        point: [p.location!.latitude as number, p.location!.longitude as number],
        label: p.formattedAddress || p.displayName?.text || data.query,
      }));

    return { places, error: null as string | null, usage };
  });

/** Each Text Search is one billable Google request; count it per day (approximate, best-effort). */
async function recordPlacesUsage(): Promise<number> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const day = new Date().toISOString().slice(0, 10);
    const { data: row } = await supabaseAdmin.from("live_records").select("content").eq("collection", "places_usage").eq("id", day).maybeSingle();
    const count = Number((row?.content as { count?: number } | null)?.count ?? 0) + 1;
    await supabaseAdmin.from("live_records").upsert({ collection: "places_usage", id: day, content: { day, count }, published: false });
    return count;
  } catch (e) { console.error("Places usage not recorded", e); return 0; }
}

export const getPlacesUsage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireAdmin } = await import("./live.server"); await requireAdmin(context.supabase, context.userId);
    const { data } = await context.supabase.from("live_records").select("id,content").eq("collection", "places_usage").order("id", { ascending: false }).limit(31);
    return (data ?? []).map((r) => ({ day: r.id, count: Number((r.content as { count?: number }).count ?? 0) }));
  });
