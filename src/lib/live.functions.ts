import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import type { Post, Zone, VolunteerApp, Responder } from "./mock-data";
import type { WebsiteContent, Inquiry } from "./website-content";

export const getPublicRecords = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Public service unavailable");
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  } } });
  const { data, error } = await client.from("live_records").select("id,collection,content").eq("published", true).in("collection", ["website", "posts", "zones"]).limit(1000);
  if (error) throw new Error("Published content unavailable");
  return data ?? [];
});

export const getLiveSnapshot = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const client = context.supabase;
  const [{ data: profile, error: pe }, { data: roles }, { data: records, error: re }, { data: incidents, error: ie }, { data: responders, error: ue }, { data: assignments }, { data: profiles }, { data: submissions }, { data: evidence }] = await Promise.all([
    client.from("profiles").select("*").eq("id", context.userId).single(),
    client.from("user_roles").select("role").eq("user_id", context.userId),
    client.from("live_records").select("*").limit(1000),
    client.from("incidents").select("*").order("created_at", { ascending: false }).limit(500),
    client.from("responders").select("*\ template_placeholder") ,
    client.from("dispatch_assignments").select("*").limit(1000),
    client.from("profiles").select("*").limit(1000),
    client.from("kyc_submissions").select("*").limit(1000),
    client.from("incident_evidence").select("*").limit(1000),
  ]);
  if (pe || re || ie || ue) throw new Error("Live data unavailable");
  const signedEvidence = await Promise.all((evidence ?? []).map(async (e) => {
    const { data } = await client.storage.from("nurja-private").createSignedUrl(e.storage_path, 900);
    return { id: e.id, incidentId: e.incident_id, src: data?.signedUrl ?? "", capturedAt: e.captured_at, savedAt: e.created_at, camera: e.camera as "front" | "back", responderId: e.responder_id, responderName: e.responder_name, tags: e.tags };
  }));
  const signedKyc = await Promise.all((submissions ?? []).map(async (s) => {
    const docs = s.documents as Record<string, string>;
    const entries = await Promise.all(Object.entries(docs).map(async ([label, path]) => {
      const { data } = await client.storage.from("nurja-private").createSignedUrl(path, 900);
      return [label, data?.signedUrl ?? ""];
    }));
    return { ...s, documents: Object.fromEntries(entries) as Record<string, string> };
  }));
  return { profile, roles: (roles ?? []).map(r => r.role), records: records ?? [], incidents: incidents ?? [], responders: responders ?? [], assignments: assignments ?? [], profiles: profiles ?? [], submissions: signedKyc, evidence: signedEvidence };
});

export const saveRecord = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ collection: z.enum(["website", "posts", "zones", "inquiries", "volunteerApps"]), id: z.string().min(1).max(120), content: z.record(z.string(), z.unknown()).nullable() }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireAdmin } = await import("./live.server");
    await requireAdmin(context.supabase, context.userId);
    if (!data.content) {
      const { error } = await context.supabase.from("live_records").delete().eq("collection", data.collection).eq("id", data.id);
      if (error) throw new Error("Deletion failed");
      return { ok: true };
    }
    const content = { ...data.content };
    if (JSON.stringify(content).length > 15_000_000) throw new Error("Content too large");
    // Persist uploaded CMS images rather than temporary blob URLs/data URLs.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const storeImage = async (src: unknown) => {
      if (typeof src !== "string" || !src.startsWith("data:image/")) return src;
      const blob = await (await fetch(src)).blob();
      const path = `${data.collection}/${data.id}/${crypto.randomUUID()}`;
      const { error } = await supabaseAdmin.storage.from("nurja-cms").upload(path, blob, { contentType: blob.type });
      if (error) throw new Error("Image upload failed");
      const url = process.env["VITE_SUPABASE_URL"];
      if (!url) throw new Error("Public image URL unavailable");
      return `${url}/storage/v1/object/public/nurja-cms/${path}`;
    };
    if (data.collection === "posts") content.image = await storeImage(content.image);
    if (data.collection === "website" && content.hero && typeof content.hero === "object") {
      const hero = content.hero as Record<string, unknown>;
      content.hero = { ...hero, image: await storeImage(hero.image) };
    }
    const published = data.collection === "website" || data.collection === "zones" || (data.collection === "posts" && content.published !== false);
    const { error } = await context.supabase.from("live_records").upsert({ id: data.id, collection: data.collection, content: content as Database["public"]["Tables"]["live_records"]["Insert"]["content"], published });
    if (error) throw new Error("Save failed");
    return { ok: true };
  });

