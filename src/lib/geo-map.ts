// Maps the demo 0-100 x/y coordinate space onto a real Dhaka bounding box,
// so existing zone/unit/victim data renders on a real OpenStreetMap map.

export const MAP_BOUNDS = {
  north: 23.9,
  south: 23.72,
  west: 90.32,
  east: 90.5,
} as const;

export const MAP_CENTER: [number, number] = [
  (MAP_BOUNDS.north + MAP_BOUNDS.south) / 2,
  (MAP_BOUNDS.west + MAP_BOUNDS.east) / 2,
];

export function toLatLng(x: number, y: number): [number, number] {
  const lat = MAP_BOUNDS.north - (y / 100) * (MAP_BOUNDS.north - MAP_BOUNDS.south);
  const lng = MAP_BOUNDS.west + (x / 100) * (MAP_BOUNDS.east - MAP_BOUNDS.west);
  return [lat, lng];
}

export function toXY(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100;
  const y = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100;
  return { x, y };
}

// Zone radius r is in 0-100 map units; the box height is ~20 km, so 1 unit ≈ 200 m.
export function zoneRadiusMeters(r: number): number {
  return Math.max(150, r * 200);
}
export const ZONE_MIN_METERS = 10, ZONE_MAX_METERS = 500;
/** Admin-entered radius (10–500 m) when set; older zones fall back to the legacy scale. */
export function zoneMeters(z: { r: number; meters?: number | undefined }): number {
  return z.meters !== undefined ? Math.min(ZONE_MAX_METERS, Math.max(ZONE_MIN_METERS, z.meters)) : zoneRadiusMeters(z.r);
}

// Control panel maps open on Chashara, Narayanganj.
export const CHASHARA_CENTER: [number, number] = [23.6236, 90.4999];
