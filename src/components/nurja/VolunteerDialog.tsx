import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Upload, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDemo } from "@/lib/demo-store";
import { isValidBdPhone } from "@/lib/ids";

export function VolunteerDialog({ children }: { children: ReactNode }) {
  const { submitVolunteer } = useDemo();
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", phone: "", email: "", address: "", nid: "", occupation: "", motivation: "" });
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidBdPhone(f.phone)) return toast.error("Phone must be 11 digits like 01XXXXXXXXX");
    if (!photo) return toast.error("Please upload a photo of your NID");
    submitVolunteer({ ...f, hasPhoto: true });
    toast.success("Application sent to Control Panel", { description: "Your Volunteer ID (e.g., V-J75UN2) will be generated upon approval." });
    setOpen(false); setPhoto(null);
    setF({ name: "", phone: "", email: "", address: "", nid: "", occupation: "", motivation: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Become a Volunteer</DialogTitle>
          <DialogDescription>Join the Rescue Network. Every application is checked by the NURJA Control Panel.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><Input required value={f.name} onChange={up("name")} placeholder="Your full name" /></Field>
          <Field label="Phone"><Input required value={f.phone} onChange={up("phone")} placeholder="01XXXXXXXXX" inputMode="numeric" maxLength={11} /></Field>
          <Field label="Email"><Input required type="email" value={f.email} onChange={up("email")} placeholder="you@example.com" /></Field>
          <Field label="NID number"><Input required value={f.nid} onChange={up("nid")} placeholder="10 or 17 digit NID" inputMode="numeric" /></Field>
          <Field label="Present address" full><Input required value={f.address} onChange={up("address")} placeholder="House, road, area, city" /></Field>
          <Field label="NID photo" full>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-4 transition hover:border-primary hover:bg-accent">
              {photo ? <img src={photo} alt="NID preview" className="h-14 w-20 rounded-md object-cover" /> : <div className="grid h-14 w-20 place-items-center rounded-md bg-muted"><Upload className="h-5 w-5 text-muted-foreground" /></div>}
              <div className="text-sm">
                <p className="font-semibold">{photo ? <span className="flex items-center gap-1 text-emerald"><CheckCircle2 className="h-4 w-4" /> NID photo attached</span> : "Upload NID front photo"}</p>
                <p className="text-muted-foreground">JPG or PNG, clear and readable</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setPhoto(URL.createObjectURL(file)); }} />
            </label>
          </Field>
          <Field label="Occupation" full><Input required value={f.occupation} onChange={up("occupation")} placeholder="e.g. Student, Nurse, Shop owner" /></Field>
          <Field label="Why do you want to volunteer?" full><Textarea required value={f.motivation} onChange={up("motivation")} rows={3} placeholder="Tell us your motivation" /></Field>
          <Button type="submit" size="lg" className="sm:col-span-2">Submit application</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return <div className={full ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}><Label>{label}</Label>{children}</div>;
}
