import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { useT } from "@/lib/i18n";

export function IncidentEvidenceGallery({ incidentId }: { incidentId: string }) {
  const d = useDemo();
  const { tr } = useT();
  const records = d.evidence.filter((item) => item.incidentId === incidentId);
  if (!records.length) return null;
  return (
    <section className="mt-3 space-y-2">
      <h3 className="text-xs font-bold">{tr("Saved still evidence", "সংরক্ষিত স্থিরচিত্র প্রমাণ")} · {records.length}</h3>
      {records.map((item) => (
        <details key={item.id} className="overflow-hidden rounded-lg border bg-card">
          <summary className="flex cursor-pointer items-center gap-3 p-2">
            <img src={item.src} alt="" className="h-12 w-20 shrink-0 rounded-md object-contain" />
            <div className="min-w-0 text-xs">
              <p>{new Date(item.capturedAt).toLocaleString(d.lang === "bn" ? "bn-BD" : "en-GB")}</p>
              <p className="text-muted-foreground">{item.responderName} · {item.camera === "back" ? tr("Back", "ব্যাক") : tr("Front", "ফ্রন্ট")}</p>
            </div>
          </summary>
          <img src={item.src} alt={tr("Selected camera frame", "ক্যামেরার নির্বাচিত ফ্রেম")} className="max-h-96 w-full object-contain" />
          <div className="flex justify-end p-2">
            <Button variant="outline" size="icon" title={tr("Download frame", "ফ্রেম ডাউনলোড করুন")} aria-label={tr("Download frame", "ফ্রেম ডাউনলোড করুন")} onClick={() => {
              const link = document.createElement("a"); link.href = item.src; link.download = `${item.incidentId}-${item.id}.png`; link.click();
            }}><Download /></Button>
          </div>
        </details>
      ))}
    </section>
  );
}