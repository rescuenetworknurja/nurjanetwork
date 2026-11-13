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
  const { error } = await supabaseAdmin.storage.from("nurja-private").upload(path, bytes, { contentType: header.slice(5, header.indexOf(";")), upsert: true });
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