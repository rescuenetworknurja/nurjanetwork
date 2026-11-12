import { useState } from "react";
import { ArrowUpDown, Circle, Clock, Fingerprint, KeyRound, LogOut, MapPin, Phone, Route as RouteIcon, ShieldCheck, ShieldAlert, Lock, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDemo } from "@/lib/demo-store";
import { ageFromDob } from "@/lib/ids";
import { cn } from "@/lib/utils";
import { TacticalMap } from "../TacticalMap";
import { PostCard } from "../PostCard";
import { PinInput, PwaBadge } from "./ui";

const SAFE: [number, number][] = [[18, 84], [24, 76], [30, 62], [34, 50], [40, 44], [44, 32], [50, 30], [62, 30], [72, 24], [84, 14]];
const DIRECT: [number, number][] = [[18, 84], [40, 70], [58, 46], [70, 34], [84, 14]];

export function SafeRouteTab() {
  const { zones } = useDemo();
  const [from, setFrom] = useState("Sadarghat Launch Terminal");
  const [to, setTo] = useState("Tejgaon College");
  const [go, setGo] = useState(true);
  return (
    <div className="relative flex flex-1 flex-col">
      <TacticalMap className="flex-1" zones={zones} route={go ? SAFE : undefined} showLabels={false}>
        {go && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
            <polyline points={DIRECT.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--crimson)" strokeWidth="3" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" opacity=".45" />
          </svg>
        )}
        <Pin x={18} y={84} tone="bg-ink" />
        <Pin x={84} y={14} tone="bg-emerald" />
      </TacticalMap>

      <div className="absolute inset-x-3 top-11 rounded-3xl border bg-card p-3 shadow-card">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1 px-1"><Circle className="h-3 w-3 fill-ink text-ink" /><span className="h-5 w-px bg-border" /><MapPin className="h-4 w-4 text-emerald" /></div>
          <div className="flex-1 space-y-1.5">
            <Input value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 rounded-lg bg-muted border-0" placeholder="Origin" />
            <Input value={to} onChange={(e) => setTo(e.target.value)} className="h-10 rounded-lg bg-muted border-0" placeholder="Destination" />
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-lg bg-muted" onClick={() => { setFrom(to); setTo(from); }}><ArrowUpDown className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-3 space-y-2">
        <div className="flex items-center justify-between rounded-2xl bg-card/95 px-3 py-2 text-[10px] font-semibold shadow-card">
          <span>Risk</span>
          <div className="mx-2 h-2 flex-1 rounded-full" style={{ background: "linear-gradient(90deg, var(--zone-1), var(--zone-3), var(--zone-5))" }} />
          <span className="text-crimson">High</span>
        </div>
        <div className="rounded-3xl border bg-card p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald text-paper"><RouteIcon className="h-5 w-5" /></div>
            <div className="flex-1">
              <p className="font-display font-bold">Safest Route</p>
              <p className="text-xs text-muted-foreground">Avoids 2 high-risk zones · via Nayapaltan & Kakrail</p>
            </div>
            <div className="text-right"><p className="font-display text-lg font-extrabold">24 min</p><p className="text-[11px] text-muted-foreground">7.8 km</p></div>
          </div>
          <div className="mt-3 flex gap-2 text-[11px]">
            <span className="flex items-center gap-1 rounded-full bg-emerald-soft px-2 py-1 font-semibold text-emerald"><ShieldCheck className="h-3 w-3" /> Safety score 92</span>
            <span className="flex items-center gap-1 rounded-full bg-crimson-soft px-2 py-1 font-semibold text-crimson"><ShieldAlert className="h-3 w-3" /> Fastest route: 19 min, 3 danger zones</span>
          </div>
          <Button className="mt-3 h-11 w-full rounded-lg bg-emerald hover:bg-emerald/90" onClick={() => { setGo(true); toast.success("Navigation started on safest route"); }}>Start safe navigation</Button>
        </div>
      </div>
    </div>
  );
}

function Pin({ x, y, tone }: { x: number; y: number; tone: string }) {
  return <span className={cn("absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-paper shadow", tone)} style={{ left: `${x}%`, top: `${y}%` }} />;
}

export function CommunityTab() {
  const { posts } = useDemo();
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-12">
      <h1 className="text-2xl font-extrabold">Community</h1>
      <p className="mb-4 text-sm text-muted-foreground">Verified awareness posts from NURJA Control.</p>
      <div className="space-y-4">{posts.filter((p) => p.targets.app).map((p) => <PostCard key={p.id} post={p} compact />)}</div>
    </div>
  );
}

export function ProfileTab() {
  const d = useDemo();
  const [pinOpen, setPinOpen] = useState(false);
  const [step, setStep] = useState<"old" | "new">("old");
  const [pin, setPin] = useState("");
  const kyc = d.selfKyc;
  const age = ageFromDob(d.user.dob);
  const self = d.kyc.find((k) => k.id === d.selfKycId);

  const onPin = (v: string) => {
    setPin(v);
    if (v.length < 6) return;
    if (step === "old") {
      if (v === d.user.pin) { setStep("new"); setPin(""); } else { toast.error("Current PIN is wrong"); setPin(""); }
    } else {
      d.set((s) => ({ user: { ...s.user, pin: v } })); toast.success("Security PIN updated"); setPinOpen(false); setStep("old"); setPin("");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-6">
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
          <Item icon={Fingerprint} label="Biometric unlock" value="On" />
        </Section>
        <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
          <div><p className="text-sm font-bold">Offline mode</p><p className="text-xs text-muted-foreground">SOS SMS and video chunks work without internet</p></div>
          <PwaBadge compact />
        </div>
        <Button variant="ghost" className="w-full text-crimson" onClick={() => d.set({ appView: "onboarding" })}><LogOut /> Log out (restart wizard)</Button>
      </div>

      <Dialog open={pinOpen} onOpenChange={(o) => { setPinOpen(o); setStep("old"); setPin(""); }}>
        <DialogContent className="max-w-[360px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-center font-display">{step === "old" ? "Enter current PIN" : "Choose a new PIN"}</DialogTitle>
            <DialogDescription className="text-center">{step === "old" ? `Demo current PIN: ${d.user.pin}` : "6 digits, used to stop SOS"}</DialogDescription>
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
