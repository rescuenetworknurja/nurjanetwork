import { useState } from "react";
import { Check, Eye, FileImage, ImageIcon, KeyRound, Plus, Save, Trash2, UserPlus, X, Youtube } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemo } from "@/lib/demo-store";
import { IMAGES, type KycSubmission, type Responder, type Zone } from "@/lib/mock-data";
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

export function NetworkSection() {
  const d = useDemo();
  const [type, setType] = useState<"1" | "2">("1");
  const [kind, setKind] = useState<Responder["kind"]>("patrol");
  const [f, setF] = useState({ name: "", area: "", phone: "", code: "" });
  const pending = d.volunteerApps.filter((a) => a.status === "pending");

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const code = kind === "volunteer" ? generateVolunteerId() : kind === "officer" ? (f.code || `TF-${Math.floor(100 + Math.random() * 900)}`) : (f.code || `${kind === "station" ? "PS" : kind === "fari" ? "PF" : "PU"}-${Math.floor(10 + Math.random() * 90)}`);
    d.addResponder({ name: f.name, kind, code, area: f.area, phone: f.phone, online: false });
    toast.success(`Account created: ${code}`, { description: `${KIND_LABEL[kind]} · ${f.name}` });
    setF({ name: "", area: "", phone: "", code: "" });
  };

  return (
    <>
      <PageHead title="Rescue Network & Volunteers" sub="Manage Type 1 police units and Type 2 volunteers/officers" />
      <Tabs defaultValue="apps">
        <TabsList><TabsTrigger value="apps">Volunteer applications {pending.length > 0 && <span className="ml-1.5 rounded-full bg-crimson px-1.5 text-[10px] text-paper">{pending.length}</span>}</TabsTrigger><TabsTrigger value="create">Create account</TabsTrigger><TabsTrigger value="roster">Roster</TabsTrigger></TabsList>
        <TabsContent value="apps" className="mt-4 space-y-3">
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
        <TabsContent value="create" className="mt-4">
          <Card className="max-w-2xl">
            <form onSubmit={create} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {(["1", "2"] as const).map((t) => (
                  <button type="button" key={t} onClick={() => { setType(t); setKind(t === "1" ? "patrol" : "volunteer"); }}
                    className={cn("rounded-xl border p-3 text-left", type === t && "border-primary bg-accent")}>
                    <p className="font-bold">Type {t}</p><p className="text-xs text-muted-foreground">{t === "1" ? "Station / Fari / Patrol — mandatory dispatch" : "Volunteer / Officer — accept to respond"}</p>
                  </button>
                ))}
              </div>
              <div className="space-y-1.5"><Label>Account kind</Label>
                <Select value={kind} onValueChange={(v) => setKind(v as Responder["kind"])}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(type === "1" ? ["station", "fari", "patrol"] : ["volunteer", "officer"]).map((k) => <SelectItem key={k} value={k}>{KIND_LABEL[k as Responder["kind"]]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Name</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={type === "1" ? "e.g. Patrol Unit DMP-21" : "Full name"} /></div>
                <div className="space-y-1.5"><Label>Phone</Label><Input required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="01XXXXXXXXX" /></div>
                <div className="space-y-1.5"><Label>Area / jurisdiction</Label><Input required value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>{kind === "volunteer" ? "Volunteer ID" : kind === "officer" ? "TaskForce ID" : "Unit code"}</Label>
                  {kind === "volunteer" ? <Input disabled value="Auto-generated (V-XXXXXX)" /> : <Input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder={kind === "officer" ? "TF-902" : "Auto if empty"} />}
                </div>
              </div>
              <Button type="submit"><UserPlus /> Create account</Button>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="roster" className="mt-4">
          <Card className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>ID / Code</TableHead><TableHead>Area</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{d.responders.map((r) => (
                <TableRow key={r.id}><TableCell className="font-semibold">{r.name}</TableCell><TableCell>{["patrol", "fari", "station"].includes(r.kind) ? "Type 1" : "Type 2"} · {KIND_LABEL[r.kind]}</TableCell><TableCell className="font-mono font-bold">{r.code}</TableCell><TableCell>{r.area}</TableCell>
                  <TableCell><span className={cn("flex items-center gap-1.5 text-xs font-semibold", r.online ? "text-emerald" : "text-muted-foreground")}><span className={cn("h-2 w-2 rounded-full", r.online ? "bg-emerald" : "bg-muted-foreground")} />{r.online ? "Online" : "Offline"}</span></TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
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
