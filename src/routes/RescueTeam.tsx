import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUp, BadgeCheck, CornerUpLeft, CornerUpRight, History, Map as MapIcon, Navigation, Phone, Radio, Siren, UserRound, Users, Video, X } from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame } from "@/components/nurja/PhoneFrame";
import { RescueMark } from "@/components/nurja/Brand";
import { TacticalMap } from "@/components/nurja/TacticalMap";
import { CameraFeed } from "@/components/nurja/CameraFeed";
import { PostCard } from "@/components/nurja/PostCard";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useConvergingUnits, useNow } from "@/components/nurja/sos/Home";
import { useDemo } from "@/lib/demo-store";
import { VICTIM_POS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/RescueTeam")({
  head: () => ({
    meta: [
      { title: "Rescue Network — Responder App | NURJA" },
      { name: "description", content: "Tactical responder app for police units and verified volunteers: incoming SOS, dispatch map and navigation." },
      { property: "og:title", content: "Rescue Network — Responder App | NURJA" },
      { property: "og:description", content: "Tactical responder app for police units and verified volunteers." },
    ],
  }),
  component: RescueApp,
});

const TABS = [
  { id: "map", label: "Dispatch Map", icon: MapIcon },
  { id: "community", label: "Community", icon: Users },
  { id: "history", label: "Case History", icon: History },
  { id: "profile", label: "Profile", icon: UserRound },
] as const;

const ROUTE_TO_VICTIM: [number, number][] = [[30, 34], [35, 34], [35, 50], [50, 50]];

