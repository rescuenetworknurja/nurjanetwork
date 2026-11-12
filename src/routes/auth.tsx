import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Phone, Lock, UserRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { NurjaMark } from "@/components/nurja/Brand";
import { useDemo } from "@/lib/demo-store";
import { LangToggle } from "@/lib/i18n";
import { isEmailInput, isValidBdPhone, signInWithPhone, signUpWithPhone, useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : "/NURJASOS",
    mode: search["mode"] === "signup" ? ("signup" as const) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In — NURJA" },
      { name: "description", content: "Sign in to NURJA with your phone number and password." },
      { property: "og:title", content: "Sign In — NURJA" },
      { property: "og:description", content: "Sign in to NURJA with your phone number and password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const d = useDemo();
  const bn = d.lang === "bn";
  const navigate = useNavigate();
  const { redirect, mode: initialMode } = Route.useSearch();
  const session = useSession();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
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
    phoneHint: bn ? "উদাহরণ: 01XXXXXXXXX" : "Example: 01XXXXXXXXX",
    submitIn: bn ? "সাইন ইন করুন" : "Sign in",
    submitUp: bn ? "অ্যাকাউন্ট তৈরি করুন" : "Create account",
    badPhone: bn ? "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)" : "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)",
    badPass: bn ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters",
    badName: bn ? "আপনার পুরো নাম লিখুন" : "Enter your full name",
    welcome: bn ? "NURJA-তে স্বাগতম" : "Welcome to NURJA",
    sub: bn ? "আপনার মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে সাইন ইন করুন" : "Sign in with your phone number and password",
    signedUp: bn ? "অ্যাকাউন্ট তৈরি হয়েছে! এখন সাইন ইন করুন।" : "Account created! Now sign in.",
    fail: bn ? "সাইন ইন ব্যর্থ হয়েছে। নম্বর ও পাসওয়ার্ড যাচাই করুন।" : "Sign-in failed. Check your number and password.",
  };

  if (!session.loading && session.user) {
    void navigate({ to: redirect as never });
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
          void navigate({ to: redirect as never });
        } else {
          toast.success(t.signedUp);
          setMode("signin");
        }
      } else {
        await signInWithPhone(phone, password);
        void navigate({ to: redirect as never });
      }
    } catch {
      toast.error(t.fail);
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-input bg-card px-4 py-3 pl-11 text-sm text-foreground outline-none transition focus:border-crimson focus:ring-2 focus:ring-crimson/20";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4"><LangToggle /></div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <NurjaMark tagline />
          <h1 className="font-display text-2xl font-extrabold text-foreground">{t.welcome}</h1>
          <p className="text-sm text-muted-foreground">{t.sub}</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
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
            <p className="mt-1 pl-1 text-[11px] text-muted-foreground">{t.phoneHint}</p>
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
        </form>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
          {bn ? "আপনার তথ্য এনক্রিপ্টেড ও সুরক্ষিত" : "Your information is encrypted and secure"}
        </p>
      </div>
    </div>
  );
}
