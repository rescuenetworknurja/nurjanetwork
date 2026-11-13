import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    return {
      profile: profile ?? null,
      roles: (roles ?? []).map((r) => r.role as string),
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input:unknown)=>z.object({full_name:z.string().trim().min(1).max(120).optional(),nid_number:z.string().max(30).optional(),emergency_contact_name:z.string().max(120).optional(),emergency_contact_phone:z.string().max(30).optional()}).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: Record<string, string> = {};
    for(const [key,value] of Object.entries(data))if(typeof value==="string")patch[key]=value;
    const { error } = await supabase.from("profiles").update(patch as never).eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function requireAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

export const listProfiles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const setAccountStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { userId: string; status: "active" | "suspended" | "banned"; reason?: string }) =>
      input,
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("profiles")
      .update({ account_status: data.status, status_reason: data.reason ?? null })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setKycStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: unknown) => z.object({ userId: z.string().uuid(), status: z.enum(["pending", "approved", "rejected"]), note: z.string().trim().max(500).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("profiles")
      .update({ kyc_status: data.status })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    // Audit: who decided, when, and why (one small row per user, replaced on each decision).
    const { data: me } = await context.supabase.from("profiles").select("full_name,phone").eq("id", context.userId).maybeSingle();
    const { error: auditError } = await context.supabase.from("live_records").upsert({ collection: "kyc_reviews", id: data.userId, published: false, content: { status: data.status, note: data.note ?? "", reviewerId: context.userId, reviewer: me?.full_name || me?.phone || "Admin", at: new Date().toISOString() } }, { onConflict: "collection,id" });
    if (auditError) throw new Error("KYC saved but review log failed: " + auditError.message);
    return { ok: true };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { userId: string; role: "admin" | "responder" | "user"; grant: boolean }) => input,
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const getKycReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const [{ data: sub }, { data: review }] = await Promise.all([
      context.supabase.from("kyc_submissions").select("dob,birth_reg,guardian").eq("user_id", data.userId).maybeSingle(),
      context.supabase.from("live_records").select("content").eq("collection", "kyc_reviews").eq("id", data.userId).maybeSingle(),
    ]);
    return {
      dob: (sub?.dob as string | null) ?? null,
      birthReg: (sub?.birth_reg as string | null) ?? null,
      guardian: (sub?.guardian as { name?: string; phone?: string; relation?: string; consent?: boolean } | null) ?? null,
      review: (review?.content as { status: string; note: string; reviewer: string; at: string } | null) ?? null,
    };
  });
