import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import heroImg from "@/assets/hero-night-street.jpg";

/** Simulated live camera stream. */
export function CameraFeed({ camera = "back", className, label, fit = "cover" }: { camera?: "back" | "front"; className?: string; label?: string; fit?: "cover" | "contain" }) {
  const [t, setT] = useState(0);
  useEffect(() => { const i = setInterval(() => setT((v) => v + 1), 1000); return () => clearInterval(i); }, []);
  const mm = String(Math.floor(t / 60)).padStart(2, "0"), ss = String(t % 60).padStart(2, "0");
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-ink", className)}>
      <img src={heroImg} alt="" className={cn("absolute inset-0 h-full w-full opacity-70", fit === "contain" ? "object-contain" : cn("object-cover animate-noise", camera === "front" ? "scale-150 object-[40%_30%] blur-[1px]" : "scale-110 object-[60%_60%]"))} />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/70" />
      <div className="pointer-events-none absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-paper/5 to-transparent animate-scan" />
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-crimson px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper">
        <span className="h-1.5 w-1.5 rounded-full bg-paper animate-blink" /> Live
      </div>
      <div className="absolute right-3 top-3 rounded bg-ink/60 px-1.5 py-0.5 font-mono text-[10px] text-paper">{mm}:{ss}</div>
      <div className="absolute inset-x-3 bottom-3 text-[10px] font-semibold text-paper/90">
        {label ?? `${camera === "back" ? "Back" : "Front"} camera · 720p · 23.7756°N 90.4206°E`}
      </div>
    </div>
  );
}
