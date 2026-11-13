import { useEffect, useRef, useState } from "react";
import { geocode, type LatLng } from "@/lib/routing";
import { findSafeRoutes, type Scored } from "@/lib/safe-route";
import { useTripShare, trackUrl } from "@/lib/trip-share";
import { Radio, Share2, MessageSquare, ArrowUpDown, Circle, Clock, Fingerprint, KeyRound, LogOut, MapPin, Phone, Route as RouteIcon, ShieldCheck, ShieldAlert, Lock, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDemo } from "@/lib/demo-store";
import { changeLivePin } from "@/lib/live.functions";
import { signOut } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { ageFromDob } from "@/lib/ids";
import { cn } from "@/lib/utils";
import { LiveMapLazy } from "../LiveMapLazy";
import { PostCard } from "../PostCard";
import { PinInput, PwaBadge } from "./ui";
import { LanguageSetting, Slogan, useT } from "@/lib/i18n";
import { NurjaMark } from "../Brand";

function LangLabel() { const { tr } = useT(); return <>{tr("App Settings", "অ্যাপ সেটিংস")}</>; }

const MY_LOC = "My location";

export function SafeRouteTab() {
  const { zones } = useDemo();
  const [from, setFrom] = useState(MY_LOC);
  const [to, setTo] = useState("");
  const [me, setMe] = useState<LatLng | undefined>();
  const [busy, setBusy] = useState(false);
  const [opts, setOpts] = useState<{ ranked: Scored[]; fastest: Scored | null; ends: [LatLng, LatLng] } | null>(null);
  const [pick, setPick] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const trip = useTripShare(me);
  const chosen = opts?.ranked[pick];
  const res = opts && chosen ? { ...chosen, ends: opts.ends } : null;

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (p) => setMe([p.coords.latitude, p.coords.longitude]),
      () => toast.error("Location permission denied — allow location to see yourself on the map"),
      { enableHighAccuracy: true, maximumAge: 10000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const resolve = async (q: string): Promise<LatLng | null> => {
    if (q.trim() === "" || q === MY_LOC) return me ?? null;
    return (await geocode(q))?.point ?? null;
  };

  const start = async () => {
    if (!to.trim()) { toast.error("Enter a destination"); return; }
    setBusy(true);
    try {
      const [a, b] = await Promise.all([resolve(from), resolve(to)]);
      if (!a) { toast.error(from === MY_LOC ? "Your location is not available yet" : "Start place not found"); return; }
      if (!b) { toast.error("Destination not found"); return; }
      const r = await findSafeRoutes(a, b, zones);
      const top = r.ranked[0];
      window.__lovableEvents?.track?.("project.safe_route_search", { result: top ? (top.crossings ? "no_safe_alternative" : "safe") : "no_route", option_count: r.ranked.length });
      if (top?.crossings) window.__lovableEvents?.track?.("project.safe_route_no_safe_alternative", { high_risk_crossings: top.crossings });
      if (!r.ranked.length) { toast.error("No route found"); return; }
      setOpts({ ...r, ends: [a, b] }); setPick(0);
      if (r.ranked[0]!.crossings > 0) toast.warning("No safer alternative available — route passes a high-risk zone");
      else toast.success("Safe route found");
    } catch {
      toast.error("Route service unavailable, try again");
    } finally { setBusy(false); }
  };

  return (
    <div className="relative flex flex-1 flex-col">
      <LiveMapLazy className="min-h-[60vh] flex-1" zones={zones} showLabels={false} me={me} path={res?.path} endpoints={res?.ends} routeTone={res?.crossings ? "crimson" : "emerald"} />

      <div className="absolute inset-x-3 top-3 z-[500] rounded-3xl border bg-card p-3 shadow-card">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1 px-1"><Circle className="h-3 w-3 fill-ink text-ink" /><span className="h-5 w-px bg-border" /><MapPin className="h-4 w-4 text-emerald" /></div>
          <div className="flex-1 space-y-1.5">
            <Input value={from} onChange={(e) => setFrom(e.target.value)} onFocus={(e) => from === MY_LOC && e.target.select()} className="h-10 rounded-lg bg-muted border-0" placeholder="Origin" />
            <Input value={to} onChange={(e) => setTo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && start()} className="h-10 rounded-lg bg-muted border-0" placeholder="Destination" />
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-lg bg-muted" onClick={() => { setFrom(to); setTo(from); }}><ArrowUpDown className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-24 z-[500] space-y-2">
        <div className="rounded-3xl border bg-card p-4 shadow-card">
          {res && opts ? (
            <div className="space-y-2.5">
              {opts.ranked.length > 1 && (
                <div className="flex gap-1.5">
                  {opts.ranked.map((o, i) => (
                    <button key={i} onClick={() => { setPick(i); window.__lovableEvents?.track?.("project.safe_route_selected", { option_index: i, high_risk_crossings: o.crossings }); }} className={cn("flex-1 rounded-lg border px-2 py-1.5 text-left text-[11px]", pick === i ? "border-emerald bg-emerald/10" : "bg-muted")}>
                      <span className="block font-bold">{i === 0 ? "Safest" : `Option ${i + 1}`}</span>
                      <span className="text-muted-foreground">{Math.round(o.seconds / 60)} min · {o.crossings ? `${o.crossings} high-risk` : "Avoids high-risk"}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className={cn("grid h-11 w-11 place-items-center rounded-2xl text-paper", res.crossings ? "bg-crimson" : "bg-emerald")}>{res.crossings ? <ShieldAlert className="h-5 w-5" /> : <RouteIcon className="h-5 w-5" />}</div>
                <div className="flex-1">
                  <p className="font-display font-bold">{res.crossings ? "Caution route" : pick === 0 ? "Safest Route" : "Alternative route"}</p>
                  <p className="text-xs text-muted-foreground">{res.crossings ? "Passes through a high-risk zone" : "Avoids marked high-risk zones"}</p>
                </div>
                <div className="text-right"><p className="font-display text-lg font-extrabold">{Math.round(res.seconds / 60)} min</p><p className="text-[11px] text-muted-foreground">{(res.meters / 1000).toFixed(1)} km</p></div>
              </div>
              {opts.ranked[0]!.crossings > 0 && (
                <p className="rounded-lg bg-crimson/10 p-2 text-xs font-semibold text-crimson">No safer alternative available. Stay alert, share live location, and keep SOS ready.</p>
              )}
              {pick === 0 && opts.fastest && opts.fastest.crossings > res.crossings && (
                <p className="text-[11px] text-muted-foreground">Fastest road crosses {opts.fastest.crossings} high-risk zone(s) — this route adds {Math.max(0, Math.round((res.seconds - opts.fastest.seconds) / 60))} min to avoid it.</p>
              )}
              {res.hits.length > 0 && (
                <div className="max-h-24 space-y-1 overflow-y-auto">
                  <p className="text-[11px] font-bold uppercase text-muted-foreground">Nearby safety concerns</p>
                  {res.hits.map((h) => (
                    <div key={h.zone.id} className="flex items-center justify-between rounded-lg bg-muted px-2 py-1 text-xs">
                      <span className="flex items-center gap-1.5"><span className={cn("h-2 w-2 rounded-full", h.zone.rating >= 4 ? "bg-crimson" : "bg-amber")} />{h.zone.name}</span>
                      <span className="text-muted-foreground">{h.inside ? "Route passes through" : `${h.meters} m away`} · {h.zone.rating}/5</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Enter a destination to see the safest route</p>
          )}
          <Button variant="outline" className="mt-3 h-10 w-full rounded-lg" onClick={() => setShareOpen(true)}><Share2 className="h-4 w-4" /> Share route & live location</Button>
          <Button disabled={busy} className="mt-2 h-11 w-full rounded-lg bg-emerald hover:bg-emerald/90" onClick={start}>{busy ? "Finding route…" : "Start safe navigation"}</Button>
        </div>
      </div>
      {trip.id && (
        <div className="absolute inset-x-3 top-[118px] z-[500] flex items-center justify-between gap-2 rounded-xl border border-emerald bg-card px-3 py-2 text-xs shadow-card">
          <span className="font-bold text-emerald">● Live location sharing on</span>
          <Button size="sm" variant="destructive" className="h-7 rounded-lg" onClick={async () => { await trip.stop(); window.__lovableEvents?.track?.("project.trip_share_stopped", {}); toast.success("Sharing stopped"); }}>Stop sharing</Button>
        </div>
      )}
      <ShareTripDialog trip={trip} open={shareOpen} onOpenChange={setShareOpen} me={me} dest={res?.ends[1]} destLabel={to} minutes={res ? Math.round(res.seconds / 60) : undefined} />
    </div>
  );
}

const mapsLink = (p: LatLng) => `https://www.google.com/maps?q=${p[0].toFixed(6)},${p[1].toFixed(6)}`;

function ShareTripDialog({ trip, open, onOpenChange, me, dest, destLabel, minutes }: { trip: ReturnType<typeof useTripShare>; open: boolean; onOpenChange: (o: boolean) => void; me?: LatLng | undefined; dest?: LatLng | undefined; destLabel: string; minutes?: number | undefined }) {
  const { user } = useDemo();
  const [who, setWho] = useState<"emergency" | "custom">("emergency");
  const [phone, setPhone] = useState("");
  const meRef = useRef(me);
  meRef.current = me;
  const target = who === "emergency" ? user.emergencyPhone : phone.trim();
  const message = () => {
    const parts = [`NURJA: ${user.name} is sharing their trip with you.`];
    if (trip.id) parts.push(`Live tracking: ${trackUrl(trip.id)}`);
    if (meRef.current) parts.push(`Current location: ${mapsLink(meRef.current)}`);
    if (dest) parts.push(`Going to: ${destLabel || "destination"} ${mapsLink(dest)}${minutes ? ` (~${minutes} min)` : ""}`);
    return parts.join("\n");
  };
  const send = async (channel: "sms" | "whatsapp" | "system") => {
    if (!meRef.current) { toast.error("Your location is not available yet"); return; }
    if (!/^01\d{9}$/.test(target)) { toast.error("Enter a valid 01XXXXXXXXX number"); return; }
    const text = message();
    window.__lovableEvents?.track?.("project.trip_shared", { channel, contact: who, has_route: !!dest, live: !!trip.id });
    if (channel === "system" && navigator.share) { try { await navigator.share({ text }); } catch { return; } }
    else if (channel === "whatsapp") { const w = window.open(`https://wa.me/88${target}?text=${encodeURIComponent(text)}`, "_blank"); if (w) w.opener = null; if (!w) { await navigator.clipboard?.writeText(text).catch(() => {}); toast.info("WhatsApp could not open here — message copied, paste it in WhatsApp"); return; } }
    else window.location.href = `sms:+88${target}?body=${encodeURIComponent(text)}`;
    toast.success("Trip shared");
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Share with a trusted person</DialogTitle><DialogDescription>They get your current location and route as map links.</DialogDescription></DialogHeader>
        <div className="space-y-2">
          <button onClick={() => setWho("emergency")} className={cn("w-full rounded-lg border p-3 text-left text-sm", who === "emergency" && "border-emerald bg-emerald/10")}>
            <b>{user.emergencyName}</b> · {user.relation}<span className="block text-xs text-muted-foreground">{user.emergencyPhone}</span>
          </button>
          <button onClick={() => setWho("custom")} className={cn("w-full rounded-lg border p-3 text-left text-sm", who === "custom" && "border-emerald bg-emerald/10")}><b>Another person</b></button>
          {who === "custom" && <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" placeholder="01XXXXXXXXX" className="h-10 rounded-lg" />}
          {trip.id ? (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald/10 p-2 text-xs">
              <span className="font-semibold text-emerald">Live tracking link is on</span>
              <Button size="sm" variant="ghost" className="h-7 text-crimson" onClick={async () => { await trip.stop(); window.__lovableEvents?.track?.("project.trip_share_stopped", {}); toast.success("Sharing stopped"); }}>Stop sharing</Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full rounded-lg" onClick={async () => {
              try { await trip.start({ name: user.name, dest, destLabel }); window.__lovableEvents?.track?.("project.trip_share_started", { has_route: !!dest }); toast.success("Live tracking link created — now send it"); }
              catch (e) { toast.error(e instanceof Error ? e.message : "Could not start sharing"); }
            }}><Radio className="h-4 w-4" /> Create live tracking link</Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button className="rounded-lg" onClick={() => void send("sms")}><MessageSquare className="h-4 w-4" /> SMS</Button>
          <Button variant="outline" className="rounded-lg" onClick={() => void send("whatsapp")}>WhatsApp</Button>
        </div>
        {typeof navigator !== "undefined" && "share" in navigator && <Button variant="ghost" className="rounded-lg" onClick={() => void send("system")}><Share2 className="h-4 w-4" /> More apps</Button>}
      </DialogContent>
    </Dialog>
  );
}

export function CommunityTab() {
  const { posts } = useDemo();
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-28 pt-12">
      <h1 className="text-2xl font-extrabold">Community</h1>
      <p className="mb-4 text-sm text-muted-foreground">Verified awareness posts from NURJA Control.</p>
      <div className="space-y-4">{posts.filter((p) => p.targets.app && p.published !== false).map((p) => <PostCard key={p.id} post={p} compact />)}</div>
    </div>
  );
}

export function ProfileTab() {
  const d = useDemo();
  const navigate = useNavigate();
  const [pinOpen, setPinOpen] = useState(false);
  const [step, setStep] = useState<"old" | "new">("old");
  const [pin, setPin] = useState("");
  const kyc = d.selfKyc;
  const age = ageFromDob(d.user.dob);
  const self = d.kyc.find((k) => k.id === d.selfKycId);

  const [oldPin,setOldPin]=useState("");
  const onPin = async (v: string) => {
    setPin(v);
    if (v.length < 6) return;
    if (step === "old") {
      setOldPin(v);setStep("new");setPin("");
    } else {
      try{await changeLivePin({data:{oldPin,newPin:v}});toast.success("Security PIN updated");setPinOpen(false);}catch{toast.error("Current PIN is wrong");}setStep("old");setPin("");setOldPin("");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <div className="bg-navy px-5 pb-14 pt-12 text-paper">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-paper/10 font-display text-2xl font-extrabold">{d.user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</div>
          <div>
            <p className="font-display text-xl font-bold">{d.user.name}</p>
            <p className="text-sm text-paper/60">+88 {d.user.phone}</p>
          </div>
        </div>
      </div>
      <div className="-mt-8 space-y-3 px-4">
        <div className="rounded-2xl border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className={cn("grid h-10 w-10 place-items-center rounded-full text-paper", kyc === "approved" ? "bg-emerald" : kyc === "rejected" ? "bg-crimson" : "bg-amber")}>
              {kyc === "approved" ? <ShieldCheck className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="font-bold">{kyc === "approved" ? "KYC Verified" : kyc === "rejected" ? "KYC Rejected — resubmit" : "KYC Under Review"}</p>
              <p className="text-xs text-muted-foreground">{d.user.adult ? `Adult 18+ · Age ${age} · NID + Selfie` : `Under 18 Minor · Age ${age} · Guardian NOC`}</p>
            </div>
          </div>
          {!d.user.adult && self?.guardian && <p className="mt-3 rounded-xl bg-muted p-2.5 text-xs">Guardian: <b>{self.guardian.name}</b> ({self.guardian.relation}) · {self.guardian.phone}</p>}
        </div>
        <Section title="Account">
          <Item icon={UserRound} label="Account type" value="NURJA User" />
          <Item icon={Clock} label="Date of birth" value={d.user.dob} />
          <Item icon={Users} label="Volunteer status" value="Not a volunteer" />
        </Section>
        <Section title="Emergency contacts">
          <Item icon={Phone} label={`${d.user.emergencyName} · ${d.user.relation}`} value={d.user.emergencyPhone} />
          <Item icon={Phone} label="National emergency" value="999" />
        </Section>
        <Section title="Security">
          <button className="w-full" onClick={() => setPinOpen(true)}><Item icon={KeyRound} label="Reset Security PIN" value="Change" /></button>

        </Section>
        <div className="rounded-2xl border bg-card p-4">
          <p className="mb-3 text-xs font-bold uppercase text-muted-foreground"><LangLabel /></p>
          <LanguageSetting />
        </div>
        <div className="flex flex-col items-center gap-1 rounded-2xl border bg-card p-4 text-center">
          <NurjaMark />
          <Slogan className="text-xs font-semibold text-crimson" />
          <p className="text-[11px] text-muted-foreground">Women safety & rapid rescue network · v1.0</p>
        </div>
        <Button variant="ghost" className="w-full text-crimson" onClick={async () => { await signOut(); void navigate({ to: "/auth", search: { redirect: "/NURJASOS" } }); }}><LogOut /> Sign out</Button>

      </div>

      <Dialog open={pinOpen} onOpenChange={(o) => { setPinOpen(o); setStep("old"); setPin(""); }}>
        <DialogContent className="max-w-[360px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-center font-display">{step === "old" ? "Enter current PIN" : "Choose a new PIN"}</DialogTitle>
            <DialogDescription className="text-center">{step === "old" ? "Enter your current 6-digit PIN" : "6 digits, used to stop SOS"}</DialogDescription>
          </DialogHeader>
          <PinInput value={pin} onChange={onPin} autoFocus />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-2xl border bg-card"><p className="px-4 pt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{title}</p><div className="divide-y">{children}</div></div>;
}
function Item({ icon: I, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return <div className="flex items-center gap-3 px-4 py-3 text-left"><I className="h-4 w-4 text-muted-foreground" /><span className="flex-1 text-sm">{label}</span><span className="text-sm font-semibold">{value}</span></div>;
}
