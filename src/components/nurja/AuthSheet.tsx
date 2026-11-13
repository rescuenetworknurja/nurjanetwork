import { useState } from "react";
import { KeyRound, Loader2, Lock, Phone, ShieldCheck, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/lib/demo-store";
import { supabase } from "@/integrations/supabase/client";
import { isEmailInput, isValidBdPhone, normalizePhone, signInWithPhone, signUpWithPhone } from "@/lib/auth";
import { prepareSmsPasswordReset } from "@/lib/otp.functions";
import { PinInput } from "@/components/nurja/sos/ui";
import { cn } from "@/lib/utils";

/**
 * Shared phone+password auth form. Used by the /auth page and by the
 * NURJASOS splash sheet so users never leave the app to sign in.
 */
export function NurjaAuthForm({
  initialMode = "signin",
  lockMode = false,
  onDone,
  onSignedUp,
  resetMethod = "sms",
}: {
  initialMode?: "signin" | "signup";
  /** "email": reset link by email (/auth). "sms": Supabase phone OTP via the BulkSMSBD auth hook (NURJASOS). */
  resetMethod?: "email" | "sms";
  /** Hide the signin/signup toggle (e.g. the splash sheet is login-only; signup goes through the wizard). */
  lockMode?: boolean;
  onDone?: () => void;
  /** Called after a successful signup that returned a session (before onDone). */
  onSignedUp?: (() => void) | undefined;
}) {
  const d = useDemo();
  const bn = d.lang === "bn";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [view, setView] = useState<"form" | "reset">("form");
  const [resetStep, setResetStep] = useState<"phone" | "otp" | "password" | "done">("phone");
  const [resetOtp, setResetOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  const t = {
    signin: bn ? "সাইন ইন" : "Sign in",
    signup: bn ? "নতুন অ্যাকাউন্ট" : "Create account",
    phone: bn ? "মোবাইল নম্বর বা ইমেইল" : "Phone number or email",
    password: bn ? "পাসওয়ার্ড" : "Password",
    name: bn ? "পুরো নাম" : "Full name",
    submitIn: bn ? "সাইন ইন করুন" : "Sign in",
    submitUp: bn ? "অ্যাকাউন্ট তৈরি করুন" : "Create account",
    badPhone: bn ? "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)" : "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)",
    badPass: bn ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters",
    badName: bn ? "আপনার পুরো নাম লিখুন" : "Enter your full name",
    welcome: bn ? "NURJA-তে স্বাগতম" : "Welcome to NURJA",
    sub: bn ? "আপনার মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে সাইন ইন করুন" : "Sign in with your phone number and password",
    signedUp: bn ? "অ্যাকাউন্ট তৈরি হয়েছে! এখন সাইন ইন করুন।" : "Account created! Now sign in.",
    fail: bn ? "সাইন ইন ব্যর্থ হয়েছে। নম্বর ও পাসওয়ার্ড যাচাই করুন।" : "Sign-in failed. Check your number and password.",
    forgot: bn ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?",
    resetTitle: bn ? "পাসওয়ার্ড রিসেট" : "Reset password",
    resetSub: resetMethod === "email" ? (bn ? "আপনার ইমেইল দিন, রিসেট লিংক পাঠানো হবে" : "Enter your email to receive a reset link") : (bn ? "আপনার মোবাইল নম্বর দিন" : "Enter your mobile number"),
    email: bn ? "ইমেইল" : "Email",
    badEmail: bn ? "সঠিক ইমেইল দিন" : "Enter a valid email",
    sendLink: bn ? "রিসেট লিংক পাঠান" : "Send reset link",
    sendOtp: bn ? "OTP পাঠান" : "Send OTP",
    otpTitle: bn ? "OTP যাচাই করুন" : "Verify OTP",
    otpSub: bn ? "আপনার মোবাইলে পাঠানো ৬ সংখ্যার কোডটি লিখুন" : "Enter the 6-digit code sent to your mobile",
    verifyOtp: bn ? "যাচাই করুন" : "Verify",
    newPassTitle: bn ? "নতুন পাসওয়ার্ড" : "New password",
    newPassSub: bn ? "নতুন পাসওয়ার্ড সেট করুন" : "Set your new password",
    newPass: bn ? "নতুন পাসওয়ার্ড" : "New password",
    newPass2: bn ? "পাসওয়ার্ড আবার লিখুন" : "Confirm new password",
    savePass: bn ? "পাসওয়ার্ড সেভ করুন" : "Save password",
    passMismatch: bn ? "দুই পাসওয়ার্ড মিলছে না" : "Passwords do not match",
    resetDone: bn ? "পাসওয়ার্ড বদলে গেছে! এখন নতুন পাসওয়ার্ড দিয়ে সাইন ইন করুন।" : "Password changed! Now sign in with your new password.",
    resetSent: bn ? "রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে। ইনবক্স দেখুন।" : "A reset link has been sent to your email. Check your inbox.",
    notFound: bn ? "এই নম্বরে কোনো অ্যাকাউন্ট নেই" : "No account found with this number",
    otpWrong: bn ? "ভুল কোড। আবার চেষ্টা করুন।" : "Wrong code. Try again.",
    otpExpired: bn ? "কোডের মেয়াদ শেষ। নতুন কোড নিন।" : "Code expired. Request a new one.",
    otpLocked: bn ? "অনেকবার ভুল হয়েছে। নতুন কোড নিন।" : "Too many attempts. Request a new code.",
    resend: bn ? "আবার পাঠান" : "Resend code",
    resendIn: bn ? "সেকেন্ড পর আবার পাঠানো যাবে" : "seconds until you can resend",
    backToLogin: bn ? "লগইনে ফিরে যান" : "Back to login",
  };

  function startResendTimer(seconds: number) {
    setResendIn(seconds);
    const iv = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) { clearInterval(iv); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  async function submitResetPhone(e: React.FormEvent) {
    e.preventDefault();
    if (resetMethod === "email") {
      if (!isEmailInput(phone)) { toast.error(t.badEmail); return; }
      setBusy(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(phone.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success(t.resetSent);
        setResetStep("done");
      } catch {
        toast.error(t.fail);
      } finally {
        setBusy(false);
      }
      return;
    }
    if (!isValidBdPhone(phone)) { toast.error(t.badPhone); return; }
    setBusy(true);
    try {
      const r = await prepareSmsPasswordReset({ data: { phone: normalizePhone(phone) } });
      if (!r.ok) { toast.error(r.error === "notfound" ? t.notFound : t.fail); return; }
      // Supabase sends the code through the configured SMS hook (BulkSMSBD).
      const { error } = await supabase.auth.signInWithOtp({ phone: `+${normalizePhone(phone)}`, options: { shouldCreateUser: false } });
      if (error) throw error;
      setResetOtp("");
      setResetStep("otp");
      startResendTimer(60);
    } catch {
      toast.error(t.fail);
    } finally {
      setBusy(false);
    }
  }

  async function submitResetOtp(e: React.FormEvent) {
    e.preventDefault();
    if (resetOtp.length !== 6) { toast.error(t.otpWrong); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: `+${normalizePhone(phone)}`, token: resetOtp, type: "sms" });
      if (error) { toast.error(/expired/i.test(error.message) ? t.otpExpired : t.otpWrong); return; }
      setResetStep("password");
    } finally {
      setBusy(false);
    }
  }

  async function submitNewPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPass.length < 6) { toast.error(t.badPass); return; }
    if (newPass !== newPass2) { toast.error(t.passMismatch); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success(t.resetDone);
      setResetStep("done");
    } catch {
      toast.error(t.fail);
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmailInput(phone) && !isValidBdPhone(phone)) { toast.error(t.badPhone); return; }
    if (password.length < 6) { toast.error(t.badPass); return; }
    if (mode === "signup" && fullName.trim().length < 2) { toast.error(t.badName); return; }
    setBusy(true);
    try {
      if (mode === "signup") {
        const data = await signUpWithPhone({ phone, password, fullName: fullName.trim() });
        if (data.session) {
          onSignedUp?.();
          onDone?.();
        } else {
          toast.success(t.signedUp);
          setMode("signin");
        }
      } else {
        await signInWithPhone(phone, password);
        onDone?.();
      }
    } catch {
      toast.error(t.fail);
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-input bg-card px-4 py-3 pl-11 text-sm text-foreground outline-none transition focus:border-crimson focus:ring-2 focus:ring-crimson/20";

  if (view === "reset") {
    const backBtn = (
      <button
        type="button"
        onClick={() => { setView("form"); setResetStep("phone"); }}
        className="w-full text-center text-sm font-semibold text-muted-foreground"
      >
        {t.backToLogin}
      </button>
    );
    return (
      <div className="w-full">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-crimson"><KeyRound className="h-6 w-6" /></span>
          <h1 className="font-display text-2xl font-extrabold text-foreground">
            {resetStep === "otp" ? t.otpTitle : resetStep === "password" ? t.newPassTitle : t.resetTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {resetStep === "otp" ? t.otpSub : resetStep === "password" ? t.newPassSub : t.resetSub}
          </p>
        </div>

        {resetStep === "done" ? (
          <button
            onClick={() => { setView("form"); setResetStep("phone"); }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-crimson py-3 text-sm font-bold text-paper shadow-sos transition hover:brightness-110"
          >
            {t.backToLogin}
          </button>
        ) : resetStep === "phone" ? (
          <form onSubmit={submitResetPhone} className="space-y-4">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={resetMethod === "email" ? t.email : "01XXXXXXXXX"}
                inputMode={resetMethod === "email" ? "email" : "tel"}
                type={resetMethod === "email" ? "email" : "tel"}
                autoComplete={resetMethod === "email" ? "email" : "tel"}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-crimson py-3 text-sm font-bold text-paper shadow-sos transition hover:brightness-110 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {resetMethod === "email" ? t.sendLink : t.sendOtp}
            </button>
            {backBtn}
          </form>
        ) : resetStep === "otp" ? (
          <form onSubmit={submitResetOtp} className="space-y-4">
            <PinInput value={resetOtp} onChange={setResetOtp} autoFocus />
            <button
              type="submit"
              disabled={resetOtp.length !== 6 || busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-crimson py-3 text-sm font-bold text-paper shadow-sos transition hover:brightness-110 disabled:opacity-60"
            >
              {t.verifyOtp}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                className="font-semibold text-crimson disabled:text-muted-foreground"
                disabled={resendIn > 0 || busy}
                onClick={() => { setResetOtp(""); void submitResetPhone({ preventDefault() {} } as React.FormEvent); }}
              >
                {resendIn > 0 ? `${resendIn} ${t.resendIn}` : t.resend}
              </button>
            </p>
            {backBtn}
          </form>
        ) : (
          <form onSubmit={submitNewPassword} className="space-y-4">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className={inputCls}
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder={t.newPass}
                autoComplete="new-password"
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className={inputCls}
                type="password"
                value={newPass2}
                onChange={(e) => setNewPass2(e.target.value)}
                placeholder={t.newPass2}
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-crimson py-3 text-sm font-bold text-paper shadow-sos transition hover:brightness-110 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.savePass}
            </button>
            {backBtn}
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-2xl font-extrabold text-foreground">{t.welcome}</h1>
        <p className="text-sm text-muted-foreground">{t.sub}</p>
      </div>

      {!lockMode && (
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded-md py-2 text-sm font-bold transition",
                mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {m === "signin" ? t.signin : t.signup}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={inputCls}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.name}
              autoComplete="name"
            />
          </div>
        )}
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className={inputCls}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phone}
            inputMode="tel"
            autoComplete="tel"
          />
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className={inputCls}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.password}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-crimson py-3 text-sm font-bold text-paper shadow-sos transition hover:brightness-110 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? t.submitIn : t.submitUp}
        </button>
        {mode === "signin" && (
          <button type="button" onClick={() => setView("reset")} className="w-full text-center text-sm font-semibold text-crimson">
            {t.forgot}
          </button>
        )}
      </form>

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
        {bn ? "আপনার তথ্য এনক্রিপ্টেড ও সুরক্ষিত" : "Your information is encrypted and secure"}
      </p>
    </div>
  );
}

/** Full-screen sheet that slides over the NURJASOS splash with the auth form. */
export function AuthSheet({
  open,
  initialMode,
  onClose,
  onSignedUp,
}: {
  open: boolean;
  initialMode: "signin" | "signup";
  onClose: () => void;
  onSignedUp?: () => void;
}) {
  const d = useDemo();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[92dvh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-background px-6 pb-10 pt-4 shadow-2xl animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="mx-auto h-1.5 w-10 rounded-full bg-muted" />
          <button
            onClick={onClose}
            aria-label={d.lang === "bn" ? "বন্ধ করুন" : "Close"}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <NurjaAuthForm key={initialMode} initialMode={initialMode} lockMode resetMethod="sms" onDone={onClose} onSignedUp={onSignedUp} />
      </div>
    </div>
  );
}
