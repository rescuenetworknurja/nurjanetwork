import { createServerFn } from "@tanstack/react-start";

export type TripShareView = {
  sharer_name: string; lat: number | null; lng: number | null;
  dest_lat: number | null; dest_lng: number | null; dest_label: string | null;
  active: boolean; updated_at: string;
};

/** Public read of a tracking link. The unguessable link ID is the access key; location is hidden once sharing stops. */
export const getTripShare = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(d.id)) throw new Error("Invalid link");
    return d;
  })
  .handler(async ({ data }): Promise<TripShareView | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("get_trip_share", { _id: data.id });
    if (error) throw new Error("Could not load tracking link");
    const r = (rows as TripShareView[] | null)?.[0];
    return r ?? null;
  });
