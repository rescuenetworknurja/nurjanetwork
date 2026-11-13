import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const phoneSchema = z.string().regex(/^8801\d{9}$/);
const RESEND_SECONDS = 45;
const VALID_MINUTES = 5;
const SIGNUP_WINDOW_MINUTES = 30;

/** Sends a 6-digit registration code to a Bangladeshi phone via BulkSMSBD. */
export const sendRegistrationOtp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ phone: phoneSchema }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { hashCode, makeCode, sendSms } = await import("./otp.server");
    const { data: taken } = await supabaseAdmin.from("profiles").select("id").eq("phone", data.phone).maybeSingle();
    if (taken) return { ok: false as const, error: "exists" as const };
    const { data: prev } = await supabaseAdmin.from("phone_otps").select("sent_at").eq("phone", data.phone).maybeSingle();
    if (prev && Date.now() - new Date(prev.sent_at).getTime() < RESEND_SECONDS * 1000) {
      return { ok: false as const, error: "wait" as const };
    }
    const code = makeCode();
    await sendSms(data.phone, `Your NURJA verification code is ${code}. It expires in ${VALID_MINUTES} minutes. Do not share it.`);
    const { error } = await supabaseAdmin.from("phone_otps").upsert({
      phone: data.phone,
      code_hash: await hashCode(data.phone, code),
      expires_at: new Date(Date.now() + VALID_MINUTES * 60_000).toISOString(),
      attempts: 0,
      sent_at: new Date().toISOString(),
      verified_at: null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const, resendIn: RESEND_SECONDS };
  });

export const verifyRegistrationOtp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ phone: phoneSchema, code: z.string().regex(/^\d{6}$/) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { hashCode } = await import("./otp.server");
    const { data: row } = await supabaseAdmin.from("phone_otps").select("*").eq("phone", data.phone).maybeSingle();
    if (!row || new Date(row.expires_at).getTime() < Date.now()) return { ok: false as const, error: "expired" as const };
    if (row.attempts >= 5) return { ok: false as const, error: "locked" as const };
    if (row.code_hash !== (await hashCode(data.phone, data.code))) {
      await supabaseAdmin.from("phone_otps").update({ attempts: row.attempts + 1 }).eq("phone", data.phone);
      return { ok: false as const, error: "wrong" as const };
    }
    await supabaseAdmin.from("phone_otps").update({ verified_at: new Date().toISOString() }).eq("phone", data.phone);
    return { ok: true as const };
  });

/** Sends a 6-digit password-reset code to a phone that already has an account. */
export const sendPasswordResetOtp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ phone: phoneSchema }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { hashCode, makeCode, sendSms } = await import("./otp.server");
    const { data: prof } = await supabaseAdmin.from("profiles").select("id").eq("phone", data.phone).maybeSingle();
    if (!prof) return { ok: false as const, error: "notfound" as const };
    const { data: prev } = await supabaseAdmin.from("phone_otps").select("sent_at").eq("phone", data.phone).maybeSingle();
    if (prev && Date.now() - new Date(prev.sent_at).getTime() < RESEND_SECONDS * 1000) {
      return { ok: false as const, error: "wait" as const };
    }
    const code = makeCode();
    await sendSms(data.phone, `Your NURJA password reset code is ${code}. It expires in ${VALID_MINUTES} minutes. Do not share it.`);
    const { error } = await supabaseAdmin.from("phone_otps").upsert({
      phone: data.phone,
      code_hash: await hashCode(data.phone, code),
      expires_at: new Date(Date.now() + VALID_MINUTES * 60_000).toISOString(),
      attempts: 0,
      sent_at: new Date().toISOString(),
      verified_at: null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const, resendIn: RESEND_SECONDS };
  });

