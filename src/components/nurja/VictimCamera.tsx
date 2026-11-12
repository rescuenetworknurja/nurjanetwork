import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Camera, Check, Download, Maximize, Minimize, RotateCw, Save, Video, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CameraFeed } from "@/components/nurja/CameraFeed";
import { useT } from "@/lib/i18n";
import { useDemo } from "@/lib/demo-store";
import { IncidentEvidenceGallery } from "./IncidentEvidenceGallery";

export function VictimCamera({ camera }: { camera: "back" | "front" }) {
  const { tr } = useT();
  const d = useDemo();
  const [open, setOpen] = useState(false);
  const [landscape, setLandscape] = useState(false);
  const [frame, setFrame] = useState<{ id: string; src: string; at: string; incidentId: string; camera: "back" | "front"; saved: boolean } | null>(null);
  const feed = useRef<HTMLDivElement>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const nativeActive = useRef(false);
  const orientationLocked = useRef(false);

  useEffect(() => {
    if (!open) return;
    let disposed = false;
    const element = viewer.current;
    const onFullscreenChange = () => {
      if (document.fullscreenElement === element) nativeActive.current = true;
      else if (nativeActive.current) {
        nativeActive.current = false;
        setOpen(false);
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    // The full-viewport dialog also works where native fullscreen is unavailable.
    element?.requestFullscreen?.().then(() => {
      if (disposed && document.fullscreenElement === element) void document.exitFullscreen().catch(() => {});
    }).catch(() => {});
    return () => {
      disposed = true;
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      nativeActive.current = false;
      if (orientationLocked.current) {
        screen.orientation?.unlock();
        orientationLocked.current = false;
      }
      if (element && document.fullscreenElement === element) void document.exitFullscreen().catch(() => {});
    };
  }, [open]);

  useEffect(() => {
    if (!open || !landscape) return;
    let disposed = false;
    const orientation = screen.orientation as ScreenOrientation & { lock?: (mode: string) => Promise<void> };
    orientation?.lock?.("landscape").then(() => {
      if (disposed) orientation.unlock();
      else orientationLocked.current = true;
    }).catch(() => {});
    return () => {
      disposed = true;
      if (orientationLocked.current) {
        orientation?.unlock();
        orientationLocked.current = false;
      }
    };
  }, [open, landscape]);

  const expand = (rotate: boolean) => { setLandscape(rotate); setOpen(true); };
  const fullscreenLabel = tr("Fullscreen camera", "ক্যামেরা পূর্ণপর্দায় দেখুন");
  const landscapeLabel = tr("Landscape view", "ল্যান্ডস্কেপ দেখুন");
  const exitLabel = tr("Exit fullscreen", "পূর্ণপর্দা বন্ধ করুন");
  const captureLabel = tr("Select current frame", "বর্তমান ফ্রেম নির্বাচন করুন");
  const downloadLabel = tr("Download frame", "ফ্রেম ডাউনলোড করুন");
  const clearLabel = tr("Return to live camera", "লাইভ ক্যামেরায় ফিরে যান");
  const saveLabel = tr("Save as incident evidence", "ঘটনার প্রমাণ হিসেবে সংরক্ষণ করুন");

  const capture = () => {
    if (!d.sos) return;
    const image = (open ? viewer.current : feed.current)?.querySelector("img");
    if (!image?.complete || !image.naturalWidth) {
      toast.error(tr("Camera frame is not ready", "ক্যামেরার ফ্রেম এখনো প্রস্তুত নয়"));
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(1280, image.naturalWidth);
    canvas.height = Math.round(image.naturalHeight * canvas.width / image.naturalWidth);
    const context = canvas.getContext("2d");
    if (!context) return;
    try {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      setFrame({ id: crypto.randomUUID(), src: canvas.toDataURL("image/png"), at: new Date().toISOString(), incidentId: d.sos.id, camera, saved: false });
    } catch {
      toast.error(tr("Could not select this frame", "এই ফ্রেমটি নির্বাচন করা যায়নি"));
    }
  };
  const save = () => {
    if (!frame || frame.saved) return;
    const responder = d.responders.find((item) => item.id === d.responderId);
    const success = d.saveEvidence({ id: frame.id, incidentId: frame.incidentId, src: frame.src, capturedAt: frame.at, savedAt: new Date().toISOString(), camera: frame.camera, responderId: d.responderId, responderName: responder?.name ?? d.responderId });
    if (!success) {
      toast.error(tr("Evidence could not be saved. Check the active incident or browser storage.", "প্রমাণ সংরক্ষণ করা যায়নি। সক্রিয় ঘটনা বা ব্রাউজারের খালি জায়গা পরীক্ষা করুন।"));
      return;
    }
    setFrame({ ...frame, saved: true });
    toast.success(tr("Frame saved as incident evidence", "ঘটনার প্রমাণ হিসেবে ফ্রেম সংরক্ষিত হয়েছে"));
  };
  const download = () => {
    if (!frame) return;
    const link = document.createElement("a");
    link.href = frame.src;
    link.download = `NURJA-frame-${frame.at.replace(/[:.]/g, "-")}.png`;
    link.click();
  };
  const frameControls = frame && (
    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-paper/10 bg-navy px-3 py-2 text-paper">
      <div className="min-w-0">
        <p className="text-xs font-bold">{tr("Selected frame", "নির্বাচিত ফ্রেম")}</p>
        <p className="text-[10px] text-paper/60">{frame.incidentId}{frame.saved ? ` · ${tr("Saved", "সংরক্ষিত")}` : ""}</p>
        <time dateTime={frame.at} className="text-[10px] text-paper/60">{new Date(frame.at).toLocaleTimeString()}</time>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="secondary" size="icon" title={saveLabel} aria-label={saveLabel} disabled={frame.saved} onClick={save}>{frame.saved ? <Check /> : <Save />}</Button>
        <Button variant="secondary" size="icon" title={downloadLabel} aria-label={downloadLabel} onClick={download}><Download /></Button>
        <Button variant="secondary" size="icon" title={clearLabel} aria-label={clearLabel} onClick={() => setFrame(null)}><X /></Button>
      </div>
    </div>
  );

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Victim live camera</p>
        <div className="flex shrink-0 gap-1">
          <Button variant="outline" size="icon" title={captureLabel} aria-label={captureLabel} onClick={capture}><Camera /></Button>
          <Button variant="outline" size="icon" title={landscapeLabel} aria-label={landscapeLabel} onClick={() => expand(true)}><RotateCw /></Button>
          <Button variant="outline" size="icon" title={fullscreenLabel} aria-label={fullscreenLabel} onClick={() => expand(false)}><Maximize /></Button>
        </div>
      </div>
      <div ref={feed} className="relative overflow-hidden rounded-lg border-2 border-crimson">
        <CameraFeed camera={camera} className="aspect-video rounded-none" label=" " />
        <span className="absolute inset-x-0 bottom-0 bg-crimson py-1 text-center text-[10px] font-bold text-paper"><Video className="mr-1 inline h-3 w-3" />VICTIM CAM · {camera === "back" ? "Back" : "Front"}</span>
      </div>
      {frame && <div className="mt-3 overflow-hidden rounded-lg border bg-ink">
        <img src={frame.src} alt={tr("Selected camera frame", "ক্যামেরার নির্বাচিত ফ্রেম")} className="aspect-video w-full object-contain" />
        {frameControls}
      </div>}
      {d.sos && <IncidentEvidenceGallery incidentId={d.sos.id} />}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Content ref={viewer} aria-describedby={undefined} className="camera-viewer dark fixed inset-0 z-[100] overflow-hidden bg-ink text-paper outline-none" data-landscape={landscape}>
            <div className="camera-viewer-layout flex flex-col">
              <header className="flex shrink-0 items-center justify-between gap-2 border-b border-paper/10 bg-navy px-3 py-2 pt-[max(.5rem,env(safe-area-inset-top))]">
                <Dialog.Title className="min-w-0 text-sm font-bold">{tr("Victim live camera", "ভিক্টিমের লাইভ ক্যামেরা")}</Dialog.Title>
                <div className="flex shrink-0 gap-2">
                  {!frame && <Button variant="secondary" size="icon" title={captureLabel} aria-label={captureLabel} onClick={capture}><Camera /></Button>}
                  <Button variant="secondary" size="icon" title={landscapeLabel} aria-label={landscapeLabel} aria-pressed={landscape} onClick={() => setLandscape((v) => !v)}><RotateCw /></Button>
                  <Dialog.Close asChild><Button variant="secondary" size="icon" title={exitLabel} aria-label={exitLabel}><Minimize /></Button></Dialog.Close>
                </div>
              </header>
              {frame ? <img src={frame.src} alt={tr("Selected camera frame", "ক্যামেরার নির্বাচিত ফ্রেম")} className="min-h-0 w-full flex-1 object-contain" /> : <CameraFeed camera={camera} fit="contain" className="min-h-0 flex-1 rounded-none" />}
              {frameControls}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}