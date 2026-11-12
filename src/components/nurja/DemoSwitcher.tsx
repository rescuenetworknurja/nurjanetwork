import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, FlaskConical, Globe, LayoutDashboard, RotateCcw, Shield, Siren, Smartphone } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/lib/demo-store";
import { LangToggle } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const VIEWS = [
  { to: "/", label: "Public Website", icon: Globe },
  { to: "/NURJASOS", label: "NURJA App", icon: Smartphone },
  { to: "/RescueTeam", label: "Rescue Network", icon: Shield },
  { to: "/rpanel", label: "Control Panel", icon: LayoutDashboard },
] as const;

function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="grid grid-flow-col gap-1 rounded-lg bg-navy-3 p-1">
      {options.map((o) => (
        <button key={String(o.v)} onClick={() => onChange(o.v)}
          className={cn("rounded-md px-2 py-1 text-[11px] font-semibold transition", value === o.v ? "bg-paper text-ink" : "text-paper/70 hover:text-paper")}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const d = useDemo();
  const base = VIEWS.slice().reverse().find((v) => v.to === "/" ? !["/NURJASOS", "/RescueTeam", "/rpanel"].some((p) => path.startsWith(p)) : path.startsWith(v.to));

  return (
    <div className="fixed right-3 top-3 z-[100] font-sans">
      <button onClick={() => setOpen((o) => !o)}
        className="ml-auto flex items-center gap-2 rounded-full border border-paper/10 bg-navy/95 px-3 py-2 text-xs font-semibold text-paper shadow-xl backdrop-blur">
        <FlaskConical className="h-3.5 w-3.5 text-amber" />
        <span className="hidden sm:inline">Demo</span>
        <span className="rounded-full bg-paper/10 px-2 py-0.5">{base?.label}</span>
        {d.sos && <span className="flex items-center gap-1 rounded-full bg-crimson px-2 py-0.5"><Siren className="h-3 w-3 animate-blink" /> SOS</span>}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-2 w-[280px] space-y-3 rounded-2xl border border-paper/10 bg-navy/95 p-3 text-paper shadow-2xl backdrop-blur animate-rise">
          <div className="grid grid-cols-2 gap-1.5">
            {VIEWS.map((v) => (
              <Link key={v.to} to={v.to as "/"} onClick={() => setOpen(false)}
                className={cn("flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition",
                  base?.to === v.to ? "bg-crimson text-paper" : "bg-navy-2 text-paper/80 hover:bg-navy-3")}>
                <v.icon className="h-3.5 w-3.5" /> {v.label}
              </Link>
            ))}
          </div>
          <div className="space-y-2 border-t border-paper/10 pt-3">
            <Row label="Language"><LangToggle dark /></Row>
            <Row label="NURJA screen"><Seg value={d.appView} onChange={(v) => d.set({ appView: v })} options={[{ v: "onboarding", l: "Wizard" }, { v: "main", l: "Main app" }]} /></Row>
            <Row label="KYC"><Seg value={d.selfKyc === "approved" ? "approved" : "pending"} onChange={(v) => d.setSelfKyc(v)} options={[{ v: "pending", l: "Pending" }, { v: "approved", l: "Approved" }]} /></Row>
            <Row label="Age profile"><Seg value={d.user.adult ? "a" : "m"} onChange={(v) => d.setAdult(v === "a")} options={[{ v: "a", l: "Adult 18+" }, { v: "m", l: "Under 18" }]} /></Row>
            <Row label="Responder"><Seg value={d.responderType} onChange={(v) => d.set({ responderType: v })} options={[{ v: 1, l: "Type 1 Police" }, { v: 2, l: "Type 2 Volunteer" }]} /></Row>
            <Row label="Live SOS">
              <Seg value={d.sos ? "on" : "off"} onChange={(v) => (v === "on" ? d.triggerSos() : d.stopSos("Ended from demo switcher"))} options={[{ v: "off", l: "Idle" }, { v: "on", l: "Active" }]} />
            </Row>
          </div>
          <button onClick={d.reset} className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-semibold text-paper/60 hover:text-paper">
            <RotateCcw className="h-3 w-3" /> Reset demo data
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-2"><span className="text-[11px] text-paper/60">{label}</span>{children}</div>;
}