export const submitPublicInquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ name: z.string().trim().min(1).max(120), contact: z.string().trim().min(5).max(180), subject: z.string().trim().min(1).max(180), message: z.string().trim().min(1).max(5000) }).parse(d))
  .handler(async ({ data }) => {
    const { throttleSubmission } = await import("./live.server"); await throttleSubmission(data.contact);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const id = crypto.randomUUID();
    const { error } = await supabaseAdmin.from("live_records").insert({ id, collection: "inquiries", content: { ...data, id, at: new Date().toISOString(), status: "new", notes: "" }, published: false });
    if (error) throw new Error("Submission failed"); return { ok: true };
  });

export const submitVolunteerApplication = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ name: z.string().trim().min(1).max(120), phone: z.string().regex(/^8801\d{9}$/), email: z.string().email().max(180), address: z.string().min(1).max(500), nid: z.string().min(5).max(30), occupation: z.string().min(1).max(180), motivation: z.string().min(1).max(3000), photo: z.string().max(15_000_000) }).parse(d))
  .handler(async ({ data }) => {
    const { throttleSubmission, savePrivateImage } = await import("./live.server"); await throttleSubmission(data.phone);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const id = crypto.randomUUID(); const path = await savePrivateImage(`volunteers/${id}/nid`, data.photo);
    const { photo: _photo, ...fields } = data;
    const { error } = await supabaseAdmin.from("live_records").insert({ id, collection: "volunteerApps", content: { ...fields, id, photoPath: path, submittedAt: new Date().toISOString(), status: "pending", hasPhoto: true }, published: false });
    if (error) throw new Error("Application failed"); return { ok: true };
  });

export const createResponder = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ name: z.string().min(1).max(120), phone: z.string().regex(/^8801\d{9}$/), password: z.string().min(8).max(72), code: z.string().min(1).max(80), kind: z.enum(["patrol", "fari", "station", "volunteer", "officer"]), area: z.string().max(500), lat: z.number().min(-90).max(90).optional(), lng: z.number().min(-180).max(180).optional(), details: z.record(z.string(), z.unknown()).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireAdmin } = await import("./live.server"); await requireAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({ email: `${data.phone}@phone.nurja.com`, password: data.password, email_confirm: true, user_metadata: { full_name: data.name, phone: data.phone } });
    if (error || !created.user) throw new Error("Could not create account; check for an existing phone");
    const id = created.user.id;
    const { error: roleError } = await supabaseAdmin.from("user_roles").upsert({ user_id: id, role: "responder" }, { onConflict: "user_id,role" });
    const { error: unitError } = await supabaseAdmin.from("responders").insert({ user_id: id, code: data.code, kind: data.kind, name: data.name, phone: data.phone, area: data.area, fixed: ["station", "fari"].includes(data.kind), lat: data.lat, lng: data.lng, details: (data.details ?? {}) as Database["public"]["Tables"]["responders"]["Insert"]["details"] });
    if (roleError || unitError) { await supabaseAdmin.auth.admin.deleteUser(id); throw new Error("Responder could not be saved"); }
    return { ok: true };
  });

export const signInResponder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ identifier: z.string().trim().min(1).max(120), password: z.string().min(1).max(72) }).parse(d))
  .handler(async ({ data }) => {
    const { normalizePhone } = await import("./auth");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"]; const url = process.env["SUPABASE_URL"];
    if (!key || !url) throw new Error("Sign in unavailable");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const phone = normalizePhone(data.identifier);
    const query = supabaseAdmin.from("responders").select("user_id,phone");
    const { data: unit } = /^8801\d{9}$/.test(phone) ? await query.eq("phone", phone).maybeSingle() : await query.eq("code", data.identifier.toUpperCase()).maybeSingle();
    if (!unit) throw new Error("Invalid credentials");
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: signed, error } = await client.auth.signInWithPassword({ email: `${unit.phone}@phone.nurja.com`, password: data.password });
    if (error || !signed.session) throw new Error("Invalid credentials");
    const { data: profile } = await supabaseAdmin.from("profiles").select("account_status").eq("id", unit.user_id).single();
    if (profile?.account_status !== "active") throw new Error("Account unavailable");
    return { access_token: signed.session.access_token, refresh_token: signed.session.refresh_token };
  });

