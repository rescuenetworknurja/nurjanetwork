import { useState } from "react";
import { Check, Eye, FileImage, ImageIcon, KeyRound, MapPin, Plus, Satellite, Save, Trash2, UserPlus, X, Youtube } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemo } from "@/lib/demo-store";
import { IMAGES, isType1, type KycSubmission, type Responder, type Zone } from "@/lib/mock-data";
import { ageFromDob, generateVolunteerId } from "@/lib/ids";
import { cn } from "@/lib/utils";
import { TacticalMap } from "../TacticalMap";
import { PostCard } from "../PostCard";
import { Card, PageHead } from "./Dashboard";

const statusTone = (s: string) => s === "approved" ? "bg-emerald-soft text-emerald" : s === "rejected" ? "bg-crimson-soft text-crimson" : "bg-amber-soft text-amber";
const Pill = ({ s }: { s: string }) => <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold capitalize", statusTone(s))}>{s}</span>;

function DocTile({ label, round }: { label: string; round?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className={cn("grid place-items-center bg-muted", round ? "aspect-square" : "aspect-[1.6]")}>
        <div className="text-center text-muted-foreground"><FileImage className="mx-auto h-8 w-8" /><p className="mt-1 text-[11px]">{label}.jpg</p></div>
      </div>
      <p className="px-3 py-2 text-xs font-semibold">{label}</p>
    </div>
  );
}

