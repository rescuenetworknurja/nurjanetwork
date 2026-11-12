/** Owner-side live trip sharing (browser client, RLS: owner only). */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LatLng } from "./routing";

const KEY = "nurja-trip-share";
export const trackUrl = (id: string) => `${window.location.origin}/track/${id}`;

export function useTripShare(me: LatLng | undefined) {
  const [id, setId] = useState<string | null>(null);
  const last = useRef(0);
  useEffect(() => { setId(localStorage.getItem(KEY)); }, []);

  useEffect(() => {
    if (!id || !me || Date.now() - last.current < 10000) return;
    last.current = Date.now();
    void supabase.from("trip_shares").update({ lat: me[0], lng: me[1] }).eq("id", id).then(({ error }) => {
      if (error) { localStorage.removeItem(KEY); setId(null); }
    });
  }, [id, me]);

  const start = useCallback(async (opts: { name: string; dest?: LatLng | undefined; destLabel?: string | undefined }) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Sign in to share live location");
    const { data, error } = await supabase.from("trip_shares").insert({
      user_id: u.user.id, sharer_name: opts.name, lat: me?.[0] ?? null, lng: me?.[1] ?? null,
      dest_lat: opts.dest?.[0] ?? null, dest_lng: opts.dest?.[1] ?? null, dest_label: opts.destLabel || null,
    }).select("id").single();
    if (error || !data) throw new Error("Could not start sharing");
    localStorage.setItem(KEY, data.id); last.current = Date.now(); setId(data.id);
    return data.id;
  }, [me]);

  const stop = useCallback(async () => {
    if (!id) return;
    await supabase.from("trip_shares").update({ active: false, ended_at: new Date().toISOString() }).eq("id", id);
    localStorage.removeItem(KEY); setId(null);
  }, [id]);

  return { id, start, stop };
}
