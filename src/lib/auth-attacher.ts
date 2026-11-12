import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

/**
 * Client-side function middleware: attaches the current Supabase access token
 * as a bearer header so requireSupabaseAuth server functions can validate it.
 * getSession() is acceptable here — the server re-validates the token.
 */
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return next({});
    return next({ headers: { Authorization: `Bearer ${token}` } });
  },
);
