export const DISPATCH_LIMITS = { patrol: 2, fari: 1, station: 1, personal: 10 } as const;
export function mayCompleteIncident(roles: string[], status: string) {
  return roles.includes("admin") && (status === "rescued" || status === "closed");
}
export function mayStartIncident(account: string, kyc: string) {
  return account === "active" && kyc === "approved";
}
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = (n: number) => n * Math.PI / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}