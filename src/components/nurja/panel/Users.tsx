import { useState } from "react";
import { Ban, Check, Copy, Download, Eye, FileImage, Flag, KeyRound, PhoneCall, RotateCcw, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemo } from "@/lib/demo-store";
import { ageFromDob } from "@/lib/ids";
import { fmtCoord } from "@/lib/geo";
import { BAN_REASONS, filterUsers, isMinor, userDossierCsv, usersToCsv, type AccountStatus, type AppUser, type UserFilter } from "@/lib/users";
import { cn } from "@/lib/utils";
import { flagLiveIncident } from "@/lib/live.functions";
import { Card, PageHead } from "./Dashboard";

const FILTERS: { id: UserFilter; label: string }[] = [
  { id: "all", label: "All Users" }, { id: "active", label: "Active" }, { id: "pending", label: "KYC Pending" },
  { id: "minor", label: "Under-18 Minors" }, { id: "adult", label: "Adult 18+" }, { id: "banned", label: "Suspended / Banned" }, { id: "false", label: "False SOS Flagged" },
];

const kycTone = (s: string) => s === "approved" ? "bg-emerald-soft text-emerald" : s === "rejected" ? "bg-crimson-soft text-crimson" : "bg-amber-soft text-amber";
const STATUS_LABEL: Record<AccountStatus, string> = { active: "Active", suspended: "Temporarily Suspended", banned: "Permanently Banned" };
const STATUS_TONE: Record<AccountStatus, string> = { active: "bg-emerald-soft text-emerald", suspended: "bg-amber-soft text-amber", banned: "bg-crimson-soft text-crimson" };

function StatusBadge({ s }: { s: AccountStatus }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", STATUS_TONE[s])}>{s === "active" ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}{STATUS_LABEL[s]}</span>;
}

function downloadCsv(name: string, text: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function DocTile({ label, round, src }: { label: string; round?: boolean; src?: string | undefined }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className={cn("grid place-items-center bg-muted", round ? "aspect-square" : "aspect-[1.6]")}>
        {src?<a href={src} target="_blank" rel="noreferrer"><img src={src} alt={label} className="h-full w-full object-contain" /></a>:<p className="text-xs text-muted-foreground">Not provided</p>}
      </div>
      <p className="px-3 py-2 text-xs font-semibold">{label}</p>
    </div>
  );
}

