/** Get a position for SOS: try precise GPS, then a quicker coarse fix, then the last known fix. */
let last: GeolocationPosition | null = null;
const get = (opts: PositionOptions) => new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(p => { last = p; res(p); }, rej, opts));

export function rememberPosition(p: GeolocationPosition) { last = p; }

export async function getSosPosition(): Promise<GeolocationPosition> {
  if (!("geolocation" in navigator)) throw new Error("This browser cannot share location. Call 999.");
  try { return await get({ enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }); }
  catch (e) {
    const err = e as GeolocationPositionError;
    if (err?.code === 1) throw new Error("Location permission is blocked. Allow location for this site in browser settings, then try again.");
    try { return await get({ enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }); }
    catch { if (last) return last; throw new Error("Your location could not be found. Turn on GPS and try again. Call 999."); }
  }
}
