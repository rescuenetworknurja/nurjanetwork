/** Google Places usage budget: managed gateway allows 6,000 requests per 24h. */
export const PLACES_DAILY_LIMIT = 6000;
/** Approximate Text Search (Pro) list price, USD per request ($32 per 1,000). */
export const PLACES_COST_PER_REQUEST = 0.032;
export const PLACES_WARN_RATIO = 0.8;

export function usageLevel(count: number): "ok" | "warn" | "limit" {
  if (count >= PLACES_DAILY_LIMIT) return "limit";
  if (count >= PLACES_DAILY_LIMIT * PLACES_WARN_RATIO) return "warn";
  return "ok";
}
export const estimateCost = (count: number) => Math.round(count * PLACES_COST_PER_REQUEST * 100) / 100;
