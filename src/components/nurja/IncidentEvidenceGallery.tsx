import { useState } from "react";
import { Clock, Download, Pencil, Save, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemo } from "@/lib/demo-store";
import { useT } from "@/lib/i18n";
import { filterIncidentEvidence } from "@/lib/evidence";

export function IncidentEvidenceGallery({ incidentId }: { incidentId: string }) {
  const d = useDemo();
  const { tr } = useT();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const records = d.evidence.filter((item) => item.incidentId === incidentId);
  const filtered = filterIncidentEvidence(d.evidence, incidentId, query);
  if (!records.length) return null;
  return (
    <section className="mt-3 space-y-2">
      <h3 className="text-xs font-bold">{tr("Saved still evidence", "সংরক্ষিত স্থিরচিত্র প্রমাণ")} · {records.length}</h3>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} aria-label={tr("Search evidence", "প্রমাণ খুঁজুন")} placeholder={tr("Search tags, capture time or responder", "ট্যাগ, ক্যাপচার সময় বা রেসপন্ডার খুঁজুন")} className="pl-9" />
      </div>
      {!filtered.length && <p className="py-3 text-sm text-muted-foreground">{tr("No matching frames", "মিল পাওয়া কোনো ফ্রেম নেই")}</p>}
      {filtered.map((item) => (
        <details key={item.id} className="overflow-hidden rounded-lg border bg-card">
          <summary className="flex cursor-pointer items-center gap-3 p-2">
            <img src={item.src} alt="" className="h-12 w-20 shrink-0 rounded-md object-contain" />
            <div className="min-w-0 text-xs">
              <p className="flex items-center gap-1 font-semibold"><Clock className="h-3 w-3 shrink-0" />{tr("Captured at", "ক্যাপচারের সময়")}</p>
              <time dateTime={item.capturedAt}>{new Date(item.capturedAt).toLocaleString(d.lang === "bn" ? "bn-BD" : "en-GB")}</time>
              <p className="text-muted-foreground">{item.responderName} · {item.camera === "back" ? tr("Back", "ব্যাক") : tr("Front", "ফ্রন্ট")}</p>
              <div className="mt-1 flex flex-wrap gap-1">{item.tags?.map((tag) => <span key={tag} className="break-all rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground">{tag}</span>)}</div>
            </div>
          </summary>
          <img src={item.src} alt={tr("Selected camera frame", "ক্যামেরার নির্বাচিত ফ্রেম")} className="max-h-96 w-full object-contain" />
          {editing === item.id && <form className="flex items-center gap-2 p-2" onSubmit={(event) => {
            event.preventDefault();
            if (!d.setEvidenceTags(item.id, draft.split(/[,،，\n]/))) {
              toast.error(tr("Tags could not be saved", "ট্যাগ সংরক্ষণ করা যায়নি")); return;
            }
            setEditing(null);
          }}>
            <Input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} aria-label={tr("Frame tags", "ফ্রেমের ট্যাগ")} placeholder={tr("Tags (comma-separated)", "ট্যাগ (কমা দিয়ে আলাদা)")} className="min-w-0" />
            <Button type="submit" variant="outline" size="icon" title={tr("Save tags", "ট্যাগ সংরক্ষণ করুন")} aria-label={tr("Save tags", "ট্যাগ সংরক্ষণ করুন")}><Save /></Button>
            <Button type="button" variant="ghost" size="icon" title={tr("Cancel", "বাতিল")} aria-label={tr("Cancel", "বাতিল")} onClick={() => setEditing(null)}><X /></Button>
          </form>}
          <div className="flex justify-end gap-2 p-2">
            <Button variant="outline" size="icon" title={tr("Edit tags", "ট্যাগ সম্পাদনা করুন")} aria-label={tr("Edit tags", "ট্যাগ সম্পাদনা করুন")} onClick={() => { setEditing(item.id); setDraft((item.tags ?? []).join(", ")); }}><Pencil /></Button>
            <Button variant="outline" size="icon" title={tr("Download frame", "ফ্রেম ডাউনলোড করুন")} aria-label={tr("Download frame", "ফ্রেম ডাউনলোড করুন")} onClick={() => {
              const link = document.createElement("a"); link.href = item.src; link.download = `${item.incidentId}-${item.id}.png`; link.click();
            }}><Download /></Button>
          </div>
        </details>
      ))}
    </section>
  );
}