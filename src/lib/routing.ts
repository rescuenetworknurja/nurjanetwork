/** Free OpenStreetMap geocoding (Nominatim) + driving route (OSRM). Browser-side. */
export type LatLng = [number, number];

export async function geocode(q: string): Promise<{ point: LatLng; label: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=bd&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { "Accept-Language": "bn,en" } });
  if (!r.ok) return null;
  const j = (await r.json()) as { lat: string; lon: string; display_name: string }[];
  const f = j[0];
  return f ? { point: [Number(f.lat), Number(f.lon)], label: f.display_name } : null;
}

export async function route(from: LatLng, to: LatLng): Promise<{ path: LatLng[]; meters: number; seconds: number } | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = (await r.json()) as { routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[] };
  const best = j.routes?.[0];
  if (!best) return null;
  return { path: best.geometry.coordinates.map(([lng, lat]) => [lat, lng] as LatLng), meters: best.distance, seconds: best.duration };
}
