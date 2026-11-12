import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Route as RouteIcon, ShieldAlert, UserRound, Users } from "lucide-react";
import { PhoneFrame } from "@/components/nurja/PhoneFrame";
import { Onboarding, SignedOutSplash } from "@/components/nurja/sos/Onboarding";
import { HomeTab } from "@/components/nurja/sos/Home";
import { CommunityTab, ProfileTab, SafeRouteTab } from "@/components/nurja/sos/Tabs";
import { useDemo } from "@/lib/demo-store";
import { AuthGate } from "@/components/nurja/AuthGate";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/NURJASOS")({
  head: () => ({
    meta: [
      { title: "NURJA SOS — Women Safety App" },
      { name: "description", content: "One-tap SOS with live camera, GPS and nearest police and volunteer dispatch." },
      { property: "og:title", content: "NURJA SOS — Women Safety App" },
      { property: "og:description", content: "One-tap SOS with live camera, GPS and nearest police and volunteer dispatch." },
    ],
  }),
  component: NurjaApp,
});

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "route", label: "Safe Route", icon: RouteIcon },
  { id: "community", label: "Community", icon: Users },
  { id: "profile", label: "Profile", icon: UserRound },
] as const;

/** Signed-out view: splash with Login, or the Create-account wizard. */
function SignedOutView() {
  const d = useDemo();
  return <PhoneFrame>{d.appView === "onboarding" ? <Onboarding /> : <SignedOutSplash />}</PhoneFrame>;
}

function NurjaApp() {
  const d = useDemo();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("home");
  const locked = d.selfStatus !== "active";
  return (
    <AuthGate redirectTo="/NURJASOS" signedOut={<SignedOutView />}>
    <PhoneFrame>
      {locked ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="relative grid h-24 w-24 place-items-center rounded-full bg-crimson text-paper shadow-sos">
            <span className="absolute inset-0 rounded-full bg-crimson animate-ripple" />
            <ShieldAlert className="relative h-12 w-12" />
          </span>
          <p className="font-display text-xl font-extrabold text-crimson">
            {d.lang === "bn" ? (d.selfStatus === "banned" ? "অ্যাকাউন্ট স্থায়ীভাবে ব্যান করা হয়েছে" : "অ্যাকাউন্ট সাময়িকভাবে স্থগিত") : (d.selfStatus === "banned" ? "Account Permanently Banned" : "Account Temporarily Suspended")}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {d.lang === "bn"
              ? `আপনার অ্যাকাউন্টটি কন্ট্রোল প্যানেল থেকে স্থগিত/ব্যান করা হয়েছে। কারণ: ${d.selfBanReason ?? "—"}। বিস্তারিত জানতে সাপোর্টে যোগাযোগ করুন।`
              : `Your account has been suspended/banned by the Control Panel. Reason: ${d.selfBanReason ?? "—"}. Contact support for details.`}
          </p>
          <p className="rounded-lg bg-crimson-soft px-4 py-2 text-xs font-bold text-crimson">
            {d.lang === "bn" ? "SOS বাটন সম্পূর্ণ নিষ্ক্রিয় করা হয়েছে" : "The SOS button is completely disabled"}
          </p>
        </div>
      ) : d.appView === "onboarding" ? <Onboarding /> : (
        <>
          <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto pb-24">
            {(tab === "home" || d.sos) && <HomeTab />}
            {!d.sos && tab === "route" && <SafeRouteTab />}
            {!d.sos && tab === "community" && <CommunityTab />}
            {!d.sos && tab === "profile" && <ProfileTab />}
          </div>
          {!d.sos && (
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 shadow-lg backdrop-blur-md">
              <div className="mx-auto grid max-w-[430px] grid-cols-4 px-2 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold", tab === t.id ? "text-crimson" : "text-muted-foreground")}>
                    <t.icon className="h-5 w-5" />{t.label}
                  </button>
                ))}
              </div>
            </nav>
          )}
        </>
      )}
    </PhoneFrame>
    </AuthGate>
  );
}