export const startLiveSos = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), accuracy: z.number().nonnegative() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: id, error } = await context.supabase.rpc("start_incident", { _lat: data.lat, _lng: data.lng, _accuracy: data.accuracy });
    if (error || !id) throw new Error(error?.message ?? "SOS could not be sent");
    // Incident creation is durable before attempting SMS; failure is recorded separately.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: incident } = await context.supabase.from("incidents").select("*").eq("id", id).single();
    if (incident?.sms_status === "pending") {
      let status = "unavailable";
      try {
        const { sendSms } = await import("./otp.server");
        if (incident.emergency_phone) {
          await sendSms(incident.emergency_phone.replace(/\D/g, ""), `NURJA SOS: ${incident.victim} needs help. Location: https://www.google.com/maps?q=${data.lat},${data.lng}. Emergency: 999.`);
          status = "sent";
        } else status = "no-contact";
      } catch { status = "failed"; }
      await supabaseAdmin.from("incidents").update({ sms_status: status }).eq("id", id);
    }
    return { id };
  });

export const updateLiveLocation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ incidentId: z.string().uuid().optional(), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), accuracy: z.number().nonnegative() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p } = await context.supabase.from("profiles").select("account_status").eq("id", context.userId).single();
    if (p?.account_status !== "active") throw new Error("Account unavailable");
    const now = new Date().toISOString();
    if (data.incidentId) {
      const { requireIncident } = await import("./live.server"); const i = await requireIncident(context.supabase, data.incidentId);
      if (i.user_id !== context.userId || i.status !== "active") throw new Error("Active owned incident required");
      const { error } = await supabaseAdmin.from("incidents").update({ lat: data.lat, lng: data.lng, accuracy: data.accuracy, location_at: now }).eq("id", i.id).eq("status", "active");
      if (error) throw new Error("Location update failed");
      await supabaseAdmin.from("incident_locations").insert({ incident_id: i.id, lat: data.lat, lng: data.lng, accuracy: data.accuracy });
    } else {
      const { error } = await supabaseAdmin.from("responders").update({ lat: data.lat, lng: data.lng, location_at: now }).eq("user_id", context.userId).eq("fixed", false);
      if (error) throw new Error("Location update failed");
    }
    return { ok: true };
  });

export const setDutyStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ online: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: unit } = await context.supabase.from("responders").select("id").eq("user_id", context.userId).single();
    if (!unit) throw new Error("Responder account required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("responders").update({ online: data.online }).eq("id", unit.id);
    if (error) throw new Error("Status update failed"); return { ok: true };
  });

export const respondToLiveSos = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), state: z.enum(["accepted", "arrived", "declined"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("respond_to_incident", { _id: data.id, _state: data.state });
    if (error) throw new Error(error.message); return { ok: true };
  });
export const completeLiveSos = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["rescued", "closed"]), outcome: z.string().max(1000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("complete_incident", { _id: data.id, _status: data.status, _outcome: data.outcome });
    if (error) throw new Error(error.message); return { ok: true };
  });
export const cancelLiveSos = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), pin: z.string().regex(/^\d{6}$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireIncident, verifyPin } = await import("./live.server"); const i = await requireIncident(context.supabase, data.id);
    if (i.user_id !== context.userId || i.status !== "active" || !await verifyPin(context.userId, data.pin)) throw new Error("PIN invalid or temporarily locked");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("incidents").update({ status: "cancelled", ended_at: new Date().toISOString(), outcome: "Stopped by user" }).eq("id", data.id).eq("status", "active");
    if (error) throw new Error("Cancellation failed"); return { ok: true };
  });
export const changeLivePin = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ oldPin: z.string().regex(/^\d{6}$/), newPin: z.string().regex(/^\d{6}$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const { verifyPin } = await import("./live.server"); if (!await verifyPin(context.userId, data.oldPin)) throw new Error("Current PIN is wrong");
    const { hashCode } = await import("./otp.server"); const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("user_security").update({ pin_hash: await hashCode(context.userId, data.newPin), attempts: 0, locked_until: null }).eq("user_id", context.userId);
    if (error) throw new Error("PIN update failed"); return { ok: true };
  });
