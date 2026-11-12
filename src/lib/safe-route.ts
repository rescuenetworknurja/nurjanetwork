/** Safety analysis for routes against marked risk zones. Pure + network helpers. */
import type { Zone } from "./mock-data";
import { toLatLng, zoneRadiusMeters } from "./geo-map";
import type { LatLng } from "./routing";

export const HIGH_RISK = 4; // rating >= 4 must be avoided
export const CONCERN = 3; // rating >= 3 is shown as a nearby concern
export const NEARBY_BUFFER_M = 300;

export function distM(a: LatLng, b: LatLng): number {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (b[0] - a[0]) * toR, dLng = (b[1] - a[1]) * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * toR) * Math.cos(b[0] * toR) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Minimum distance (m) from a path to a point, sampling segments. */
export function pathDistance(path: LatLng[], p: LatLng): number {
  let min = Infinity;
  for (let i = 0; i < path.length; i++) {
    min = Math.min(min, distM(path[i], p));
    if (i > 0) for (let t = 0.25; t < 1; t += 0.25) {
      const a = path[i - 1], b = path[i];
      min = Math.min(min, distM([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], p));
    }
  }
  return min;
}

export type ZoneHit = { zone: Zone; meters: number; inside: boolean };

/** Zones (rating >= CONCERN) the path crosses or passes near, most severe first. */
export function analyzePath(path: LatLng[], zones: Zone[]): ZoneHit[] {
  return zones
    .filter((z) => z.rating >= CONCERN)
    .map((zone) => {
      const d = pathDistance(path, toLatLng(zone.x, zone.y)) - zoneRadiusMeters(zone.r);
      return { zone, meters: Math.max(0, Math.round(d)), inside: d <= 0 };
    })
    .filter((h) => h.meters <= NEARBY_BUFFER_M)
    .sort((a, b) => b.zone.rating - a.zone.rating || a.meters - b.meters);
}

export const highRiskCrossings = (hits: ZoneHit[]) => hits.filter((h) => h.inside && h.zone.rating >= HIGH_RISK);

export type Candidate = { path: LatLng[]; meters: number; seconds: number };
export type Scored = Candidate & { hits: ZoneHit[]; crossings: number };

/** Safest first: fewest high-risk crossings, then fewer/lighter concerns, then time. */
export function rankRoutes(cands: Candidate[], zones: Zone[]): Scored[] {
  return cands
    .map((c) => { const hits = analyzePath(c.path, zones); return { ...c, hits, crossings: highRiskCrossings(hits).length }; })
    .sort((a, b) =>
      a.crossings - b.crossings ||
      a.hits.filter((h) => h.inside).reduce((s, h) => s + h.zone.rating, 0) - b.hits.filter((h) => h.inside).reduce((s, h) => s + h.zone.rating, 0) ||
      a.seconds - b.seconds);
}

/** Two detour waypoints passing on either side of a zone, perpendicular to travel direction. */
export function detourPoints(zone: Zone, from: LatLng, to: LatLng): LatLng[] {
  const c = toLatLng(zone.x, zone.y);
  const off = (zoneRadiusMeters(zone.r) * 1.7) / 111000;
  const dy = to[0] - from[0], dx = (to[1] - from[1]) * Math.cos((c[0] * Math.PI) / 180);
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len, py = dx / len; // perpendicular (unit, in lat-ish degrees)
  const lngScale = 1 / Math.cos((c[0] * Math.PI) / 180);
  return [[c[0] + py * off, c[1] + px * off * lngScale], [c[0] - py * off, c[1] - px * off * lngScale]];
}

async function osrm(points: LatLng[], alternatives: boolean): Promise<Candidate[]> {
  const coords = points.map((p) => `${p[1]},${p[0]}`).join(";");
  const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&alternatives=${alternatives}`);
  if (!r.ok) return [];
  const j = (await r.json()) as { routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[] };
  return (j.routes ?? []).map((x) => ({ path: x.geometry.coordinates.map(([lng, lat]) => [lat, lng] as LatLng), meters: x.distance, seconds: x.duration }));
}

/** Fetch direct + alternative + detour routes and rank them by safety. */
export async function findSafeRoutes(from: LatLng, to: LatLng, zones: Zone[]): Promise<{ ranked: Scored[]; fastest: Scored | null }> {
  const base = await osrm([from, to], true);
  if (!base.length) return { ranked: [], fastest: null };
  let ranked = rankRoutes(base, zones);
  const fastest = rankRoutes([base[0]], zones)[0];
  if (ranked[0].crossings > 0) {
    const crossed = highRiskCrossings(ranked[0].hits).slice(0, 2).map((h) => h.zone);
    const detours = await Promise.all(crossed.flatMap((z) => detourPoints(z, from, to).map((w) => osrm([from, w, to], false).catch(() => []))));
    ranked = rankRoutes([...base, ...detours.flat()], zones);
  }
  return { ranked: ranked.slice(0, 3), fastest };
}
