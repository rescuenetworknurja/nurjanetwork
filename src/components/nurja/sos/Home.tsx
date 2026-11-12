import { useEffect, useRef, useState } from "react";
import { Bell, Building2, Car, Lock, MapPin, MessageSquare, Navigation, Radio, ShieldAlert, ShieldCheck, Siren, User, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { DISPATCH_UNITS, VICTIM_POS, VOLUNTEER_POS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { CameraFeed } from "../CameraFeed";
import { TacticalMap, type MapUnit } from "../TacticalMap";
import { PinInput, PwaBadge } from "./ui";

export function useNow(ms = 1000) {
  const [n, setN] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setN(Date.now()), ms); return () => clearInterval(i); }, [ms]);
  return n;
}

/** Responder positions converge on the victim over ~90 seconds. */
export function useConvergingUnits(startedAt: number | undefined, accepted: string[] = []) {
  const now = useNow(1000);
  const t = startedAt ? Math.min(1, (now - startedAt) / 90000) : 0;
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  const units: (MapUnit & { dist: number })[] = [
    ...DISPATCH_UNITS.map((u) => ({ ...u, x: lerp(u.x, VICTIM_POS.x, t * 0.85), y: lerp(u.y, VICTIM_POS.y, t * 0.85), eta: Math.max(0, Math.ceil(u.eta * (1 - t))), dist: +(u.dist * (1 - t * 0.85)).toFixed(1) })),
    ...VOLUNTEER_POS.map((v, i) => {
      const k = i < 3 || accepted.includes(v.label) ? t * 0.9 : t * 0.2;
      return { ...v, kind: "volunteer" as const, x: lerp(v.x, VICTIM_POS.x, k), y: lerp(v.y, VICTIM_POS.y, k), eta: Math.max(0, Math.ceil(v.eta * (1 - k))), dist: +(v.dist * (1 - k)).toFixed(1) };
    }),
  ];
  return units;
}

