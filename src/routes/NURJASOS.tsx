import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Route as RouteIcon, UserRound, Users } from "lucide-react";
import { PhoneFrame } from "@/components/nurja/PhoneFrame";
import { Onboarding } from "@/components/nurja/sos/Onboarding";
import { HomeTab } from "@/components/nurja/sos/Home";
import { CommunityTab, ProfileTab, SafeRouteTab } from "@/components/nurja/sos/Tabs";
import { useDemo } from "@/lib/demo-store";
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

function NurjaApp() {
  const d = useDemo();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("home");
  return (
    <PhoneFrame>
      <div className="flex justify-center gap-1 px-4 pt-3 md:pt-9">
        {(["onboarding", "main"] as const).map((v) => (
          <button key={v} onClick={() => d.set({ appView: v })}
            className={cn("rounded-full px-3 py-1 text-[11px] font-bold transition", d.appView === v ? "bg-ink text-paper" : "bg-muted text-muted-foreground")}>
            {v === "onboarding" ? "Onboarding Wizard" : "Main App Screen"}
          </button>
        ))}
      </div>
      {d.appView === "onboarding" ? <Onboarding /> : (
        <>
          <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
            {(tab === "home" || d.sos) && <HomeTab />}
            {!d.sos && tab === "route" && <SafeRouteTab />}
            {!d.sos && tab === "community" && <CommunityTab />}
            {!d.sos && tab === "profile" && <ProfileTab />}
          </div>
          {!d.sos && (
            <nav className="sticky bottom-0 grid grid-cols-4 border-t bg-card/95 px-2 pb-4 pt-2 backdrop-blur">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold", tab === t.id ? "text-crimson" : "text-muted-foreground")}>
                  <t.icon className="h-5 w-5" />{t.label}
                </button>
              ))}
            </nav>
          )}
        </>
      )}
    </PhoneFrame>
  );
}
