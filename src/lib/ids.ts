const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
/** Generates a Volunteer ID in the format V-XXXXXX (6 uppercase alphanumerics, no 0/O/1/I). */
export function generateVolunteerId(rand: () => number = Math.random): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += CHARS[Math.floor(rand() * CHARS.length)];
  return `V-${s}`;
}
/** Whole years between dob and `now`. */
export function ageFromDob(dob: string, now: Date = new Date()): number {
  const d = new Date(dob);
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
export const isAdult = (dob: string, now?: Date) => ageFromDob(dob, now) >= 18;
/** BD mobile: 11 digits starting with 01[3-9]. */
export const isValidBdPhone = (p: string) => /^01[3-9]\d{8}$/.test(p);
