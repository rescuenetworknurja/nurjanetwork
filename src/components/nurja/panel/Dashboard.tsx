import { Activity, Car, Download, FileCheck2, RefreshCw, Siren, SwitchCamera, Users, Building2, User, Clock, Route as RouteIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { VICTIM_POS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { TacticalMap } from "../TacticalMap";
import { CameraFeed } from "../CameraFeed";
import { useNetworkUnits, useNow } from "../sos/Home";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border bg-card p-5 shadow-card", className)}>{children}</div>;
}
export function PageHead({ title, sub, children }: { title: string; sub: string; children?: React.ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-extrabold">{title}</h1><p className="text-sm text-muted-foreground">{sub}</p></div>{children}</div>;
}

export function DashboardSection({ go }: { go: (s: string) => void }) {
  const d = useDemo();
  const units = useNetworkUnits(d.sos?.startedAt, d.sos?.acceptedBy, d.responders);
  const kpis = [
    { l: "Active SOS Alerts", v: d.sos ? 1 : 0, i: Siren, tone: "bg-crimson", hot: !!d.sos },
    { l: "Online Patrol Units", v: d.responders.filter((r) => r.online && ["patrol", "fari", "station"].includes(r.kind)).length + 38, i: Car, tone: "bg-navy-3" },
    { l: "Active Volunteers", v: d.responders.filter((r) => r.online && r.kind === "volunteer").length + 412, i: Users, tone: "bg-emerald" },
    { l: "Pending KYCs", v: d.kyc.filter((k) => k.status === "pending").length, i: FileCheck2, tone: "bg-amber" },
  ];
  return (
    <>
      <PageHead title="Command Dashboard" sub="Dhaka & Narayanganj · live overview" />
      {d.sos && (
        <button onClick={() => go("incident")} className="mb-5 flex w-full items-center gap-3 rounded-lg p-4 text-left text-paper animate-flash">
          <Siren className="h-6 w-6 animate-blink" />
          <div className="flex-1"><p className="font-display font-extrabold">LIVE SOS — {d.sos.victim} · {d.sos.area}</p><p className="text-xs opacity-80">{d.sos.id} · {d.sos.acceptedBy.length} responders accepted · click to open dispatch center</p></div>
          <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-crimson">Open</span>
        </button>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.l} className={cn(k.hot && "border-crimson")}>
            <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{k.l}</p><span className={cn("grid h-9 w-9 place-items-center rounded-xl text-paper", k.tone)}><k.i className="h-4 w-4" /></span></div>
            <p className={cn("mt-3 font-display text-4xl font-extrabold tabular-nums", k.hot && "text-crimson")}>{k.v}</p>
          </Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between p-4"><p className="font-display font-bold">Live overview map</p><span className="flex items-center gap-1.5 text-xs text-emerald"><span className="h-2 w-2 rounded-full bg-emerald animate-blink" />Realtime</span></div>
          <TacticalMap className="h-[420px]" zones={d.zones} victim={d.sos ? VICTIM_POS : undefined} units={units} />
        </Card>
        <Card>
          <p className="font-display font-bold">Activity feed</p>
          <ul className="mt-3 space-y-3 text-sm">
            {[
              d.sos && { i: Siren, c: "text-crimson", t: `SOS ${d.sos.id} triggered by ${d.sos.victim}`, at: "now" },
              ...d.volunteerApps.filter((a) => a.status === "pending").slice(0, 2).map((a) => ({ i: Users, c: "text-amber", t: `Volunteer application: ${a.name}`, at: a.submittedAt })),
              ...d.kyc.filter((k) => k.status === "pending").slice(0, 3).map((k) => ({ i: FileCheck2, c: "text-amber", t: `KYC submitted: ${k.name} (${k.type === "adult" ? "18+" : "Under 18"})`, at: k.submittedAt })),
              ...d.cases.slice(0, 2).map((c) => ({ i: Activity, c: "text-emerald", t: `${c.id}: ${c.outcome}`, at: c.date })),
            ].filter(Boolean).map((e, i) => { const x = e as { i: typeof Siren; c: string; t: string; at: string }; return (
              <li key={i} className="flex gap-3"><x.i className={cn("mt-0.5 h-4 w-4 shrink-0", x.c)} /><div className="flex-1"><p>{x.t}</p><p className="text-xs text-muted-foreground">{x.at}</p></div></li>
            ); })}
          </ul>
        </Card>
      </div>
    </>
  );
}

export function IncidentSection() {
  const d = useDemo();
  const units = useNetworkUnits(d.sos?.startedAt, d.sos?.acceptedBy, d.responders);
  const now = useNow();
  if (!d.sos)
    return (
      <>
        <PageHead title="Live Incident & Dispatch Center" sub="No active SOS right now" />
        <Card className="grid place-items-center py-24 text-center">
          <Siren className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-display text-lg font-bold">All quiet</p>
          <p className="max-w-sm text-sm text-muted-foreground">Trigger SOS from the NURJA app (or the demo switcher) and it appears here instantly.</p>
          <Button className="mt-5" onClick={d.triggerSos}><Siren /> Start a test SOS</Button>
        </Card>
      </>
    );
  const s = d.sos;
  const secs = Math.floor((now - s.startedAt) / 1000);
  const police = units.filter((u) => u.kind !== "volunteer");
  const vols = units.filter((u) => u.kind === "volunteer");
  const dl = (what: string) => toast.success(`${what} prepared`, { description: `${s.id} · download will start when storage is connected` });
  return (
    <>
      <PageHead title="Live Incident & Dispatch Center" sub={`${s.id} · ${s.victim} · ${s.phone}`}>
        <span className="flex items-center gap-2 rounded-full bg-crimson px-3 py-1.5 text-sm font-bold text-paper"><span className="h-2 w-2 rounded-full bg-paper animate-blink" />LIVE {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}</span>
      </PageHead>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden p-0">
          <TacticalMap className="h-[520px]" victim={{ x: 50, y: 50 }} units={units} zones={d.zones} />
          <div className="grid grid-cols-5 gap-px border-t bg-border text-center text-xs">
            {[{ l: "Patrol", v: 2, i: Car }, { l: "Fari", v: 1, i: Siren }, { l: "Station", v: 1, i: Building2 }, { l: "Volunteers", v: 10, i: User }, { l: "SMS sent", v: 5, i: Activity }].map((x) => (
              <div key={x.l} className="bg-card p-3"><x.i className="mx-auto h-4 w-4 text-muted-foreground" /><p className="font-display text-lg font-extrabold">{x.v}</p><p className="text-muted-foreground">{x.l}</p></div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-3">
            <CameraFeed camera={s.camera} className="aspect-video" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="lg" className="flex-1" onClick={() => { d.switchCamera(); toast(`Victim camera switched to ${s.camera === "back" ? "front" : "back"}`); }}>
                <SwitchCamera /> Switch Victim Camera (Front ↔ Back)
              </Button>
              <Button size="lg" variant="outline" onClick={() => toast("Stream reconnected")}><RefreshCw /></Button>
            </div>
          </Card>
          <Card>
            <p className="flex items-center gap-2 font-display font-bold"><RouteIcon className="h-4 w-4" /> Live route summary</p>
            <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div><dt className="text-muted-foreground">Location</dt><dd className="font-semibold">Motijheel</dd></div>
              <div><dt className="text-muted-foreground">Moved</dt><dd className="font-semibold">{Math.min(420, secs * 2)} m</dd></div>
              <div><dt className="text-muted-foreground">Nearest ETA</dt><dd className="font-semibold">{Math.min(...police.map((p) => p.eta ?? 0))} min</dd></div>
            </dl>
            <div className="mt-4 max-h-44 space-y-1.5 overflow-y-auto text-sm">
              {[...police, ...vols.slice(0, 4)].map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-1.5">
                  <span className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", u.kind === "volunteer" ? "bg-emerald" : "bg-amber")} />{u.label}{s.acceptedBy.includes(u.label) && <span className="text-[10px] font-bold text-emerald">ACCEPTED</span>}</span>
                  <span className="flex items-center gap-1 tabular-nums text-muted-foreground"><Clock className="h-3 w-3" />{u.eta === 0 ? "On scene" : `${u.eta} min · ${u.dist} km`}</span>
                </div>
              ))}
            </div>
            {(s.arrivedBy ?? []).map((arrival) => (
              <div key={arrival.code} className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-soft px-3 py-2 text-sm">
                <span className="font-semibold">{d.responders.find((r) => r.code === arrival.code)?.name ?? arrival.code} · {arrival.code}</span>
                <span className="text-emerald">Arrived · {new Date(arrival.arrivedAt).toLocaleTimeString(d.lang === "bn" ? "bn-BD" : "en-GB")}</span>
              </div>
            ))}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => dl("Evidence video")}><Download /> Download Evidence Video</Button>
              <Button variant="outline" onClick={() => dl("Route summary")}><Download /> Download Route Summary</Button>
            </div>
            <Button className="mt-3 w-full bg-emerald hover:bg-emerald/90" onClick={() => { d.markRescued(); toast.success("Marked as rescued. Case archived."); }}>Mark rescued</Button>
            <Button variant="ghost" className="mt-2 w-full text-muted-foreground" onClick={() => { d.stopSos("Closed by control room"); toast.success("Incident closed and archived"); }}>Close incident</Button>
          </Card>
        </div>
      </div>
    </>
  );
}
