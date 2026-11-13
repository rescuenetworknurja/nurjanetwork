import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDemo } from "@/lib/demo-store";
import { useBi } from "@/lib/i18n";
import { seedWebsite } from "@/lib/website-content";

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallNurjaButton() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { websiteContent } = useDemo();
  const L = useBi();
  const label = websiteContent.hero.installCta ?? seedWebsite.hero.installCta;
  const instructions = websiteContent.hero.installHelp ?? seedWebsite.hero.installHelp;

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const onInstalled = () => { setPrompt(null); setOpen(false); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!prompt) { setOpen(true); return; }
    setBusy(true);
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      setOpen(true);
    } finally {
      setPrompt(null);
      setBusy(false);
    }
  };

  return (
    <>
      <Button size="lg" variant="outline" className="h-12 rounded-lg px-6" disabled={busy} onClick={install}>
        <Download />{label ? L(label) : "NURJASOS"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{label ? L(label) : "NURJASOS"}</DialogTitle></DialogHeader>
          <p className="text-sm leading-relaxed text-muted-foreground">{instructions ? L(instructions) : null}</p>
          <Button asChild className="rounded-lg"><a href="/NURJASOS" target="_blank" rel="noopener noreferrer"><Download />{label ? L(label) : "NURJASOS"}</a></Button>
        </DialogContent>
      </Dialog>
    </>
  );
}