/** Verifies the reset code and sets a new password for that phone's account. */
export const resetPasswordWithOtp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ phone: phoneSchema, code: z.string().regex(/^\d{6}$/), password: z.string().min(6).max(72) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { hashCode } = await import("./otp.server");
    const { data: row } = await supabaseAdmin.from("phone_otps").select("*").eq("phone", data.phone).maybeSingle();
    if (!row || new Date(row.expires_at).getTime() < Date.now()) return { ok: false as const, error: "expired" as const };
    if (row.attempts >= 5) return { ok: false as const, error: "locked" as const };
    if (row.code_hash !== (await hashCode(data.phone, data.code))) {
      await supabaseAdmin.from("phone_otps").update({ attempts: row.attempts + 1 }).eq("phone", data.phone);
      return { ok: false as const, error: "wrong" as const };
    }
    const { data: prof } = await supabaseAdmin.from("profiles").select("id").eq("phone", data.phone).maybeSingle();
    if (!prof) return { ok: false as const, error: "notfound" as const };
    const { error } = await supabaseAdmin.auth.admin.updateUserById(prof.id, { password: data.password });
    if (error) return { ok: false as const, error: "failed" as const };
    await supabaseAdmin.from("phone_otps").delete().eq("phone", data.phone);
    return { ok: true as const };
  });

/** Creates the account only for a phone verified by OTP in the last 30 minutes. */
export const registerVerifiedPhone = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ phone: phoneSchema, password: z.string().min(8).max(72), fullName: z.string().trim().min(1).max(120), code:z.string().regex(/^\d{6}$/), pin: z.string().regex(/^\d{6}$/), dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), emergencyPhone: phoneSchema, emergencyName: z.string().max(120), relation: z.string().min(1).max(80), birthReg: z.string().optional(), guardian: z.object({name:z.string(),phone:phoneSchema,relation:z.string(),consent:z.literal(true)}).optional(), documents: z.record(z.string(),z.string().max(15_000_000)) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("phone_otps").select("verified_at,code_hash").eq("phone", data.phone).maybeSingle();
    const {hashCode}=await import("./otp.server");
    if (!row?.verified_at || row.code_hash!==await hashCode(data.phone,data.code) || Date.now() - new Date(row.verified_at).getTime() > SIGNUP_WINDOW_MINUTES * 60_000) {
      return { ok: false as const, error: "unverified" as const };
    }
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: `${data.phone}@phone.nurja.com`,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, phone: data.phone },
    });
    if (error) return { ok: false as const, error: /already/i.test(error.message) ? ("exists" as const) : ("failed" as const) };
    if (!created.user) throw new Error("Registration failed");
    const id=created.user.id;
    try {
      const { hashCode } = await import("./otp.server");
      const { savePrivateImage } = await import("./live.server");
      const birth=new Date(data.dob); const today=new Date(); let age=today.getFullYear()-birth.getFullYear();
      if(today.getMonth()<birth.getMonth() || (today.getMonth()===birth.getMonth()&&today.getDate()<birth.getDate()))age--;
      if(!Number.isFinite(birth.getTime()) || age<5)throw new Error("Invalid birth date");
      if(age<18 && (!data.guardian || !/^\d{17}$/.test(data.birthReg??"") || !data.documents["guardianNid"]))throw new Error("Guardian documents required");
      if(age>=18 && ["nidFront","nidBack","selfie"].some(k=>!data.documents[k]))throw new Error("KYC documents required");
      const documents:Record<string,string>={};
      for(const [label,src] of Object.entries(data.documents))documents[label]=await savePrivateImage(`kyc/${id}/${label}`,src);
      const [{error:profileError},{error:securityError},{error:kycError}]=await Promise.all([
        supabaseAdmin.from("profiles").update({dob:data.dob,emergency_contact_name:data.emergencyName,emergency_contact_phone:data.emergencyPhone,emergency_relation:data.relation}).eq("id",id),
        supabaseAdmin.rpc("set_sos_pin",{_user:id,_pin:data.pin}),
        supabaseAdmin.from("kyc_submissions").insert({user_id:id,dob:data.dob,birth_reg:data.birthReg??null,guardian:data.guardian??null,documents}),
      ]);
      if(profileError||securityError||kycError)throw new Error("Registration details could not be saved");
    } catch(error) { await supabaseAdmin.auth.admin.deleteUser(id); throw error; }
    await supabaseAdmin.from("phone_otps").delete().eq("phone", data.phone);
    return { ok: true as const };
  });
