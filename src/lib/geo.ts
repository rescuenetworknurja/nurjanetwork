/**
 * Dhaka/Narayanganj coverage bounds mapped onto the stylised 0–100 SVG map.
 * y = 0 is the northern edge (latMax), y = 100 the southern edge (latMin).
 */
export const GEO_BOUNDS = { latMin: 23.6, latMax: 23.9, lngMin: 90.3, lngMax: 90.55 };

/** Format a coordinate with up to 7 decimal places (e.g. 23.6384699). */
export const fmtCoord = (n: number) => String(+n.toFixed(7));

/** Map percentage position → decimal GPS coordinates. */
export function mapToGeo(x: number, y: number) {
  return {
    lat: +(GEO_BOUNDS.latMax - (y / 100) * (GEO_BOUNDS.latMax - GEO_BOUNDS.latMin)).toFixed(7),
    lng: +(GEO_BOUNDS.lngMin + (x / 100) * (GEO_BOUNDS.lngMax - GEO_BOUNDS.lngMin)).toFixed(7),
  };
}

/** Decimal GPS coordinates → map percentage position (clamped to the map). */
export function geoToMap(lat: number, lng: number) {
  const clamp = (v: number) => Math.min(100, Math.max(0, v));
  return {
    x: clamp(+(((lng - GEO_BOUNDS.lngMin) / (GEO_BOUNDS.lngMax - GEO_BOUNDS.lngMin)) * 100).toFixed(1)),
    y: clamp(+(((GEO_BOUNDS.latMax - lat) / (GEO_BOUNDS.latMax - GEO_BOUNDS.latMin)) * 100).toFixed(1)),
  };
}

/** Splits a pasted "23.6384699,90.4354191" pair; returns null when invalid. */
export function parseCoordPair(text: string): { lat: number; lng: number } | null {
  // Google Maps DMS form: 23°38'18.5"N 90°26'07.5"E
  const dms = [...text.matchAll(/(\d+(?:\.\d+)?)\s*°\s*(?:(\d+(?:\.\d+)?)\s*['′]\s*)?(?:(\d+(?:\.\d+)?)\s*["″]\s*)?([NSEW])/gi)];
  if (dms.length === 2) {
    const val = (m: RegExpMatchArray) => { const v = +m[1]! + (+(m[2] ?? 0)) / 60 + (+(m[3] ?? 0)) / 3600; return /[SW]/i.test(m[4]!) ? -v : v; };
    const [a, b] = dms as [RegExpMatchArray, RegExpMatchArray];
    const latM = /[NS]/i.test(a[4]!) ? a : b, lngM = latM === a ? b : a;
    const lat = +val(latM).toFixed(7), lng = +val(lngM).toFixed(7);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  }
  const m = text.trim().match(/^\(?\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*\)?$/);
  if (!m || m[1] === undefined || m[2] === undefined) return null;
  const lat = +m[1];
  const lng = +m[2];
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

/** True when a string is a valid single decimal coordinate within range. */
export const isLat = (v: string) => /^-?\d+(\.\d+)?$/.test(v.trim()) && Math.abs(+v) <= 90;
export const isLng = (v: string) => /^-?\d+(\.\d+)?$/.test(v.trim()) && Math.abs(+v) <= 180;
