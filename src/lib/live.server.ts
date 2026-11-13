import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { hashCode } from "./otp.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function requireAdmin(client: SupabaseClient<Database>, userId: string) {
  const { data, error } = await client.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) throw new Error("Forbidden");
}
export async function requireIncident(client: SupabaseClient<Database>, id: string) {
  const { data, error } = await client.from("incidents").select("*").eq("id", id).single();
  if (error || !data) throw new Error("Incident access denied");
  return data;
}
export async function savePrivateImage(path: string, src: string) {
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(src)) throw new Error("Invalid image");
  const [header, payload] = src.split(",");
  if (!header || !payload) throw new Error("Invalid image");
  const bytes = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
  if (bytes.byteLength > 10 * 1024 * 1024) throw new Error("Image exceeds 10 MB");
  const { error } = await supabaseAdmin.storage.from("nurja-private").upload(path, bytes, { contentType: header.slice(5, header.indexOf(";")), upsert: false });
  if (error) throw new Error("Image could not be stored");
  return path;
}
export async function verifyPin(userId: string, pin: string) {
  const {data,error}=await supabaseAdmin.rpc("check_sos_pin",{_user:userId,_pin:pin});
  return !error && data===true;
}
export async function throttleSubmission(contact: string) {
  const fingerprint = await hashCode(contact.toLowerCase().trim(), "public-submission");
  const { data } = await supabaseAdmin.from("public_submission_limits").select("submitted_at").eq("fingerprint", fingerprint).maybeSingle();
  if (data && Date.now() - new Date(data.submitted_at).getTime() < 60_000) throw new Error("Please wait before sending another submission");
  const { error } = await supabaseAdmin.from("public_submission_limits").upsert({ fingerprint, submitted_at: new Date().toISOString() });
  if (error) throw new Error("Submission unavailable");
}
/** Evidence images older than this many days are removed from storage and the database. */
export const EVIDENCE_RETENTION_DAYS = 7;

/** Removes expired evidence images at most once per day (tracked in live_records/maintenance). */
export async function purgeExpiredEvidence(now = new Date()) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const day = now.toISOString().slice(0, 10);
  const { data: done } = await supabaseAdmin.from("live_records").select("id").eq("collection", "maintenance").eq("id", `evidence-purge-${day}`).maybeSingle();
  if (done) return 0;
  await supabaseAdmin.from("live_records").upsert({ collection: "maintenance", id: `evidence-purge-${day}`, content: { day }, published: false });
  const cutoff = new Date(now.getTime() - EVIDENCE_RETENTION_DAYS * 86_400_000).toISOString();
  let removed = 0;
  for (let i = 0; i < 20; i++) {
    const { data: rows } = await supabaseAdmin.from("incident_evidence").select("id,storage_path").lt("captured_at", cutoff).limit(100);
    if (!rows?.length) break;
    const paths = rows.map((r) => r.storage_path).filter(Boolean) as string[];
    if (paths.length) await supabaseAdmin.storage.from("nurja-private").remove(paths);
    await supabaseAdmin.from("incident_evidence").delete().in("id", rows.map((r) => r.id));
    removed += rows.length;
    if (rows.length < 100) break;
  }
  return removed;
}
