const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
/** Convert Latin digits to Bangla digits. */
export function toBnDigits(v: string | number): string {
  return String(v).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] ?? d);
}