export function UsersSection() {
  const d = useDemo();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [open, setOpen] = useState<AppUser | null>(null);
  const [banTarget, setBanTarget] = useState<AppUser | null>(null);
  const [banAction, setBanAction] = useState<"suspended" | "banned">("suspended");
  const [banReason, setBanReason] = useState<string>(BAN_REASONS[0]);

  const list = filterUsers(d.users, query, filter);
  const casesFor = (u: AppUser) => d.cases.filter((c) => c.userId === u.id);

  const confirmBan = async () => {
    if (!banTarget) return;
    try{await d.setUserStatus(banTarget.id, banAction, banReason);}catch{return;}
    toast[banAction === "banned" ? "error" : "warning"](`${banTarget.name} — ${STATUS_LABEL[banAction]}`, {
      description: `Reason: ${banReason}`,
    });
    setBanTarget(null); setOpen(null);
  };
  const restore = async (u: AppUser) => {
    try{await d.setUserStatus(u.id, "active");}catch{return;}
    toast.success(`${u.name} — account restored`, { description: u.id === "self" ? "The NURJA app is unlocked again." : undefined });
  };
  const resetSecurity = () => toast.info("Use the verified password reset flow in NURJASOS");

  return (
    <>
      <PageHead title="NURJA User Database & Account Control" sub="Search, inspect, edit, suspend or ban any user account">
        <Button variant="outline" onClick={() => { downloadCsv("nurja-users.csv", usersToCsv(list)); toast.success(`Exported ${list.length} users to CSV`); }}><Download /> Export User Data (CSV)</Button>
      </PageHead>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, NID / birth reg or user ID…" />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as UserFilter)}>
          <TabsList className="flex-wrap">{FILTERS.map((f) => <TabsTrigger key={f.id} value={f.id}>{f.label}</TabsTrigger>)}</TabsList>
        </Tabs>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Phone & emergency contact</TableHead><TableHead>KYC</TableHead><TableHead>Account status</TableHead><TableHead>SOS / False</TableHead><TableHead>Last known GPS & registered</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {list.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-plum/15 font-display text-sm font-bold text-plum">{u.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                    <div>
                      <p className="font-semibold">{u.name}{u.id === "self" && <span className="ml-2 rounded bg-accent px-1.5 text-[10px] text-accent-foreground">Demo user</span>}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", isMinor(u) ? "bg-amber-soft text-amber" : "bg-secondary")}>{isMinor(u) ? "Under-18 Minor" : "18+ Adult"} · {ageFromDob(u.dob)}y</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{u.phone}<span className="block text-muted-foreground">{u.emergency.name} ({u.emergency.relation}) {u.emergency.phone}</span></TableCell>
                <TableCell><span className={cn("rounded-full px-2 py-0.5 text-xs font-bold capitalize", kycTone(u.kyc))}>{u.kyc}</span></TableCell>
                <TableCell><StatusBadge s={u.status} />{u.banReason && u.status !== "active" && <span className="mt-1 block max-w-44 text-[10px] text-muted-foreground">{u.banReason}</span>}</TableCell>
                <TableCell className="text-xs font-bold">{u.sosCount} SOS / <span className={u.falseCount > 0 ? "text-crimson" : ""}>{u.falseCount} False</span></TableCell>
                <TableCell className="font-mono text-[11px]">{fmtCoord(u.lat)}, {fmtCoord(u.lng)}<span className="block text-muted-foreground">Reg. {u.registeredAt}</span></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => setOpen(u)}><Eye /> View</Button>
                    {u.status === "active"
                      ? <Button size="sm" variant="outline" className="border-crimson text-crimson" onClick={() => { setBanTarget(u); setBanAction("suspended"); setBanReason(BAN_REASONS[0]); }}><Ban /> Ban</Button>
                      : <Button size="sm" variant="outline" className="border-emerald text-emerald" onClick={() => restore(u)}><RotateCcw /> Unban</Button>}
                    <Button size="sm" variant="ghost" title="Reset PIN / password" onClick={() => resetSecurity()}><KeyRound /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!list.length && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No users match this search</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      {/* Full user dossier drawer */}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">{open.name}</SheetTitle>
                <SheetDescription>{open.phone} · {isMinor(open) ? "Under-18 Minor" : "18+ Adult"} · {ageFromDob(open.dob)}y</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge s={open.status} />
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold capitalize", kycTone(open.kyc))}>KYC {open.kyc}</span>
                  <span className="ml-auto" />
                  <Button size="sm" variant="outline" onClick={() => { downloadCsv(`nurja-dossier-${open.id}.csv`, userDossierCsv(open, casesFor(open))); toast.success("Dossier exported (CSV)"); }}><Download /> Export Dossier</Button>
                </div>

                <div className="rounded-xl border p-4 text-sm">
                  <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Personal & identity</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <p className="text-muted-foreground">Date of birth</p><p className="font-mono font-semibold">{open.dob}</p>
                    <p className="text-muted-foreground">{isMinor(open) ? "Birth registration" : "NID number"}</p><p className="font-mono font-semibold">{open.idNumber}</p>
                    <p className="text-muted-foreground">Present address</p><p className="font-semibold">{open.address}</p>
                    <p className="text-muted-foreground">Last device GPS</p><p className="font-mono font-semibold">{fmtCoord(open.lat)}, {fmtCoord(open.lng)}</p>
                    <p className="text-muted-foreground">Registered</p><p className="font-semibold">{open.registeredAt}</p>
                  </div>
                </div>

                <div className="rounded-xl border p-4 text-sm">
                  <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Emergency family contact</p>
                  <div className="flex items-center gap-2">
                    <p className="flex-1"><b>{open.emergency.name}</b> ({open.emergency.relation}) · <span className="font-mono">{open.emergency.phone}</span></p>
                    <Button size="icon" variant="ghost" title="Copy number" onClick={() => { void navigator.clipboard?.writeText(open.emergency.phone); toast("Number copied"); }}><Copy className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Call" onClick={() => {window.location.href=`tel:${open.emergency.phone}`;}}><PhoneCall className="h-4 w-4" /></Button>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Submitted KYC documents vault</p>
                  {isMinor(open) ? (
                    <div className="space-y-3">
                      <div className="rounded-lg bg-muted p-3 text-sm"><p className="text-xs text-muted-foreground">Birth Registration No.</p><p className="font-mono font-bold tracking-wider">{open.idNumber}</p></div>
                      {open.guardian && (
                        <div className="rounded-lg bg-muted p-3 text-sm">
                          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">Guardian NOC</p>
                          <p>Name: <b>{open.guardian.name}</b> · Phone: <b className="font-mono">{open.guardian.phone}</b> · {open.guardian.relation}</p>
                          <p className="mt-1 flex items-center gap-1 text-emerald"><Check className="h-4 w-4" /> Consent signed {open.guardian.consentAt}</p>
                        </div>
                      )}
                      <DocTile label="Guardian NID" src={d.kycDocuments[open.id]?.["guardianNid"]} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3"><DocTile label="NID Front" src={d.kycDocuments[open.id]?.["nidFront"]} /><DocTile label="NID Back" src={d.kycDocuments[open.id]?.["nidBack"]} /><div className="col-span-2 mx-auto w-1/2"><DocTile label="Live Selfie" round src={d.kycDocuments[open.id]?.["selfie"]} /></div></div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="border-emerald text-emerald" onClick={async () => {try{await d.setUserKyc(open.id,"approved");setOpen({...open,kyc:"approved"});toast.success("KYC re-verified / approved");}catch{}}}><Check /> Re-verify KYC</Button>
                    <Button size="sm" variant="outline" className="border-crimson text-crimson" onClick={async () => {try{await d.setUserKyc(open.id,"rejected");setOpen({...open,kyc:"rejected"});toast.info("KYC approval revoked");}catch{}}}><Ban /> Revoke KYC</Button>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">SOS & incident history ({casesFor(open).length})</p>
                  <div className="space-y-2">
                    {casesFor(open).map((c) => (
                      <div key={c.id} className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-sm">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs font-bold">{c.id} · {c.date}</p>
                          <p className="truncate text-xs text-muted-foreground">{c.area} · {c.outcome} · {c.duration} · Video evidence archived</p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-crimson" onClick={async () => {try{await flagLiveIncident({data:{id:c.id}});await d.refresh();toast.info("Marked as False Alarm / Prank SOS");}catch{toast.error("Flag failed");}}}><Flag className="h-3.5 w-3.5" /> False</Button>
                      </div>
                    ))}
                    {!casesFor(open).length && <p className="text-sm text-muted-foreground">No SOS incidents on record.</p>}
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Security controls</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => resetSecurity()}><KeyRound /> Reset login password</Button>
                    <Button size="sm" variant="outline" onClick={() => resetSecurity()}><KeyRound /> Reset 6-digit SOS PIN</Button>
                  </div>
                </div>

                {open.status === "active" ? (
                  <Button className="w-full bg-crimson hover:bg-crimson/90" onClick={() => { setBanTarget(open); setBanAction("suspended"); setBanReason(BAN_REASONS[0]); }}><Ban /> Suspend / Ban User</Button>
                ) : (
                  <Button className="w-full bg-emerald hover:bg-emerald/90" onClick={() => restore(open)}><RotateCcw /> Unban / Restore Account</Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Ban confirmation modal */}
      <Dialog open={!!banTarget} onOpenChange={(o) => !o && setBanTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Suspend / Ban {banTarget?.name}</DialogTitle>
            <DialogDescription>The user loses access to the NURJA app immediately.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Action type</Label>
              <Select value={banAction} onValueChange={(v) => setBanAction(v as typeof banAction)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="suspended">Temporary Suspension (সাময়িক স্থগিত)</SelectItem>
                  <SelectItem value="banned">Permanent Ban (স্থায়ীভাবে ব্যান)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Ban reason</Label>
              <Select value={banReason} onValueChange={setBanReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BAN_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setBanTarget(null)}>Cancel</Button>
              <Button className="flex-1 bg-crimson hover:bg-crimson/90" onClick={confirmBan}><Ban /> Confirm {banAction === "banned" ? "Ban" : "Suspension"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
