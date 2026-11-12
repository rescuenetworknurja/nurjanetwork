import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUp, BadgeCheck, Building2, Car, CornerUpLeft, CornerUpRight, Eye, EyeOff, History, KeyRound, LogIn, LogOut, Map as MapIcon, Navigation, Phone, Radio, Shield, ShieldCheck, Siren, UserRound, Users, Video, X } from "lucide-react";
import { toast } from "sonner";
import { RescueMark } from "@/components/nurja/Brand";
import { LiveMapLazy } from "@/components/nurja/LiveMapLazy";
import { VictimCamera } from "@/components/nurja/VictimCamera";
import { IncidentEvidenceGallery } from "@/components/nurja/IncidentEvidenceGallery";
import { PostCard } from "@/components/nurja/PostCard";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNetworkUnits, useNow } from "@/components/nurja/sos/Home";
import { useDemo } from "@/lib/demo-store";
import { AuthGate } from "@/components/nurja/AuthGate";
import { useSession } from "@/lib/auth";
import { VICTIM_POS, findAccount, isType1, type Responder } from "@/lib/mock-data";
import { LanguageSetting, Slogan, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/RescueTeam")({
  head: () => ({
    meta: [
      { title: "Rescue Network — Responder App | NURJA" },
      { name: "description", content: "Tactical responder app for police units and verified volunteers: incoming SOS, dispatch map and navigation." },
      { property: "og:title", content: "Rescue Network — Responder App | NURJA" },
      { property: "og:description", content: "Tactical responder app for police units and verified volunteers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

const KIND_SHORT: Record<Responder["kind"], string> = { patrol: "POLICE PATROL", fari: "POLICE FARI", station: "POLICE STATION", volunteer: "VOLUNTEER", officer: "POLICE OFFICER" };

function RescueApp() {
  const d = useDemo();
  const session = useSession();
  // A real signed-in account skips the demo splash/login and must hold the
  // responder role; without a session the demo login flow stays available.
  if (session.user) {
    return (
      <AuthGate requireRole="responder" redirectTo="/RescueTeam">
        <Shell />
      </AuthGate>
    );
  }
  if (d.rescueAuth === "splash") return <Splash />;
  if (d.rescueAuth === "login") return <Login />;
  return <Shell />;
}

/* ---------------- Step 0: Tactical splash ---------------- */

function Splash() {
  const d = useDemo();
  return (
    <div className="dark relative grid min-h-screen place-items-center overflow-hidden bg-navy px-6 text-paper">
      <div aria-hidden className="pointer-events-none absolute inset-0 tactical-grid opacity-70" />
      <span aria-hidden className="absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald/15" />
      <span aria-hidden className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald/20" />
      <span aria-hidden className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald/25" />
      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <RescueMark label="" className="scale-[1.8]" />
        <p className="mt-8 font-display text-2xl font-extrabold tracking-wide">Rescue Network</p>
        <Slogan className="mt-1 text-xs text-paper/60" />
        <p className="mt-8 flex items-center gap-2 rounded-full bg-paper/5 px-4 py-2 font-mono text-[11px] text-emerald">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-blink" />
          Connecting to Central Dispatch & GPS Satellite…
        </p>
        <Button size="lg" className="mt-6 h-13 w-full rounded-lg text-base font-bold" onClick={() => d.set({ rescueAuth: "login" })}>
          <ShieldCheck /> Proceed to Responder Login
        </Button>
        <p className="mt-4 text-[11px] text-paper/40">NURJA Emergency Response & Women Safety Ecosystem</p>
      </div>
    </div>
  );
}

/* ---------------- Step 1: Responder login ---------------- */

const QUICK_LOGINS = [
  { label: "Type 1: Police Station / Fari (Fixed GPS)", icon: Building2, match: (r: Responder) => r.kind === "station" },
  { label: "Type 1: Patrolling Unit (Live GPS)", icon: Car, match: (r: Responder) => r.kind === "patrol" },
  { label: "Type 2: Volunteer (V-J75UN2)", icon: Shield, match: (r: Responder) => r.code === "V-J75UN2" },
  { label: "Type 2: Police Officer (TaskForce ID)", icon: BadgeCheck, match: (r: Responder) => r.kind === "officer" },
];

function Login() {
  const d = useDemo();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  const signInAs = (r: Responder | undefined) => {
    if (!r) { toast.error("No such account — create it in the Control Panel first"); return; }
    d.set({ responderType: isType1(r.kind) ? 1 : 2, responderId: r.id, rescueAuth: "app" });
    toast.success(`Signed in as ${r.name}`, { description: `${KIND_SHORT[r.kind]} · ${r.code}` });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw) { toast.error("Enter your password"); return; }
    const acc = findAccount(d.responders, id);
    if (!acc) { toast.error("Account not found", { description: "Check the ID / phone, or ask the Control Panel to issue an account." }); return; }
    signInAs(acc);
  };

  return (
    <div className="dark relative grid min-h-screen place-items-center overflow-hidden bg-navy px-4 py-10 text-paper">
      <div aria-hidden className="pointer-events-none absolute inset-0 tactical-grid opacity-60" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <RescueMark label="" className="scale-125" />
          <p className="mt-5 font-display text-xl font-extrabold">Rescue Network Login</p>
          <Slogan className="mt-1 text-[11px] text-paper/50" />
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-paper/10 bg-navy-3/80 p-6 shadow-2xl backdrop-blur">
          <div className="space-y-1.5">
            <Label className="text-paper/80">Duty phone / Unit code / Volunteer or TaskForce ID</Label>
            <Input required value={id} onChange={(e) => setId(e.target.value)} placeholder="01XXXXXXXXX · THANA-NRG-01 · V-J75UN2 · TF-9042" className="border-paper/15 bg-navy font-mono text-paper placeholder:text-paper/30" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-paper/80">Password</Label>
            <div className="relative">
              <Input required type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" className="border-paper/15 bg-navy pr-10 text-paper placeholder:text-paper/30" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/50 hover:text-paper" aria-label="Show password">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" size="lg" className="h-12 w-full rounded-lg text-base font-bold"><LogIn /> Sign in to Dispatch</Button>
          <a href="/auth?redirect=/RescueTeam"
            className="flex items-center justify-center gap-2 rounded-lg border border-emerald/40 bg-emerald/10 px-3 py-2.5 text-xs font-bold text-emerald transition hover:bg-emerald/20">
            <ShieldCheck className="h-4 w-4" /> Sign in with your NURJA account (phone + password)
          </a>
          <div className="space-y-2 pt-1">
            <p className="text-center text-[10px] font-bold uppercase tracking-wider text-paper/40">Quick demo login</p>
            <div className="grid gap-1.5">
              {QUICK_LOGINS.map((q) => (
                <button type="button" key={q.label} onClick={() => signInAs(d.responders.find(q.match))}
                  className="flex items-center gap-2.5 rounded-lg border border-paper/10 bg-paper/5 px-3 py-2.5 text-left text-xs font-semibold text-paper/80 transition hover:border-emerald/40 hover:bg-emerald/10 hover:text-paper">
                  <q.icon className="h-4 w-4 shrink-0 text-emerald" />{q.label}
                </button>
              ))}
            </div>
          </div>
          <p className="border-t border-paper/10 pt-3 text-center text-[11px] leading-relaxed text-paper/40">
            Accounts are issued and managed exclusively by the Central Control Panel (/rpanel).
          </p>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Authenticated shell (responsive) ---------------- */

function Shell() {
  const d = useDemo();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("map");
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<string | null>(null);
  const t1 = d.responderType === 1;
  const accounts = d.responders.filter((r) => (t1 ? isType1(r.kind) : !isType1(r.kind)));
  const mine = accounts.find((r) => r.id === d.responderId) ?? accounts[0];
  const myCode = mine?.code ?? "";
  const sos = d.sos && d.responderOnline && dismissed !== d.sos.id ? d.sos : null;
  const navigating = !!sos && (t1 || accepted === sos.id || sos.acceptedBy.includes(myCode));

  useEffect(() => { if (d.sos && t1 && myCode) d.acceptSos(myCode); }, [d.sos?.id, t1, myCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchType = (n: 1 | 2) => {
    const first = d.responders.find((r) => (n === 1 ? isType1(r.kind) : !isType1(r.kind)));
    d.set({ responderType: n, ...(first ? { responderId: first.id } : {}) });
  };
  const onSim = () => { setDismissed(null); setAccepted(null); if (!d.sos) d.triggerSos(); else toast("An SOS is already active"); };

  const alertCard = sos && !navigating && !t1 && (
    <SosAlertCard sosId={sos.id} victim={sos.victim} area={sos.area} onDecline={() => setDismissed(sos.id)} onAccept={() => { setAccepted(sos.id); d.acceptSos(myCode); toast.success("Accepted. Navigation started."); }} />
  );

  return (
    <div className="dark flex h-dvh overflow-hidden bg-background text-foreground">
      {/* Tablet rail / desktop sidebar */}
      <aside className="hidden w-20 shrink-0 flex-col bg-navy md:flex lg:w-72">
        <div className="flex h-16 items-center justify-center border-b border-paper/10 lg:justify-start lg:px-5">
          <RescueMark label="" />
          <div className="ml-3 hidden lg:block">
            <p className="font-display text-sm font-extrabold text-paper">Rescue Network</p>
            <p className="text-[10px] text-paper/50">{mine ? `${KIND_SHORT[mine.kind]} · ${mine.code}` : "No account"}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-2 lg:p-3">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} title={t.label}
              className={cn("flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition lg:justify-start",
                tab === t.id ? "bg-crimson text-paper" : "text-paper/60 hover:bg-paper/5 hover:text-paper")}>
              <t.icon className="h-5 w-5 shrink-0" /><span className="hidden lg:inline">{t.label}</span>
              {t.id === "map" && sos && <span className="hidden h-2 w-2 rounded-full bg-paper animate-blink lg:inline" />}
            </button>
          ))}
        </nav>
        <div className="hidden space-y-3 border-t border-paper/10 p-4 lg:block">
          <div className="rounded-xl bg-navy-3 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-paper/40">Unit status</p>
            <p className="mt-1 truncate text-sm font-bold text-paper">{mine?.name}</p>
            <p className="mt-0.5 text-[11px] text-paper/50">{mine?.fixed ? "📍 Fixed GPS installation" : "📡 Live device GPS"}{mine?.vehicleNo ? ` · ${mine.vehicleNo}` : ""}</p>
          </div>
          <Button variant="outline" className="w-full border-paper/15 bg-transparent text-paper/70 hover:bg-paper/5 hover:text-paper" onClick={() => d.set({ rescueAuth: "login" })}><LogOut /> Logout</Button>
        </div>
        <div className="border-t border-paper/10 p-2 lg:hidden">
          <button onClick={() => d.set({ rescueAuth: "login" })} title="Logout" className="grid w-full place-items-center rounded-xl py-2.5 text-paper/60 hover:bg-paper/5"><LogOut className="h-5 w-5" /></button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col pb-[calc(4rem+max(1rem,env(safe-area-inset-bottom)))] md:pb-0">
        {/* Mobile header */}
        <div className="shrink-0 bg-navy px-4 pb-3 pt-4 md:hidden">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-navy-3 p-1">
            {[1, 2].map((n) => (
              <button key={n} onClick={() => switchType(n as 1 | 2)}
                className={cn("rounded-lg px-2 py-1.5 text-[11px] font-bold leading-tight", d.responderType === n ? "bg-paper text-ink" : "text-paper/60")}>
                {n === 1 ? "Type 1 · Station / Fari / Patrol" : "Type 2 · Volunteer / Officer"}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <RescueMark label="" />
            <div className="min-w-0 flex-1">
              <Select value={mine?.id ?? ""} onValueChange={(id) => d.set({ responderId: id })}>
                <SelectTrigger className="h-auto border-0 bg-transparent p-0 font-display text-sm font-bold text-paper shadow-none focus:ring-0 [&>svg]:text-paper/60"><SelectValue placeholder="Pick an account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((r) => <SelectItem key={r.id} value={r.id}>{r.name} · {r.code}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className={cn("mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold", t1 ? "bg-crimson text-paper" : "bg-emerald text-paper")}>
                {mine ? `TYPE ${t1 ? "1" : "2"} · ${KIND_SHORT[mine.kind]} ${mine.code}` : "NO ACCOUNT"}
              </span>
              {mine && <span className={cn("ml-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold", mine.fixed ? "bg-paper/15 text-paper" : "bg-crimson/60 text-paper")}>{mine.fixed ? "📍 FIXED GPS" : "📡 LIVE GPS"}</span>}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
          {tab === "map" && (
            <div className="flex min-h-full shrink-0 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="flex min-w-0 flex-col">
                {navigating ? <Navigate type1={t1} myCode={myCode} /> : <DispatchHome mine={mine} onSim={onSim} />}
                {d.sos && <div className="px-4 pb-4 lg:hidden"><VictimCamera camera={d.sos.camera} /></div>}
              </div>
              <SidePanel alert={alertCard} navigating={navigating} />
            </div>
          )}
          {tab === "community" && <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-start gap-4 p-4 md:grid-cols-2">{d.posts.filter((p) => p.targets.rescue && p.published !== false).map((p) => <PostCard key={p.id} post={p} compact dark />)}</div>}
          {tab === "history" && <div className="mx-auto w-full max-w-2xl"><HistoryTab /></div>}
          {tab === "profile" && <div className="mx-auto w-full max-w-2xl"><ProfileT type1={t1} mine={mine} /></div>}

          {/* Mobile / tablet incoming alert overlay */}
          {alertCard && <div className="absolute inset-x-3 top-3 z-30 lg:hidden">{alertCard}</div>}
        </div>

        {/* Mobile bottom nav — fixed, glass, safe-area aware */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-paper/10 bg-navy/95 px-2 pt-2 shadow-lg backdrop-blur-md md:hidden pb-[max(1rem,env(safe-area-inset-bottom))]">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex flex-col items-center gap-1 py-1.5 text-[10px] font-semibold", tab === t.id ? "text-crimson" : "text-paper/50")}>
              <t.icon className="h-5 w-5" />{t.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

/* ---------------- Incoming SOS alert card (shared) ---------------- */

function SosAlertCard({ sosId, victim, area, onDecline, onAccept }: { sosId: string; victim: string; area: string; onDecline: () => void; onAccept: () => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-crimson bg-card shadow-2xl animate-rise">
      <div className="flex items-center gap-2 bg-crimson px-4 py-2.5 text-paper"><Siren className="h-4 w-4 animate-blink" /><p className="flex-1 text-xs font-extrabold uppercase tracking-wider">Incoming SOS alert</p><span className="font-mono text-[11px]">{sosId}</span></div>
      <div className="space-y-3 p-4">
        <div className="flex items-end justify-between">
          <div><p className="text-xs text-muted-foreground">Victim distance</p><p className="font-display text-4xl font-extrabold text-crimson">0.8 km away</p></div>
          <p className="text-right text-xs text-muted-foreground">~3 min<br />on foot 9 min</p>
        </div>
        <p className="text-sm"><b>{victim.split(" ")[0]}</b> · {area}</p>
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <Button variant="outline" className="h-12 rounded-lg" onClick={onDecline}><X /> Decline</Button>
          <Button className="h-12 rounded-lg bg-emerald text-base font-bold hover:bg-emerald/90" onClick={onAccept}>Accept / Respond</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Desktop right panel ---------------- */

function SidePanel({ alert, navigating }: { alert: React.ReactNode; navigating: boolean }) {
  const d = useDemo();
  const sos = d.sos;
  const units = useNetworkUnits(sos?.startedAt, sos?.acceptedBy ?? [], d.responders);
  const enRoute = units.filter((u) => u.kind !== "volunteer").slice(0, 4);
  return (
    <aside className="hidden border-l bg-card/50 lg:flex lg:flex-col lg:gap-4 lg:overflow-y-auto lg:p-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Live SOS alert queue</p>
        {alert ?? (sos ? (
          <div className="rounded-2xl border border-crimson/40 bg-crimson-soft p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-crimson"><Siren className="h-4 w-4 animate-blink" /> {sos.id} — dispatch in progress</p>
            <p className="mt-1 text-xs text-muted-foreground">{sos.victim} · {sos.area}</p>
            <p className="mt-1 text-xs text-muted-foreground">{sos.acceptedBy.length} responders accepted{navigating ? " · you are en route" : ""}</p>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">No active alerts. The queue updates in real time when a user triggers SOS.</div>
        ))}
      </div>
      {sos && (
        <>
          <VictimCamera camera={sos.camera} />
          <div className="rounded-2xl border bg-card p-4 text-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Victim & emergency contact</p>
            <p className="font-bold">{sos.victim}</p>
            <p className="font-mono text-xs text-muted-foreground">{sos.phone}</p>
            <p className="mt-2 text-xs text-muted-foreground">Emergency: <b className="text-foreground">{d.user.emergencyName}</b> ({d.user.relation}) · <span className="font-mono">{d.user.emergencyPhone}</span></p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Dispatch telemetry</p>
            <div className="space-y-1.5">
              {enRoute.map((u) => (
                <p key={u.id} className="flex items-center justify-between text-xs"><span className="truncate">{u.label}</span><span className="font-mono font-bold text-emerald">{u.eta} min</span></p>
              ))}
            </div>
            <p className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">2 patrols · 1 fari · 1 station auto-dispatched · {units.filter((u) => u.kind === "volunteer").length} volunteers alerted</p>
          </div>
        </>
      )}
    </aside>
  );
}

/* ---------------- Tabs ---------------- */

function DispatchHome({ onSim, mine }: { onSim: () => void; mine: Responder | undefined }) {
  const d = useDemo();
  const online = d.responders.filter((r) => r.online);
  const others = d.responders.filter((r) => r.id !== mine?.id && r.x !== undefined).map((r) => ({ id: r.id, label: r.name, kind: r.kind, x: r.x!, y: r.y!, gps: (r.fixed ? "fixed" : "live") as "fixed" | "live" }));
  return (
    <div className="relative flex flex-1 flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-0 tactical-grid opacity-60" />
      <LiveMapLazy className="relative h-72 tactical-grid shadow-card lg:h-full lg:min-h-[420px]" zones={d.zones} units={[...others, { id: "me", label: "You", kind: mine?.kind ?? (d.responderType === 1 ? "patrol" : "volunteer"), x: mine?.x ?? 30, y: mine?.y ?? 34, gps: mine?.fixed ? "fixed" : "live" }]} />
      <div className="relative space-y-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          {[{ l: "Units online", v: online.length }, { l: "Active SOS", v: d.sos ? 1 : 0 }, { l: "My cases", v: d.cases.length }].map((s) => (
            <div key={s.l} className="rounded-2xl border border-t-2 border-t-crimson/70 bg-card p-3 shadow-card"><p className="font-display text-2xl font-extrabold">{s.v}</p><p className="text-[10px] text-muted-foreground">{s.l}</p></div>
          ))}
        </div>
        <div className={cn("rounded-2xl border p-4", d.responderOnline ? "border-emerald/30 bg-emerald-soft" : "bg-card")}>
          <p className="flex items-center gap-2 text-sm font-bold"><Radio className={cn("h-4 w-4", d.responderOnline && "animate-blink text-emerald")} /> {d.responderOnline ? "Standing by for alerts" : "Go online to receive alerts"}</p>
          <p className="mt-1 text-xs text-muted-foreground">Area: Motijheel · Radius 3 km</p>
        </div>
        <Button size="lg" className="h-14 w-full rounded-lg text-base font-bold" disabled={!d.responderOnline} onClick={onSim}>
          <Siren /> Simulate Incoming SOS Alert
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">Or trigger SOS from the NURJA app — it shows up here live.</p>
      </div>
    </div>
  );
}

function Navigate({ type1, myCode }: { type1: boolean; myCode: string }) {
  const d = useDemo();
  const now = useNow();
  const sos = d.sos;
  const units = useNetworkUnits(sos?.startedAt, sos?.acceptedBy ?? [], d.responders);
  if (!sos) return null;
  const arrived = sos.arrivedBy?.some((r) => r.code === myCode) ?? false;
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
        <div className="min-w-0 flex-1"><p className="truncate font-display text-lg font-bold leading-tight">{S.t}</p><p className="truncate text-xs opacity-80">then {steps[Math.min(2, cur + 1)]!.t.toLowerCase()}</p></div>
        <p className="shrink-0 font-display text-xl font-extrabold">{S.d}</p>
      </div>
      <div className="relative">
        <LiveMapLazy className="h-64 tactical-grid lg:h-full lg:min-h-[380px]" victim={VICTIM_POS} route={ROUTE_TO_VICTIM} units={units.filter((u) => u.kind !== "volunteer" || u.id === "v0")} zones={d.zones} />
        <div className="absolute bottom-3 left-3 rounded-xl bg-navy/90 px-3 py-2 text-paper">
          <p className="text-[10px] uppercase opacity-60">Distance to victim</p>
          <p className="font-display text-xl font-extrabold">{dist} km · {Math.max(0, Math.ceil(3 * (1 - progress)))} min</p>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="rounded-2xl border bg-card p-3.5">
          <p className="text-xs text-muted-foreground">Victim</p>
          <p className="font-bold">{sos.victim} · {sos.area}</p>
          <p className="mt-1 text-xs text-muted-foreground">{sos.acceptedBy.length} responders accepted · 2 patrols, 1 fari, 1 station dispatched</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-12 rounded-lg" onClick={() => toast("Calling control room…")}><Phone /> Control room</Button>
          <Button className="h-12 rounded-lg bg-emerald hover:bg-emerald/90" disabled={arrived || !sos.acceptedBy.includes(myCode)} onClick={() => { d.markArrived(myCode); toast.success("Arrival recorded. SOS remains active."); }}><Navigation /> {arrived ? "Arrived" : "Mark arrived"}</Button>
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
          <IncidentEvidenceGallery incidentId={c.id} />
          <div className="mt-2 flex items-center justify-between text-xs"><span className={cn("rounded-full px-2 py-0.5 font-semibold", c.outcome.startsWith("False") ? "bg-amber-soft text-amber" : "bg-emerald-soft text-emerald")}>{c.outcome}</span><span className="text-muted-foreground">Duration {c.duration}</span></div>
        </div>
      ))}
    </div>
  );
}

function ProfileT({ type1, mine }: { type1: boolean; mine: Responder | undefined }) {
  const d = useDemo();
  const { tr } = useT();
  const approved = d.volunteerApps.filter((a) => a.status === "approved");
  const initials = mine ? mine.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  return (
    <div className="space-y-3 p-4">
      <div className="rounded-3xl border bg-card p-5 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-navy-3 font-display text-2xl font-extrabold">{initials}</div>
        <p className="mt-3 font-display text-lg font-bold">{mine?.name ?? "No account selected"}</p>
        <p className="text-sm text-muted-foreground">{mine ? `${KIND_SHORT[mine.kind]} · ${mine.area}` : ""}{mine?.rank ? ` · ${mine.rank}` : ""}</p>
        {mine && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-soft px-3 py-1 text-xs font-bold text-emerald"><BadgeCheck className="h-3.5 w-3.5" /> {mine.kind === "volunteer" ? `Volunteer ID ${mine.code}` : mine.kind === "officer" ? `TaskForce ID ${mine.code}` : `Unit code ${mine.code}`}</span>}
        {mine && <p className="mt-2 text-xs text-muted-foreground">{mine.fixed ? "📍 Fixed GPS installation — position set by Control Panel" : "📡 Live device GPS while Online"}{mine.station ? ` · ${mine.station}` : ""}{mine.vehicleNo ? ` · ${mine.vehicleNo}` : ""}</p>}
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
      <div className="rounded-2xl border bg-card p-4">
        <p className="mb-3 text-xs font-bold uppercase text-muted-foreground">{tr("Settings", "সেটিংস")}</p>
        <label className={cn("mb-4 flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-bold", d.responderOnline ? "bg-emerald/15 text-emerald" : "bg-paper/5 text-paper/60")}>
          <span className="flex items-center gap-2"><Radio className="h-4 w-4 shrink-0" />{d.responderOnline ? "Online — receiving alerts" : "Offline"}</span>
          <Switch aria-label={tr("Online", "অনলাইন")} checked={d.responderOnline} onCheckedChange={(v) => { d.set({ responderOnline: v }); toast(v ? "You're online and receiving alerts" : "You're offline"); }} className="shrink-0 data-[state=checked]:bg-emerald" />
        </label>
        <LanguageSetting dark />
      </div>
      <Button variant="outline" className="w-full border-crimson/40 text-crimson hover:bg-crimson/10" onClick={() => { d.set({ rescueAuth: "login" }); toast("Signed out"); }}>
        <LogOut /> {tr("Logout", "লগআউট")}
      </Button>
    </div>
  );
}
