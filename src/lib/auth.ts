import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Phone + password sign-in on top of Supabase email auth.
 * Supabase phone OTP needs an SMS provider (Bulk SMS BD keys pending), so a
 * deterministic synthetic email is derived from the normalized phone number.
 * The real phone number stays in profiles.phone; the synthetic address is
 * never shown to users and cannot receive email (no email password reset).
 */
export const PHONE_EMAIL_DOMAIN = "phone.nurja.com";

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  // Accept 01XXXXXXXXX, 8801XXXXXXXXX or +8801XXXXXXXXX (Bangladesh).
  if (/^01\d{9}$/.test(digits)) return `880${digits.slice(1)}`;
  if (/^8801\d{9}$/.test(digits)) return digits;
  return digits;
}

export function isValidBdPhone(raw: string): boolean {
  return /^8801\d{9}$/.test(normalizePhone(raw));
}

export function phoneToEmail(raw: string): string {
  return `${normalizePhone(raw)}@${PHONE_EMAIL_DOMAIN}`;
}

export function isEmailInput(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

/** Accepts a BD phone number or a real email (used by the admin account). */
export function credentialToEmail(raw: string): string {
  return isEmailInput(raw) ? raw.trim().toLowerCase() : phoneToEmail(raw);
}

export async function signUpWithPhone(input: {
  phone: string;
  password: string;
  fullName: string;
}) {
  const email = credentialToEmail(input.phone);
  const phone = isEmailInput(input.phone) ? null : normalizePhone(input.phone);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: { full_name: input.fullName, phone },
      emailRedirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithPhone(phone: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentialToEmail(phone),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export interface SessionState {
  loading: boolean;
  user: User | null;
}

/** Live session state; re-validates with the Auth server on mount. */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ loading: true, user: null });
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setState({ loading: false, user: data.user ?? null });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setState({ loading: false, user: session?.user ?? null });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return state;
}
