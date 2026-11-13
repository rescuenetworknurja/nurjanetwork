import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Service credentials live only in server-side secrets; admins see configured/missing, never values. */
const SERVICES = [
  { service: "LiveKit live video", names: ["LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"] },
  { service: "BulkSMSBD SMS", names: ["UDC_BULKSMSBD_API_KEY", "BULKSMSBD_SENDER_ID"] },
  { service: "Google Places search", names: ["GOOGLE_MAPS_API_KEY"] },
  { service: "Connector gateway", names: ["LOVABLE_API_KEY"] },
] as const;

export const getSecretsStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireAdmin } = await import("./live.server"); await requireAdmin(context.supabase, context.userId);
    return SERVICES.map((s) => ({ service: s.service, missing: s.names.filter((n) => !process.env[n]) }));
  });
