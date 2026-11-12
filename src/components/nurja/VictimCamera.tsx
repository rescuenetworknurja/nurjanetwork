import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Maximize, Minimize, RotateCw, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CameraFeed } from "@/components/nurja/CameraFeed";
import { useT } from "@/lib/i18n";

export function VictimCamera({ camera }: { camera: "back" | "front" }) {
  const { tr } = useT();
  const [open, setOpen] = useState(false);
  const [landscape, setLandscape] = useState(false);
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

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Victim live camera</p>
        <div className="flex shrink-0 gap-1">
          <Button variant="outline" size="icon" title={landscapeLabel} aria-label={landscapeLabel} onClick={() => expand(true)}><RotateCw /></Button>
          <Button variant="outline" size="icon" title={fullscreenLabel} aria-label={fullscreenLabel} onClick={() => expand(false)}><Maximize /></Button>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-lg border-2 border-crimson">
        <CameraFeed camera={camera} className="aspect-video rounded-none" label=" " />
        <span className="absolute inset-x-0 bottom-0 bg-crimson py-1 text-center text-[10px] font-bold text-paper"><Video className="mr-1 inline h-3 w-3" />VICTIM CAM · {camera === "back" ? "Back" : "Front"}</span>
      </div>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Content ref={viewer} aria-describedby={undefined} className="camera-viewer dark fixed inset-0 z-[100] overflow-hidden bg-ink text-paper outline-none" data-landscape={landscape}>
            <div className="camera-viewer-layout flex flex-col">
              <header className="flex shrink-0 items-center justify-between gap-2 border-b border-paper/10 bg-navy px-3 py-2 pt-[max(.5rem,env(safe-area-inset-top))]">
                <Dialog.Title className="min-w-0 text-sm font-bold">{tr("Victim live camera", "ভিক্টিমের লাইভ ক্যামেরা")}</Dialog.Title>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" size="icon" title={landscapeLabel} aria-label={landscapeLabel} aria-pressed={landscape} onClick={() => setLandscape((v) => !v)}><RotateCw /></Button>
                  <Dialog.Close asChild><Button variant="secondary" size="icon" title={exitLabel} aria-label={exitLabel}><Minimize /></Button></Dialog.Close>
                </div>
              </header>
              <CameraFeed camera={camera} fit="contain" className="min-h-0 flex-1 rounded-none" />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}