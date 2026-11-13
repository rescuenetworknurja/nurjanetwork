import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getVideoAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ incidentId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireIncident } = await import("./live.server");
    const incident = await requireIncident(context.supabase, data.incidentId);
    if (incident.status !== "active") throw new Error("Incident ended");
    const url = process.env["LIVEKIT_URL"], key = process.env["LIVEKIT_API_KEY"], secret = process.env["LIVEKIT_API_SECRET"];
    if (!url || !key || !secret) return { configured: false as const };
    const { AccessToken } = await import("livekit-server-sdk");
    const publisher = incident.user_id === context.userId;
    const token = new AccessToken(key, secret, { identity: context.userId, ttl: "10m" });
    token.addGrant({ roomJoin: true, room: `nurja-${incident.id}`, canPublish: publisher, canSubscribe: !publisher, canPublishData: false });
    return { configured: true as const, url, token: await token.toJwt(), publisher };
  });