export function HomeTab() {
  const d = useDemo();
  const [count, setCount] = useState<number | null>(null);
  const locked = d.selfKyc !== "approved";

  useEffect(() => {
    if (count === null) return;
    if (count === 0) { d.triggerSos(); setCount(null); return; }
    const t = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(t);
  }, [count]); // eslint-disable-line react-hooks/exhaustive-deps

  if (d.sos) return <ActiveSos />;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 pb-3 pt-12">
        <div>
          <p className="text-xs text-muted-foreground">Assalamu alaikum,</p>
          <p className="font-display text-lg font-bold">{d.user.name.split(" ")[0]}</p>
        </div>
        <button className="relative grid h-10 w-10 place-items-center rounded-full bg-muted"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-crimson" /></button>
      </header>
      <div className="px-5">
        <button onClick={() => d.setSelfKyc(locked ? "approved" : "pending")}
          className={cn("flex w-full items-center gap-3 rounded-2xl p-3 text-left transition", locked ? "bg-amber-soft" : "bg-emerald-soft")}>
          <div className={cn("grid h-9 w-9 place-items-center rounded-full text-paper", locked ? "bg-amber" : "bg-emerald")}>{locked ? <Lock className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}</div>
          <div className="flex-1">
            <p className="text-sm font-bold">{locked ? "KYC Pending — SOS Locked" : "KYC Approved — SOS Active"}</p>
            <p className="text-[11px] text-muted-foreground">{locked ? "Waiting for Control Panel review" : `${d.user.adult ? "Adult 18+" : "Under 18 Minor"} profile verified`}</p>
          </div>
          <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-bold text-muted-foreground">Demo toggle</span>
        </button>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center py-6">
        <div className="relative grid h-[260px] w-[260px] place-items-center">
          {!locked && <>
            <span className="absolute h-[180px] w-[180px] rounded-full bg-crimson/30 animate-ripple" />
            <span className="absolute h-[180px] w-[180px] rounded-full bg-crimson/30 animate-ripple [animation-delay:.8s]" />
            <span className="absolute h-[180px] w-[180px] rounded-full bg-crimson/30 animate-ripple [animation-delay:1.6s]" />
          </>}
          <button
            onClick={() => (locked ? toast.warning("SOS is locked until your KYC is approved", { description: "Call 999 in an emergency." }) : setCount(3))}
            className={cn("relative grid h-[180px] w-[180px] place-items-center rounded-full border-[6px] border-paper text-paper transition active:scale-95",
              locked ? "bg-muted-foreground/40 grayscale" : "bg-sos shadow-sos animate-breathe")}>
            <div className="text-center">
              {locked ? <Lock className="mx-auto h-10 w-10" /> : <Siren className="mx-auto h-9 w-9" />}
              <p className="font-display text-4xl font-extrabold tracking-wider">SOS</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{locked ? "Locked" : "Tap for help"}</p>
            </div>
          </button>
        </div>
        <p className="mt-2 max-w-[260px] text-center text-xs text-muted-foreground">Tapping starts a 3-second countdown, then alerts police and volunteers near you.</p>
      </div>

      <div className="space-y-3 px-5 pb-4">
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-card">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-crimson"><MapPin className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">Toyenbee Circular Rd, Motijheel, Dhaka</p>
            <p className="font-mono text-[11px] text-muted-foreground">23.7330° N, 90.4172° E · ±6 m</p>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald"><span className="h-1.5 w-1.5 rounded-full bg-emerald animate-blink" />GPS</span>
        </div>
        <div className="flex justify-center"><PwaBadge compact /></div>
      </div>

      {count !== null && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-crimson text-paper">
          <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-80">Sending SOS in</p>
          <div className="relative my-8 grid h-56 w-56 place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="4" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="var(--amber)" strokeWidth="4" strokeLinecap="round" strokeDasharray={289} strokeDashoffset={289 * (1 - count / 3)} className="transition-all duration-1000 ease-linear" />
            </svg>
            <span key={count} className="font-display text-[120px] font-extrabold leading-none animate-count">{count}</span>
          </div>
          <p className="max-w-[260px] text-center text-sm opacity-80">Nearest police and volunteers will be alerted with your live location and camera.</p>
          <Button variant="outline" size="lg" className="mt-10 h-14 w-56 rounded-full border-paper bg-transparent text-lg text-paper hover:bg-paper hover:text-crimson" onClick={() => setCount(null)}>
            <X /> Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

function ActiveSos() {
  const d = useDemo();
  const sos = d.sos!;
  const units = useConvergingUnits(sos.startedAt, sos.acceptedBy);
  const now = useNow(1000);
  const secs = Math.floor((now - sos.startedAt) / 1000);
  const [hold, setHold] = useState(0);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHold = () => {
    if (timer.current) return;
    const start = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 3000) * 100);
      setHold(p);
      if (p >= 100) { endHold(); setPinOpen(true); }
    }, 30);
  };
  const endHold = () => { if (timer.current) clearInterval(timer.current); timer.current = null; setHold(0); };

  const submitPin = (v: string) => {
    setPin(v);
    if (v.length < 6) return;
    if (v === d.user.pin) { d.stopSos("Rescued safely — SOS stopped with PIN"); setPinOpen(false); toast.success("SOS deactivated", { description: "Evidence has been archived. Stay safe." }); }
    else { toast.error("Wrong PIN. SOS is still active."); setTimeout(() => setPin(""), 300); }
  };

  const police = units.filter((u) => u.kind !== "volunteer");
  const vols = units.filter((u) => u.kind === "volunteer").sort((a, b) => a.dist - b.dist).slice(0, 4);
  const KIcon = { patrol: Car, fari: Siren, station: Building2 } as const;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto pb-4">
      <div className="flex items-center gap-2 bg-crimson px-5 pb-3 pt-11 text-paper animate-flash">
        <Radio className="h-5 w-5 animate-blink" />
        <div className="flex-1">
          <p className="font-display text-sm font-extrabold uppercase tracking-wider">SOS Active · Broadcasting</p>
          <p className="text-[11px] opacity-80">{sos.id} · {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}</p>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="relative">
          <CameraFeed camera={sos.camera} className="aspect-video" />
          <span className="absolute bottom-9 left-3 right-3 rounded-lg bg-crimson/90 px-2 py-1 text-[10px] font-bold text-paper">
            LIVE STREAMING ({sos.camera === "back" ? "Back" : "Front"} Camera) + Saving Offline Video Chunks
          </span>
        </div>

        <div className="rounded-2xl border border-crimson/30 bg-crimson-soft p-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-crimson"><ShieldAlert className="h-3.5 w-3.5" /> Alert dispatch status</p>
          <p className="mt-1 text-sm font-semibold leading-snug">Alerted Nearest 2 Patrol Units, 1 Police Fari, 1 Police Station, 10 Volunteers + Sent SOS SMS to 5 Nearest Devices</p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground"><MessageSquare className="h-3 w-3" /> SMS with live link sent to {d.user.relation} ({d.user.emergencyPhone})</p>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
          <TacticalMap className="h-56" victim={VICTIM_POS} units={units} />
          <div className="divide-y">
            <p className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Incoming responders</p>
            {police.map((u) => { const I = KIcon[u.kind as keyof typeof KIcon] ?? Car; return (
              <Row key={u.id} icon={<I className="h-4 w-4" />} tone="bg-navy" title={u.label} sub={`${u.dist} km away`} eta={u.eta} />
            ); })}
            {vols.map((u) => <Row key={u.id} icon={<User className="h-4 w-4" />} tone="bg-emerald" title={`Volunteer ${u.label}`} sub={`${u.dist} km · ${sos.acceptedBy.includes(u.label) ? "Accepted" : "Responding"}`} eta={u.eta} />)}
          </div>
        </div>

        <div className="pt-2">
          <button
            onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onContextMenu={(e) => e.preventDefault()}
            className="relative mx-auto flex h-16 w-full select-none items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-ink text-paper touch-none">
            <span className="absolute inset-y-0 left-0 bg-crimson transition-[width] duration-75" style={{ width: `${hold}%` }} />
            <span className="relative flex items-center gap-3 font-display text-sm font-extrabold tracking-wide">
              <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={94} strokeDashoffset={94 * (1 - hold / 100)} strokeLinecap="round" />
              </svg>
              HOLD 3-5 SECONDS TO STOP SOS
            </span>
          </button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Your Security PIN will be required. Demo PIN: {d.user.pin}</p>
        </div>
      </div>

      <Dialog open={pinOpen} onOpenChange={(o) => { setPinOpen(o); setPin(""); }}>
        <DialogContent className="max-w-[360px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-center text-xl">Enter Security PIN</DialogTitle>
            <DialogDescription className="text-center">Enter your 6-digit PIN to deactivate SOS. Responders will be told you're safe.</DialogDescription>
          </DialogHeader>
          <PinInput value={pin} onChange={submitPin} autoFocus />
          <p className="text-center text-xs text-muted-foreground"><Navigation className="mr-1 inline h-3 w-3" />Responders keep moving until the PIN is confirmed.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ icon, tone, title, sub, eta }: { icon: React.ReactNode; tone: string; title: string; sub: string; eta?: number }) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <div className={cn("grid h-8 w-8 place-items-center rounded-full text-paper", tone)}>{icon}</div>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{title}</p><p className="text-[11px] text-muted-foreground">{sub}</p></div>
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold tabular-nums">{eta === 0 ? "Arrived" : `${eta} min`}</span>
    </div>
  );
}