export function KycSection() {
  const d = useDemo();
  const [filter, setFilter] = useState("pending");
  const [open, setOpen] = useState<KycSubmission | null>(null);
  const list = d.kyc.filter((k) => filter === "all" || k.status === filter);
  const act = (k: KycSubmission, s: "approved" | "rejected") => {
    d.setKycStatus(k.id, s); setOpen(null);
    toast[s === "approved" ? "success" : "error"](`${k.name} ${s}`, { description: k.id === d.selfKycId ? (s === "approved" ? "SOS is now unlocked in the NURJA app." : "The user will be asked to resubmit.") : undefined });
  };
  return (
    <>
      <PageHead title="KYC Approval Queue" sub="Review adult and under-18 submissions">
        <Tabs value={filter} onValueChange={setFilter}><TabsList>{["pending", "approved", "rejected", "all"].map((f) => <TabsTrigger key={f} value={f} className="capitalize">{f}</TabsTrigger>)}</TabsList></Tabs>
      </PageHead>
      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Profile</TableHead><TableHead>Documents</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {list.map((k) => (
              <TableRow key={k.id}>
                <TableCell className="font-semibold">{k.name}{k.id === d.selfKycId && <span className="ml-2 rounded bg-accent px-1.5 text-[10px] text-accent-foreground">Demo user</span>}</TableCell>
                <TableCell className="font-mono text-xs">{k.phone}</TableCell>
                <TableCell><span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", k.type === "adult" ? "bg-secondary" : "bg-amber-soft text-amber")}>{k.type === "adult" ? "Adult 18+" : "Under 18"} · {ageFromDob(k.dob)}y</span></TableCell>
                <TableCell className="text-xs text-muted-foreground">{k.type === "adult" ? "NID front/back + selfie" : "Birth reg + NOC + guardian NID"}</TableCell>
                <TableCell className="text-xs">{k.submittedAt}</TableCell>
                <TableCell><Pill s={k.status} /></TableCell>
                <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => setOpen(k)}><Eye /> Review</Button></TableCell>
              </TableRow>
            ))}
            {!list.length && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Nothing here</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <SheetHeader><SheetTitle className="font-display">{open.name}</SheetTitle><SheetDescription>{open.type === "adult" ? "Adult 18+" : "Under 18 Minor"} · DOB {open.dob} · {open.phone}</SheetDescription></SheetHeader>
              <div className="space-y-4 px-4 py-4">
                {open.type === "adult" ? (
                  <div className="grid grid-cols-2 gap-3"><DocTile label="NID Front" /><DocTile label="NID Back" /><div className="col-span-2 mx-auto w-1/2"><DocTile label="Live Selfie" round /></div></div>
                ) : (
                  <>
                    <div className="rounded-xl border p-4 text-sm"><p className="text-xs text-muted-foreground">Birth Registration No.</p><p className="font-mono text-base font-bold tracking-wider">{open.birthReg}</p></div>
                    <div className="rounded-xl border p-4 text-sm">
                      <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Guardian NOC</p>
                      <p>Name: <b>{open.guardian?.name}</b></p><p>Phone: <b>{open.guardian?.phone}</b></p><p>Relationship: <b>{open.guardian?.relation}</b></p>
                      <p className="mt-2 flex items-center gap-1 text-emerald"><Check className="h-4 w-4" /> Legal consent signed</p>
                    </div>
                    <DocTile label="Guardian NID" />
                  </>
                )}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" className="border-crimson text-crimson" onClick={() => act(open, "rejected")}><X /> Reject</Button>
                  <Button className="bg-emerald hover:bg-emerald/90" onClick={() => act(open, "approved")}><Check /> Approve</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

const KIND_LABEL: Record<Responder["kind"], string> = { patrol: "Patrolling Unit", fari: "Police Fari", station: "Police Station", volunteer: "Volunteer", officer: "Police Officer" };
const KIND_LABEL_BN: Record<Responder["kind"], string> = { patrol: "পেট্রোলিং টিম", fari: "পুলিশ ফাঁড়ি", station: "থানা", volunteer: "ভলান্টিয়ার", officer: "পুলিশ অফিসার" };

function GpsBadge({ fixed }: { fixed: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", fixed ? "bg-navy/10 text-navy dark:bg-paper/10 dark:text-paper" : "bg-crimson-soft text-crimson")}>
      {fixed ? "📍 Fixed GPS" : "📡 Live GPS"}
    </span>
  );
}

const OnlineDot = ({ on }: { on: boolean }) => (
  <span className={cn("flex items-center gap-1.5 text-xs font-semibold", on ? "text-emerald" : "text-muted-foreground")}>
    <span className={cn("h-2 w-2 rounded-full", on ? "bg-emerald" : "bg-muted-foreground")} />{on ? "Online" : "Offline"}
  </span>
);

/** "+ Add Type 1 Police Unit" — fixed GPS for Thana/Fari, live GPS for Patrolling Units. */
function UnitForm({ onDone }: { onDone: () => void }) {
  const d = useDemo();
  const [kind, setKind] = useState<"station" | "fari" | "patrol">("station");
  const [f, setF] = useState({ name: "", nameBn: "", code: "", area: "", inCharge: "", rank: "", phone: "", password: "", vehicleNo: "", patrolZone: "" });
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const fixed = kind !== "patrol";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fixed && !pos) { toast.error("Pick the fixed location on the map"); return; }
    const code = f.code || (kind === "station" ? `THANA-DHK-${String(d.responders.filter((r) => r.kind === "station").length + 1).padStart(2, "0")}` : kind === "fari" ? `FARI-NRG-${String(d.responders.filter((r) => r.kind === "fari").length + 1).padStart(2, "0")}` : `PATROL-${100 + d.responders.filter((r) => r.kind === "patrol").length + 1}`);
    d.addResponder({
      name: f.name, nameBn: f.nameBn || undefined, kind, code, area: f.area, phone: f.phone, online: false,
      fixed, x: pos?.x ?? 30 + Math.random() * 40, y: pos?.y ?? 30 + Math.random() * 40,
      inCharge: f.inCharge || undefined, rank: f.rank || undefined, password: f.password || undefined,
      vehicleNo: kind === "patrol" ? f.vehicleNo || undefined : undefined,
      patrolZone: kind === "patrol" ? f.patrolZone || undefined : undefined,
    });
    toast.success(`Police unit created: ${code}`, { description: `${KIND_LABEL[kind]} · ${fixed ? "Fixed GPS location saved" : "Live GPS from the Patrol App"}` });
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5"><Label>Unit sub-type</Label>
        <Select value={kind} onValueChange={(v) => { setKind(v as typeof kind); setPos(null); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="station">Police Station / Thana (থানা)</SelectItem>
            <SelectItem value="fari">Police Fari (পুলিশ ফাঁড়ি)</SelectItem>
            <SelectItem value="patrol">Patrolling Unit / Team (পেট্রোলিং টিম)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Unit / station name (English)</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Wari Police Station" /></div>
        <div className="space-y-1.5"><Label>নাম (বাংলা)</Label><Input value={f.nameBn} onChange={(e) => setF({ ...f, nameBn: e.target.value })} placeholder="যেমন ওয়ারী থানা" /></div>
        <div className="space-y-1.5"><Label>Unit code / call sign</Label><Input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder={kind === "station" ? "THANA-DHK-01" : kind === "fari" ? "FARI-NRG-02" : "PATROL-104"} /></div>
        <div className="space-y-1.5"><Label>Jurisdiction area</Label><Input required value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} placeholder="e.g. Wari, Dhaka" /></div>
        <div className="space-y-1.5"><Label>In-charge officer name</Label><Input required value={f.inCharge} onChange={(e) => setF({ ...f, inCharge: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Rank</Label><Input value={f.rank} onChange={(e) => setF({ ...f, rank: e.target.value })} placeholder="e.g. Officer-in-Charge" /></div>
        <div className="space-y-1.5"><Label>Official duty phone (login number)</Label><Input required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="01XXXXXXXXX" /></div>
        <div className="space-y-1.5"><Label>Login password</Label><Input required type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
      </div>

      {fixed ? (
        <div className="space-y-2 rounded-xl border p-4">
          <p className="flex items-center gap-2 text-sm font-bold"><MapPin className="h-4 w-4 text-navy dark:text-paper" /> Fixed location (স্থায়ী অবস্থান — Fixed GPS)</p>
          <p className="text-xs text-muted-foreground">Thana and Fari are stationary. Click the map to drop the pin — the unit shows as a fixed marker on every map.</p>
          <TacticalMap className="h-48 rounded-lg border" zones={d.zones} units={pos ? [{ id: "new", label: f.name || "New unit", kind, x: pos.x, y: pos.y, gps: "fixed" }] : []} onMapClick={(x, y) => setPos({ x, y })} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Latitude</Label><Input readOnly value={pos ? (23.6 + pos.y / 100 * 0.25).toFixed(4) : ""} placeholder="Pick on map" /></div>
            <div className="space-y-1.5"><Label>Longitude</Label><Input readOnly value={pos ? (90.3 + pos.x / 100 * 0.25).toFixed(4) : ""} placeholder="Pick on map" /></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border p-4">
          <p className="flex items-center gap-2 text-sm font-bold"><Satellite className="h-4 w-4 text-crimson" /> Live moving location (লাইভ জিপিএস ট্র্যাকিং)</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-crimson-soft px-2.5 py-1 text-[11px] font-bold text-crimson"><span className="h-1.5 w-1.5 rounded-full bg-crimson animate-blink" /> 📡 Live GPS — updates automatically from the Patrol App</span>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Vehicle number (গাড়ির নাম্বার)</Label><Input required value={f.vehicleNo} onChange={(e) => setF({ ...f, vehicleNo: e.target.value })} placeholder="DHA-GA-17-4407" /></div>
            <div className="space-y-1.5"><Label>Patrol zone</Label><Input required value={f.patrolZone} onChange={(e) => setF({ ...f, patrolZone: e.target.value })} placeholder="e.g. Motijheel–Paltan ring" /></div>
          </div>
        </div>
      )}

      <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">Dispatch rule: Type 1 units are mandatory auto-accept — the nearest 2 patrolling units, 1 Fari and 1 Station are dispatched on every SOS.</p>
      <Button type="submit" className="w-full"><UserPlus /> Create police unit</Button>
    </form>
  );
}

/** "+ Add Type 2 Responder" — auto V-XXXXXX for volunteers, manual TaskForce ID for officers. */
function ResponderForm({ onDone }: { onDone: () => void }) {
  const d = useDemo();
  const [kind, setKind] = useState<"volunteer" | "officer">("volunteer");
  const [autoId] = useState(() => generateVolunteerId());
  const [f, setF] = useState({ name: "", phone: "", password: "", nid: "", area: "", code: "", rank: "", station: "", photo: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = kind === "volunteer" ? autoId : f.code.toUpperCase();
    d.addResponder({
      name: f.name, kind, code, area: f.area, phone: f.phone, online: false,
      nid: f.nid || undefined, password: f.password || undefined, hasPhoto: !!f.photo,
      rank: kind === "officer" ? f.rank || undefined : undefined,
      station: kind === "officer" ? f.station || undefined : undefined,
      x: 30 + Math.random() * 40, y: 30 + Math.random() * 40,
    });
    toast.success(`Responder account created: ${code}`, { description: `${KIND_LABEL[kind]} · signs in to the Rescue Network app with ${f.phone}` });
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5"><Label>Responder sub-type</Label>
        <Select value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="volunteer">Volunteer (ভলান্টিয়ার)</SelectItem>
            <SelectItem value="officer">Police Officer (পুলিশ অফিসার)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {kind === "volunteer" ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald/30 bg-emerald-soft px-4 py-3">
          <div><p className="text-xs text-muted-foreground">Volunteer ID</p><p className="font-mono text-lg font-extrabold text-emerald">{autoId}</p></div>
          <span className="rounded-full bg-emerald/15 px-2.5 py-1 text-[11px] font-bold text-emerald">Auto-generated by system</span>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5"><Label>TaskForce ID (Police ID / BP No.)</Label><Input required value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="TF-9042 or BP-8839201" /></div>
          <div className="space-y-1.5"><Label>Officer rank</Label><Input required value={f.rank} onChange={(e) => setF({ ...f, rank: e.target.value })} placeholder="e.g. Sub-Inspector" /></div>
          <div className="space-y-1.5"><Label>Assigned station / unit</Label><Input required value={f.station} onChange={(e) => setF({ ...f, station: e.target.value })} placeholder="e.g. Ramna Police Station" /></div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Full name</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Phone number (Rescue app login)</Label><Input required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="01XXXXXXXXX" /></div>
        <div className="space-y-1.5"><Label>Login password</Label><Input required type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>NID number</Label><Input required value={f.nid} onChange={(e) => setF({ ...f, nid: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Present address / zone</Label><Input required value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Profile / NID photo</Label>
          <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />{f.photo || "Upload photo"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setF({ ...f, photo: e.target.files?.[0]?.name ?? "" })} />
          </label>
        </div>
      </div>

      <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">Dispatch rule: Type 2 responders use live device GPS while their Rescue app is Online. During an SOS the nearest 10 online responders get an alert with Accept / Respond.</p>
      <Button type="submit" className="w-full"><UserPlus /> Create responder account</Button>
    </form>
  );
}

export function NetworkSection() {
  const d = useDemo();
  const [dialog, setDialog] = useState<"unit" | "responder" | null>(null);
  const pending = d.volunteerApps.filter((a) => a.status === "pending");
  const type1 = d.responders.filter((r) => isType1(r.kind));
  const type2 = d.responders.filter((r) => !isType1(r.kind));

  return (
    <>
      <PageHead title="Rescue Network & Volunteers" sub="Type 1 police units (fixed vs live GPS) and Type 2 volunteers & officers" />
      <Tabs defaultValue="type1">
        <TabsList>
          <TabsTrigger value="type1">Type 1: Police Units</TabsTrigger>
          <TabsTrigger value="type2">Type 2: Volunteers & Officers</TabsTrigger>
          <TabsTrigger value="apps">Applications {pending.length > 0 && <span className="ml-1.5 rounded-full bg-crimson px-1.5 text-[10px] text-paper">{pending.length}</span>}</TabsTrigger>
        </TabsList>

        <TabsContent value="type1" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Thana & Fari use 📍 fixed GPS; patrolling teams use 📡 live GPS from their vehicle device.</p>
            <Button onClick={() => setDialog("unit")}><Plus /> Add Type 1 Police Unit</Button>
          </div>
          <Card className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Unit</TableHead><TableHead>Code / call sign</TableHead><TableHead>Sub-type</TableHead><TableHead>Jurisdiction</TableHead><TableHead>In-charge</TableHead><TableHead>GPS</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {type1.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell><p className="font-semibold">{r.name}</p>{r.nameBn && <p className="text-xs text-muted-foreground">{r.nameBn}</p>}{r.vehicleNo && <p className="font-mono text-[11px] text-muted-foreground">{r.vehicleNo} · {r.patrolZone}</p>}</TableCell>
                    <TableCell className="font-mono text-xs font-bold">{r.code}</TableCell>
                    <TableCell>{KIND_LABEL[r.kind]}<span className="block text-[11px] text-muted-foreground">{KIND_LABEL_BN[r.kind]}</span></TableCell>
                    <TableCell>{r.area}</TableCell>
                    <TableCell className="text-xs">{r.inCharge}{r.rank && <span className="block text-muted-foreground">{r.rank}</span>}</TableCell>
                    <TableCell><GpsBadge fixed={!!r.fixed} /></TableCell>
                    <TableCell><OnlineDot on={r.online} /></TableCell>
                  </TableRow>
                ))}
                {!type1.length && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No police units yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="type2" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Volunteers get an auto V-XXXXXX ID; officers use their TaskForce / BP ID. All use live device GPS while online.</p>
            <Button onClick={() => setDialog("responder")}><Plus /> Add Type 2 Responder</Button>
          </div>
          <Card className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>ID</TableHead><TableHead>Category</TableHead><TableHead>Area / zone</TableHead><TableHead>Phone</TableHead><TableHead>GPS</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {type2.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell><p className="font-semibold">{r.name}</p>{r.rank && <p className="text-xs text-muted-foreground">{r.rank}{r.station ? ` · ${r.station}` : ""}</p>}</TableCell>
                    <TableCell className="font-mono text-xs font-bold">{r.code}</TableCell>
                    <TableCell>{KIND_LABEL[r.kind]}<span className="block text-[11px] text-muted-foreground">{KIND_LABEL_BN[r.kind]}</span></TableCell>
                    <TableCell>{r.area}</TableCell>
                    <TableCell className="font-mono text-xs">{r.phone}</TableCell>
                    <TableCell><GpsBadge fixed={false} /></TableCell>
                    <TableCell><OnlineDot on={r.online} /></TableCell>
                  </TableRow>
                ))}
                {!type2.length && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No volunteers or officers yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="apps" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">Applications from the public website's "Become a Volunteer" form. Approving generates the V-XXXXXX ID and creates the Type 2 Rescue Network account.</p>
          {d.volunteerApps.map((a) => (
            <Card key={a.id} className="flex flex-wrap items-start gap-4">
              <div className="grid h-16 w-24 place-items-center rounded-lg bg-muted"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
              <div className="min-w-[240px] flex-1">
                <div className="flex items-center gap-2"><p className="font-display font-bold">{a.name}</p><Pill s={a.status} />{a.volunteerId && <span className="font-mono text-sm font-bold text-emerald">{a.volunteerId}</span>}</div>
                <p className="text-sm text-muted-foreground">{a.occupation} · {a.address} · {a.phone} · {a.email}</p>
                <p className="text-xs text-muted-foreground">NID {a.nid} · {a.submittedAt}</p>
                <p className="mt-2 text-sm italic">"{a.motivation}"</p>
              </div>
              {a.status === "pending" && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { d.rejectVolunteer(a.id); toast("Application rejected"); }}>Reject</Button>
                  <Button className="bg-emerald hover:bg-emerald/90" onClick={() => { const id = d.approveVolunteer(a.id); toast.success(`Approved — Volunteer ID ${id}`, { description: `${a.name} has been added to the Rescue Network.` }); }}>
                    <Check /> Approve & Generate Volunteer ID
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{dialog === "unit" ? "Add Type 1 Police Unit" : "Add Type 2 Responder"}</DialogTitle>
            <DialogDescription>{dialog === "unit" ? "থানা / ফাঁড়ি / পেট্রোল টিম — the account can sign in to the Rescue Network app." : "ভলান্টিয়ার / পুলিশ অফিসার — the account can sign in to the Rescue Network app."}</DialogDescription>
          </DialogHeader>
          {dialog === "unit" ? <UnitForm onDone={() => setDialog(null)} /> : <ResponderForm onDone={() => setDialog(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

const RATING_LABEL = ["", "Low", "Guarded", "Moderate", "High", "Extreme"];

export function HazardSection() {
  const d = useDemo();
  const [sel, setSel] = useState<string | null>(d.zones[0]?.id ?? null);
  const z = d.zones.find((x) => x.id === sel);
  const update = (p: Partial<Zone>) => d.set((s) => ({ zones: s.zones.map((x) => (x.id === sel ? { ...x, ...p } : x)) }));
  const add = (x: number, y: number) => {
    const id = `z${Date.now()}`;
    d.set((s) => ({ zones: [...s.zones, { id, name: "New unsafe zone", x, y, r: 6, rating: 3 }] }));
    setSel(id); toast("Zone added — set its name and rating");
  };
  return (
    <>
      <PageHead title="Safe Route Hazard Manager" sub="Click anywhere on the map to add an unsafe zone. Changes show in the NURJA Safe Route map instantly." />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden p-0">
          <TacticalMap className="h-[560px]" zones={d.zones} selectedZone={sel ?? undefined} onMapClick={add} showLabels />
        </Card>
        <div className="space-y-4">
          <Card>
            {z ? (
              <div className="space-y-4">
                <p className="font-display font-bold">Edit zone</p>
                <div className="space-y-1.5"><Label>Name</Label><Input value={z.name} onChange={(e) => update({ name: e.target.value })} /></div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label>Danger rating</Label><span className="text-sm font-bold">{z.rating} · {RATING_LABEL[z.rating]}</span></div>
                  <Slider min={1} max={5} step={1} value={[z.rating]} onValueChange={([v]) => update({ rating: v as Zone["rating"] })} />
                  <div className="h-2 rounded-full" style={{ background: "linear-gradient(90deg, var(--zone-1), var(--zone-3), var(--zone-5))" }} />
                  <div className="flex justify-between text-[10px] text-muted-foreground"><span>1 Light red</span><span>5 Dark red</span></div>
                </div>
                <div className="space-y-2"><Label>Radius</Label><Slider min={3} max={15} step={1} value={[z.r]} onValueChange={([v]) => update({ r: v ?? 6 })} /></div>
                <Button variant="outline" className="w-full text-crimson" onClick={() => { d.set((s) => ({ zones: s.zones.filter((x) => x.id !== sel) })); setSel(null); }}><Trash2 /> Delete zone</Button>
              </div>
            ) : <p className="text-sm text-muted-foreground">Select a zone or click the map to add one.</p>}
          </Card>
          <Card className="p-2">
            {d.zones.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm", sel === x.id && "bg-muted")}>
                <span className="h-3 w-3 rounded-full" style={{ background: x.rating >= 4 ? "var(--zone-5)" : x.rating >= 3 ? "var(--zone-3)" : "var(--zone-1)" }} />
                <span className="flex-1">{x.name}</span><span className="font-bold">{x.rating}</span>
              </button>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}

export function PublisherSection() {
  const d = useDemo();
  const blank = { title: "", body: "", tag: "Awareness", youtube: "", image: "" as string, targets: { app: true, rescue: true, blog: true } };
  const [f, setF] = useState(blank);
  const toEmbed = (u: string) => { const m = u.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/); return m ? `https://www.youtube.com/embed/${m[1]}` : undefined; };
  const preview = { id: "preview", title: f.title || "Your story title", excerpt: f.body.slice(0, 140) || "Story text preview…", body: f.body, image: f.image || undefined, youtube: toEmbed(f.youtube), tag: f.tag, date: "Today", author: "NURJA Control", targets: f.targets };
  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.youtube && !toEmbed(f.youtube)) { toast.error("That YouTube link doesn't look right"); return; }
    d.set((s) => ({ posts: [{ ...preview, id: `p${Date.now()}`, date: new Date().toISOString().slice(0, 10) }, ...s.posts] }));
    const where = [f.targets.app && "NURJA app", f.targets.rescue && "Rescue Network", f.targets.blog && "Website blog"].filter(Boolean).join(", ");
    toast.success("Published", { description: `Live on: ${where}` }); setF(blank);
  };
  return (
    <>
      <PageHead title="Community & Blog Publisher" sub="Publish verified stories to the apps and the public website" />
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <form onSubmit={publish} className="space-y-4">
            <div className="space-y-1.5"><Label>Title</Label><Input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Category</Label>
              <Select value={f.tag} onValueChange={(v) => setF({ ...f, tag: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Incident Story", "Awareness", "Community"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1.5"><Label>Story text</Label><Textarea required rows={6} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Photo</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(IMAGES).map(([k, src]) => <button type="button" key={k} onClick={() => setF({ ...f, image: f.image === src ? "" : src })} className={cn("overflow-hidden rounded-lg border-2", f.image === src ? "border-primary" : "border-transparent")}><img src={src} alt={k} className="h-14 w-20 object-cover" /></button>)}
                <label className="grid h-14 w-20 cursor-pointer place-items-center rounded-lg border-2 border-dashed text-muted-foreground"><Plus className="h-5 w-5" /><input type="file" accept="image/*" className="hidden" onChange={(e) => { const x = e.target.files?.[0]; if (x) setF({ ...f, image: URL.createObjectURL(x) }); }} /></label>
              </div>
            </div>
            <div className="space-y-1.5"><Label className="flex items-center gap-1"><Youtube className="h-4 w-4 text-crimson" /> YouTube link (optional)</Label><Input value={f.youtube} onChange={(e) => setF({ ...f, youtube: e.target.value })} placeholder="https://youtube.com/watch?v=…" /></div>
            <div className="flex flex-wrap gap-4 rounded-xl bg-muted p-3 text-sm">
              {([["app", "NURJA app Community"], ["rescue", "Rescue Network Community"], ["blog", "Public website Blog"]] as const).map(([k, l]) => (
                <label key={k} className="flex items-center gap-2"><Checkbox checked={f.targets[k]} onCheckedChange={(v) => setF({ ...f, targets: { ...f.targets, [k]: !!v } })} />{l}</label>
              ))}
            </div>
            <Button type="submit" size="lg">Publish</Button>
          </form>
        </Card>
        <div><p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Live preview</p><PostCard post={preview} /></div>
      </div>
    </>
  );
}

const API_FIELDS: { group: string; fields: [string, string][] }[] = [
  { group: "Map API", fields: [["map_provider", "Provider (Google Maps / Mapbox)"], ["map_key", "Map API key"]] },
  { group: "Live Streaming (LiveKit / Agora)", fields: [["stream_url", "Server URL"], ["stream_key", "API key"], ["stream_secret", "API secret"]] },
  { group: "Bulk SMS Gateway", fields: [["sms_sender", "Sender ID"], ["sms_key", "Gateway API key"]] },
  { group: "Push Notifications", fields: [["push_project", "FCM project ID"], ["push_key", "Server key"]] },
];

export function SettingsSection() {
  const d = useDemo();
  const [v, setV] = useState<Record<string, string>>(d.apiKeys);
  const [show, setShow] = useState<Record<string, boolean>>({});
  return (
    <>
      <PageHead title="API & System Settings" sub="Keys are saved in this browser only for the prototype." />
      <form className="grid gap-4 lg:grid-cols-2" onSubmit={(e) => { e.preventDefault(); d.set({ apiKeys: v }); toast.success("Settings saved"); }}>
        {API_FIELDS.map((g) => (
          <Card key={g.group} className="space-y-3">
            <div className="flex items-center justify-between"><p className="flex items-center gap-2 font-display font-bold"><KeyRound className="h-4 w-4 text-crimson" />{g.group}</p>
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", g.fields.every(([k]) => d.apiKeys[k]) ? "bg-emerald-soft text-emerald" : "bg-amber-soft text-amber")}>{g.fields.every(([k]) => d.apiKeys[k]) ? "Configured" : "Not set"}</span></div>
            {g.fields.map(([k, l]) => {
              const secret = /key|secret/.test(k);
              return (
                <div key={k} className="space-y-1.5"><Label>{l}</Label>
                  <div className="flex gap-2"><Input type={secret && !show[k] ? "password" : "text"} value={v[k] ?? ""} onChange={(e) => setV({ ...v, [k]: e.target.value })} className="font-mono" />
                    {secret && <Button type="button" variant="outline" size="icon" onClick={() => setShow({ ...show, [k]: !show[k] })}><Eye /></Button>}</div>
                </div>
              );
            })}
          </Card>
        ))}
        <div className="lg:col-span-2"><Button type="submit" size="lg"><Save /> Save settings</Button></div>
      </form>
    </>
  );
}
