import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDemo } from "@/lib/demo-store";

/**
 * Public landing page for Supabase password-recovery links.
 * The recovery link carries a session in the URL hash; once detected, the
 * user sets a new password via updateUser (recovery sessions need no
 * current_password).
 */
export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — NURJA" },
      { name: "description", content: "Set a new password for your NURJA account." },
      { property: "og:title", content: "Reset Password — NURJA" },
      { property: "og:description", content: "Set a new password for your NURJA account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const d = useDemo();
  const bn = d.lang === "bn";
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // The recovery token arrives in the URL hash; the Supabase client picks
    // it up and fires PASSWORD_RECOVERY once the session is established.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Already-hydrated recovery session (e.g. client-side navigation).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && window.location.hash.includes("type=recovery")) setReady(true);
      else if (!window.location.hash.includes("type=recovery")) setInvalid(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(bn ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error(bn ? "পাসওয়ার্ড দুটি মিলছে না" : "Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success(bn ? "পাসওয়ার্ড বদলে গেছে! এখন সাইন ইন করুন।" : "Password updated! Now sign in.");
      await supabase.auth.signOut();
      void navigate({ to: "/auth", search: { redirect: "/NURJASOS" } });
    } catch {
      toast.error(bn ? "পাসওয়ার্ড বদলানো যায়নি। লিংকটির মেয়াদ শেষ হয়ে গেছে হতে পারে।" : "Could not update the password. The link may have expired.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-crimson focus:ring-2 focus:ring-crimson/20";

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-crimson">
            <KeyRound className="h-6 w-6" />
          </span>
          <h1 className="font-display text-2xl font-extrabold text-foreground">
            {bn ? "নতুন পাসওয়ার্ড দিন" : "Set a new password"}
          </h1>
        </div>

        {invalid ? (
          <p className="text-center text-sm text-muted-foreground">
            {bn
              ? "এই লিংকটি আর কাজ করছে না। লগইন পেজ থেকে আবার রিসেট লিংক চান।"
              : "This link is no longer valid. Request a new reset link from the login page."}
          </p>
        ) : !ready ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-crimson" />
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input
              className={inputCls}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={bn ? "নতুন পাসওয়ার্ড" : "New password"}
              autoComplete="new-password"
            />
            <input
              className={inputCls}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={bn ? "পাসওয়ার্ড আবার লিখুন" : "Confirm password"}
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-crimson py-3 text-sm font-bold text-paper shadow-sos transition hover:brightness-110 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {bn ? "পাসওয়ার্ড বদলান" : "Update password"}
            </button>
          </form>
        )}

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
          {bn ? "আপনার তথ্য এনক্রিপ্টেড ও সুরক্ষিত" : "Your information is encrypted and secure"}
        </p>
      </div>
    </div>
  );
}
