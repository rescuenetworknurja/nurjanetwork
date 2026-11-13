import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { listBriefings, postBriefing, type Briefing } from "@/lib/live.functions";
import { useDemo } from "@/lib/demo-store";
import { fmtCoord, parseCoordPair } from "@/lib/geo";
import { toLatLng, toXY, CHASHARA_CENTER } from "@/lib/geo-map";
import { cn } from "@/lib/utils";
import { LiveMapLazy } from "./LiveMapLazy";

const PRIORITY = { high: "High priority", medium: "Medium priority", low: "Low priority" } as const;
const tone = (p: Briefing["priority"]) => p === "high" ? "bg-crimson text-paper" : p === "medium" ? "bg-amber-soft text-amber" : "bg-emerald-soft text-emerald";
const briefingsKey = (id: string) => ["briefings", id] as const;

export function useBriefings(incidentId: string | undefined) {
  return useQuery({ queryKey: briefingsKey(incidentId ?? ""), queryFn: () => listBriefings({ data: { incidentId: incidentId! } }), enabled: !!incidentId, refetchInterval: 10000 });
}

function BriefingCard({ b, showMap }: { b: Briefing; showMap?: boolean }) {
  return (
    <div className="space-y-2 rounded-xl border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", tone(b.priority))}>{PRIORITY[b.priority]}</span>
        <span className="text-[11px] text-muted-foreground">{new Date(b.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <p className="font-bold">{b.summary}</p>
      {b.notes && <p className="whitespace-pre-line text-sm text-muted-foreground">{b.notes}</p>}
      {b.lat !== null && b.lng !== null && (
        <>
          <a className="flex items-center gap-1 text-xs font-semibold text-crimson underline" href={`https://www.google.com/maps?q=${b.lat},${b.lng}`} target="_blank" rel="noreferrer"><MapPin className="h-3.5 w-3.5" />{b.label || `${fmtCoord(b.lat)}, ${fmtCoord(b.lng)}`}</a>
          {showMap && <LiveMapLazy center={[b.lat, b.lng]} className="h-40 rounded-lg border" units={[{ id: "brief", label: b.label || "Briefing point", kind: "station", ...toXY(b.lat, b.lng), gps: "fixed" }]} focusPoint={[b.lat, b.lng]} />}
        </>
      )}
    </div>
  );
}

/** Control Panel: write a short briefing and pick a map point for responders on the selected incident. */
export function BriefingComposer({ incidentId, victim }: { incidentId: string; victim?: [number, number] | undefined }) {
  const d = useDemo();
  const qc = useQueryClient();
  const list = useBriefings(incidentId);
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Briefing["priority"]>("high");
  const [point, setPoint] = useState<[number, number] | null>(null);
  const [label, setLabel] = useState("");
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const search = async () => {
    const pair = parseCoordPair(q);
    if (pair) { setPoint([pair.lat, pair.lng]); setLabel(""); return; }
    if (q.trim().length < 2) return;
    setSearching(true);
    try {
      const { findPlace } = await import("@/lib/place-search");
      const r = await findPlace(q, victim);
      if (!r) { toast.error("Place not found"); return; }
      setPoint(r.point); setLabel(r.label);
    } catch (e) { toast.error(e instanceof Error && e.message ? e.message : "Search failed. Try again."); } finally { setSearching(false); }
  };
  const send = useMutation({
    mutationFn: () => postBriefing({ data: { incidentId, summary, notes, priority, lat: point?.[0] ?? null, lng: point?.[1] ?? null, label } }),
    onSuccess: () => { toast.success("Briefing sent to responders"); setSummary(""); setNotes(""); void qc.invalidateQueries({ queryKey: briefingsKey(incidentId) }); },
    onError: (e) => toast.error("Briefing could not be sent", { description: e instanceof Error ? e.message : undefined }),
  });
  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 font-display font-bold"><ClipboardList className="h-4 w-4" /> Responder briefing</p>
      <Input maxLength={280} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One-line summary (e.g. Victim moving north on Chashara road, suspect in blue shirt)" />
      <Textarea maxLength={2000} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Details: landmarks, hazards, what to do on arrival" />
      <div className="flex flex-wrap gap-2">{(["high", "medium", "low"] as const).map((p) => <Button key={p} type="button" size="sm" variant={priority === p ? "default" : "outline"} onClick={() => setPriority(p)}>{PRIORITY[p]}</Button>)}</div>
      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void search(); } }} placeholder="Search a place or paste coordinates" />
        <Button type="button" variant="outline" disabled={searching} onClick={() => void search()}>{searching ? "Searching…" : "Search"}</Button>
      </div>
      <LiveMapLazy center={victim ?? CHASHARA_CENTER} className="h-56 rounded-lg border" zones={d.zones} victim={victim ? toXY(victim[0], victim[1]) : undefined} units={point ? [{ id: "brief", label: label || "Briefing point", kind: "station", ...toXY(point[0], point[1]), gps: "fixed" }] : []} onMapClick={(x, y) => { setPoint(toLatLng(x, y)); setLabel(""); }} focusPoint={point ?? undefined} />
      <p className="text-xs text-muted-foreground">{point ? <>Selected: <span className="font-mono">{fmtCoord(point[0])}, {fmtCoord(point[1])}</span>{label && ` · ${label}`} <button type="button" className="underline" onClick={() => setPoint(null)}>Clear</button></> : "Click the map to mark the meeting point, last seen spot or hazard."}</p>
      <Button className="w-full" disabled={summary.trim().length < 3 || send.isPending} onClick={() => send.mutate()}><Send /> Send briefing</Button>
      {(list.data ?? []).length > 0 && <div className="space-y-2 pt-2"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sent briefings</p>{list.data!.map((b) => <BriefingCard key={b.id} b={b} />)}</div>}
    </div>
  );
}

/** RescueTeam: latest operator briefing with its map point. */
export function BriefingView({ incidentId }: { incidentId: string }) {
  const list = useBriefings(incidentId);
  const [latest, ...older] = list.data ?? [];
  if (!latest) return null;
  return (
    <div className="space-y-2 rounded-2xl border border-crimson/30 bg-card p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-crimson"><ClipboardList className="h-4 w-4" /> Control room briefing</p>
      <BriefingCard b={latest} showMap />
      {older.length > 0 && <details className="text-sm"><summary className="cursor-pointer text-xs text-muted-foreground">Earlier briefings ({older.length})</summary><div className="mt-2 space-y-2">{older.map((b) => <BriefingCard key={b.id} b={b} />)}</div></details>}
    </div>
  );
}