function RescueApp() {
  const d = useDemo();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("map");
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<string | null>(null);
  const t1 = d.responderType === 1;
  const myCode = t1 ? "PU-07" : "V-J75UN2";
  const sos = d.sos && d.responderOnline && dismissed !== d.sos.id ? d.sos : null;
  const navigating = !!sos && (t1 || accepted === sos.id || sos.acceptedBy.includes(myCode));

  useEffect(() => { if (d.sos && t1) d.acceptSos(myCode); }, [d.sos?.id, t1]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PhoneFrame dark>
      <div className="dark flex min-h-0 flex-1 flex-col bg-background text-foreground">
        <div className="bg-navy px-4 pb-3 pt-4 md:pt-9">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-navy-3 p-1">
            {[1, 2].map((n) => (
              <button key={n} onClick={() => d.set({ responderType: n as 1 | 2 })}
                className={cn("rounded-lg px-2 py-1.5 text-[11px] font-bold leading-tight", d.responderType === n ? "bg-paper text-ink" : "text-paper/60")}>
                {n === 1 ? "Type 1 · Station / Fari / Patrol" : "Type 2 · Volunteer / Officer"}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <RescueMark label="" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold text-paper">{t1 ? "Patrol Unit DMP-07" : "Rakibul Islam"}</p>
              <span className={cn("inline-block rounded px-1.5 py-0.5 text-[10px] font-bold", t1 ? "bg-crimson text-paper" : "bg-emerald text-paper")}>
                {t1 ? "TYPE 1 · POLICE PATROL" : "TYPE 2 · VOLUNTEER V-J75UN2"}
              </span>
            </div>
            <label className={cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold", d.responderOnline ? "bg-emerald/20 text-emerald" : "bg-paper/10 text-paper/60")}>
              {d.responderOnline ? "Online" : "Offline"}
              <Switch checked={d.responderOnline} onCheckedChange={(v) => { d.set({ responderOnline: v }); toast(v ? "You're online and receiving alerts" : "You're offline"); }} className="data-[state=checked]:bg-emerald" />
            </label>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
          {tab === "map" && (navigating ? <Navigate type1={t1} /> : <DispatchHome onSim={() => { setDismissed(null); setAccepted(null); if (!d.sos) d.triggerSos(); else toast("An SOS is already active"); }} />)}
          {tab === "community" && <div className="space-y-4 p-4">{d.posts.filter((p) => p.targets.rescue).map((p) => <PostCard key={p.id} post={p} compact dark />)}</div>}
          {tab === "history" && <HistoryTab />}
          {tab === "profile" && <ProfileT type1={t1} />}

          {sos && !navigating && !t1 && (
            <div className="absolute inset-x-3 top-3 z-30 overflow-hidden rounded-3xl border border-crimson bg-card shadow-2xl animate-rise">
              <div className="flex items-center gap-2 bg-crimson px-4 py-2.5 text-paper"><Siren className="h-4 w-4 animate-blink" /><p className="flex-1 text-xs font-extrabold uppercase tracking-wider">Incoming SOS alert</p><span className="font-mono text-[11px]">{sos.id}</span></div>
              <div className="space-y-3 p-4">
                <div className="flex items-end justify-between">
                  <div><p className="text-xs text-muted-foreground">Victim distance</p><p className="font-display text-4xl font-extrabold text-crimson">0.8 km away</p></div>
                  <p className="text-right text-xs text-muted-foreground">~3 min<br />on foot 9 min</p>
                </div>
                <p className="text-sm"><b>{sos.victim.split(" ")[0]}</b> · {sos.area}</p>
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <Button variant="outline" className="h-12 rounded-xl" onClick={() => setDismissed(sos.id)}><X /> Decline</Button>
                  <Button className="h-12 rounded-xl bg-emerald text-base font-bold hover:bg-emerald/90" onClick={() => { setAccepted(sos.id); d.acceptSos(myCode); toast.success("Accepted. Navigation started."); }}>Accept / Respond</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className="grid grid-cols-4 border-t bg-navy px-2 pb-4 pt-2">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex flex-col items-center gap-1 py-1.5 text-[10px] font-semibold", tab === t.id ? "text-crimson" : "text-paper/50")}>
              <t.icon className="h-5 w-5" />{t.label}
            </button>
          ))}
        </nav>
      </div>
    </PhoneFrame>
  );
}

function DispatchHome({ onSim }: { onSim: () => void }) {
  const d = useDemo();
  const online = d.responders.filter((r) => r.online);
  return (
    <div className="flex flex-1 flex-col">
      <TacticalMap className="h-72 tactical-grid" zones={d.zones} units={[{ id: "me", label: "You", kind: d.responderType === 1 ? "patrol" : "volunteer", x: 30, y: 34 }]} />
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          {[{ l: "Units online", v: online.length }, { l: "Active SOS", v: d.sos ? 1 : 0 }, { l: "My cases", v: d.cases.length }].map((s) => (
            <div key={s.l} className="rounded-2xl border bg-card p-3"><p className="font-display text-2xl font-extrabold">{s.v}</p><p className="text-[10px] text-muted-foreground">{s.l}</p></div>
          ))}
        </div>
        <div className={cn("rounded-2xl border p-4", d.responderOnline ? "border-emerald/30 bg-emerald-soft" : "bg-card")}>
          <p className="flex items-center gap-2 text-sm font-bold"><Radio className={cn("h-4 w-4", d.responderOnline && "animate-blink text-emerald")} /> {d.responderOnline ? "Standing by for alerts" : "Go online to receive alerts"}</p>
          <p className="mt-1 text-xs text-muted-foreground">Area: Motijheel · Radius 3 km</p>
        </div>
        <Button size="lg" className="h-14 w-full rounded-2xl text-base font-bold" disabled={!d.responderOnline} onClick={onSim}>
          <Siren /> Simulate Incoming SOS Alert
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">Or trigger SOS from the NURJA app — it shows up here live.</p>
      </div>
    </div>
  );
}

function Navigate({ type1 }: { type1: boolean }) {
  const d = useDemo();
  const sos = d.sos!;
  const now = useNow();
  const units = useConvergingUnits(sos.startedAt, sos.acceptedBy);
  const progress = Math.min(1, (now - sos.startedAt) / 90000);
  const dist = (0.8 * (1 - progress)).toFixed(2);
  const steps = [
    { i: ArrowUp, t: "Head south on Shapla Chattar", d: "200 m" },
    { i: CornerUpLeft, t: "Turn left onto Toyenbee Circular Rd", d: "450 m" },
    { i: CornerUpRight, t: "Victim on right, near Sonali Bank gate", d: "150 m" },
  ];
  const cur = Math.min(2, Math.floor(progress * 3));
  const S = steps[cur]!;
  return (
    <div className="flex flex-1 flex-col">
      {type1 && (
        <div className="px-4 py-3 text-center text-paper animate-flash">
          <p className="font-display text-base font-extrabold tracking-wider">MANDATORY DISPATCH — AUTO ACCEPTED</p>
          <p className="text-[11px] opacity-80">{sos.id} · Priority 1 · Report on arrival</p>
        </div>
      )}
      <div className="flex items-center gap-3 bg-emerald px-4 py-3 text-paper">
        <S.i className="h-9 w-9" />
        <div className="flex-1"><p className="font-display text-lg font-bold leading-tight">{S.t}</p><p className="text-xs opacity-80">then {steps[Math.min(2, cur + 1)]!.t.toLowerCase()}</p></div>
        <p className="font-display text-xl font-extrabold">{S.d}</p>
      </div>
      <div className="relative">
        <TacticalMap className="h-64 tactical-grid" victim={VICTIM_POS} route={ROUTE_TO_VICTIM} units={units.filter((u) => u.kind !== "volunteer" || u.id === "v0")} zones={d.zones} />
        <div className="absolute bottom-3 left-3 rounded-xl bg-navy/90 px-3 py-2 text-paper">
          <p className="text-[10px] uppercase opacity-60">Distance to victim</p>
          <p className="font-display text-xl font-extrabold">{dist} km · {Math.max(0, Math.ceil(3 * (1 - progress)))} min</p>
        </div>
        <div className="absolute right-3 top-3 w-28 overflow-hidden rounded-xl border-2 border-crimson">
          <CameraFeed camera={sos.camera} className="aspect-[3/4] rounded-none" label=" " />
          <span className="absolute inset-x-0 bottom-0 bg-crimson py-0.5 text-center text-[9px] font-bold text-paper"><Video className="mr-0.5 inline h-2.5 w-2.5" />VICTIM CAM</span>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="rounded-2xl border bg-card p-3.5">
          <p className="text-xs text-muted-foreground">Victim</p>
          <p className="font-bold">{sos.victim} · {sos.area}</p>
          <p className="mt-1 text-xs text-muted-foreground">{sos.acceptedBy.length} responders accepted · 2 patrols, 1 fari, 1 station dispatched</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-12 rounded-xl" onClick={() => toast("Calling control room…")}><Phone /> Control room</Button>
          <Button className="h-12 rounded-xl bg-emerald hover:bg-emerald/90" onClick={() => { d.stopSos("Rescued safely — responder on scene"); toast.success("Marked as rescued. Case archived."); }}><Navigation /> Arrived · Rescued</Button>
        </div>
      </div>
    </div>
  );
}

function HistoryTab() {
  const { cases } = useDemo();
  return (
    <div className="space-y-3 p-4">
      <h2 className="font-display text-lg font-bold">Case history</h2>
      {cases.map((c) => (
        <div key={c.id + c.date} className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between"><span className="font-mono text-xs text-muted-foreground">{c.id}</span><span className="text-[11px] text-muted-foreground">{c.date}</span></div>
          <p className="mt-1 font-bold">{c.victim} · {c.area}</p>
          <div className="mt-2 flex items-center justify-between text-xs"><span className={cn("rounded-full px-2 py-0.5 font-semibold", c.outcome.startsWith("False") ? "bg-amber-soft text-amber" : "bg-emerald-soft text-emerald")}>{c.outcome}</span><span className="text-muted-foreground">Duration {c.duration}</span></div>
        </div>
      ))}
    </div>
  );
}

function ProfileT({ type1 }: { type1: boolean }) {
  const d = useDemo();
  const approved = d.volunteerApps.filter((a) => a.status === "approved");
  return (
    <div className="space-y-3 p-4">
      <div className="rounded-3xl border bg-card p-5 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-navy-3 font-display text-2xl font-extrabold">{type1 ? "07" : "RI"}</div>
        <p className="mt-3 font-display text-lg font-bold">{type1 ? "Patrol Unit DMP-07" : "Rakibul Islam"}</p>
        <p className="text-sm text-muted-foreground">{type1 ? "Motijheel Division · Dhaka Metropolitan Police" : "Volunteer · Shantinagar"}</p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-soft px-3 py-1 text-xs font-bold text-emerald"><BadgeCheck className="h-3.5 w-3.5" /> {type1 ? "Unit code PU-07" : "Volunteer ID V-J75UN2"}</span>
        {!type1 && <p className="mt-2 text-xs text-muted-foreground">Officers sign in with TaskForce ID (e.g. TF-902)</p>}
      </div>
      {approved.length > 0 && (
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">Newly approved volunteers</p>
          {approved.map((a) => <p key={a.id} className="mt-2 flex justify-between text-sm"><span>{a.name}</span><span className="font-mono font-bold text-emerald">{a.volunteerId}</span></p>)}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[{ l: "Rescues", v: 23 }, { l: "Avg ETA", v: "3.4m" }, { l: "Rating", v: "4.9" }].map((s) => <div key={s.l} className="rounded-2xl border bg-card p-3"><p className="font-display text-xl font-extrabold">{s.v}</p><p className="text-[10px] text-muted-foreground">{s.l}</p></div>)}
      </div>
    </div>
  );
}
