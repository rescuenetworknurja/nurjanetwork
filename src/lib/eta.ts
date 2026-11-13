import { distanceKm } from "./live-rules";
/** Straight-line distance with conservative city speeds (vehicle 20 km/h, walking 5 km/h). */
export function estimateEta(a?: { lat?: number; lng?: number }, b?: { lat?: number; lng?: number }) {
  if (a?.lat == null || a.lng == null || b?.lat == null || b.lng == null) return null;
  const km = distanceKm({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng });
  return { km, driveMin: Math.max(1, Math.round((km / 20) * 60)), walkMin: Math.max(1, Math.round((km / 5) * 60)) };
}