export const setLiveCamera = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), camera: z.enum(["back", "front"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireIncident } = await import("./live.server"); const i = await requireIncident(context.supabase, data.id);
    const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (i.status !== "active" || (i.user_id !== context.userId && !admin)) throw new Error("Camera control denied");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server"); const { error } = await supabaseAdmin.from("incidents").update({ camera: data.camera }).eq("id", i.id);
    if (error) throw new Error("Camera change failed"); return { ok: true };
  });

export const saveLiveEvidence = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), incidentId: z.string().uuid(), src: z.string().max(15_000_000), capturedAt: z.string().datetime(), camera: z.enum(["front", "back"]), tags: z.array(z.string().max(80)).max(30).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireIncident, savePrivateImage } = await import("./live.server"); const incident = await requireIncident(context.supabase, data.incidentId);
    const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (incident.status !== "active" || !roles?.some(r => r.role === "admin" || r.role === "responder")) throw new Error("Active assigned responder required");
    const path = await savePrivateImage(`evidence/${data.incidentId}/${data.id}`, data.src);
    const { data: p } = await context.supabase.from("profiles").select("full_name").eq("id", context.userId).single();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("incident_evidence").upsert({ id: data.id, incident_id: data.incidentId, storage_path: path, camera: data.camera, captured_at: data.capturedAt, responder_id: context.userId, responder_name: p?.full_name ?? "", tags: data.tags ?? [] });
    if (error) throw new Error("Evidence save failed"); return { ok: true };
  });
export const editLiveEvidenceTags = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), tags: z.array(z.string().trim().min(1).max(80)).max(30) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: e } = await context.supabase.from("incident_evidence").select("incident_id").eq("id", data.id).single();
    if (!e) throw new Error("Evidence access denied");
    const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (!roles?.some(r => r.role === "admin" || r.role === "responder")) throw new Error("Evidence editing denied");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server"); const { error } = await supabaseAdmin.from("incident_evidence").update({ tags: [...new Set(data.tags)] }).eq("id", data.id);
    if (error) throw new Error("Tag save failed"); return { ok: true };
  });

export const approveLiveVolunteer = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireAdmin } = await import("./live.server"); await requireAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await context.supabase.from("live_records").select("content").eq("collection", "volunteerApps").eq("id", data.id).single();
    const app = row?.content as unknown as VolunteerApp | undefined;
    if (!app || app.status !== "pending") throw new Error("Pending application required");
    const { data: p } = await supabaseAdmin.from("profiles").select("id").eq("phone", app.phone).maybeSingle();
    if (!p) throw new Error("This volunteer must first create a verified NURJA account");
    const { generateVolunteerId } = await import("./ids"); const code = generateVolunteerId();
    const { error: re } = await supabaseAdmin.from("responders").insert({ user_id: p.id, name: app.name, phone: app.phone, code, kind: "volunteer", area: app.address });
    if (re) throw new Error("Could not add responder; check existing account");
    const { error: roleError } = await supabaseAdmin.from("user_roles").upsert({ user_id: p.id, role: "responder" }, { onConflict: "user_id,role" });
    if (roleError) throw new Error("Role grant failed");
    const { error } = await context.supabase.from("live_records").update({ content: { ...app, status: "approved", volunteerId: code } }).eq("collection", "volunteerApps").eq("id", app.id);
    if (error) throw new Error("Application approval failed"); return { code };
  });

export const flagLiveIncident = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireAdmin, requireIncident } = await import("./live.server"); await requireAdmin(context.supabase, context.userId); const i = await requireIncident(context.supabase, data.id);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: prior } = await context.supabase.from("incident_events").select("id").eq("incident_id", i.id).eq("event", "false-alarm").maybeSingle();
    if (prior) return { ok: true };
    const { data: p } = await context.supabase.from("profiles").select("false_count").eq("id", i.user_id).single();
    const { error } = await supabaseAdmin.from("profiles").update({ false_count: (p?.false_count ?? 0) + 1 }).eq("id", i.user_id);
    if (error) throw new Error("Flag failed"); await supabaseAdmin.from("incident_events").insert({ incident_id: i.id, actor_id: context.userId, event: "false-alarm" }); return { ok: true };
  });

export type LiveRecordContent = Post | Zone | WebsiteContent | Inquiry;