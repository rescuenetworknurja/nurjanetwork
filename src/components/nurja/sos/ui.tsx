import { Camera, CheckCircle2, CloudOff, Wifi } from "lucide-react";
import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

export function UploadCard({ title, hint, value, onChange, selfie }: { title: string; hint: string; value: string | null; onChange: (v: string) => void; selfie?: boolean }) {
  return (
    <label className={cn("block cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition hover:border-primary", value && "border-solid border-emerald")}>
      <div className={cn("relative grid place-items-center bg-muted", selfie ? "aspect-square" : "aspect-[1.6]")}>
        {value ? <img src={value} alt={title} className="absolute inset-0 h-full w-full object-cover" /> : (
          <div className="text-center">
            <div className={cn("mx-auto grid h-16 w-16 place-items-center bg-card shadow-card", selfie ? "rounded-full" : "rounded-2xl")}><Camera className="h-7 w-7 text-crimson" /></div>
            <p className="mt-3 text-sm font-semibold">Tap to click or upload</p>
          </div>
        )}
        {selfie && !value && <div className="pointer-events-none absolute inset-8 rounded-full border-2 border-dashed border-crimson/40" />}
        {value && <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald px-2 py-1 text-xs font-bold text-paper"><CheckCircle2 className="h-3.5 w-3.5" /> Captured</span>}
      </div>
      <div className="p-4">
        <p className="font-display font-bold">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <input type="file" accept="image/*" capture={selfie ? "user" : "environment"} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(URL.createObjectURL(f)); }} />
    </label>
  );
}

export function PinInput({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <InputOTP maxLength={6} value={value} onChange={onChange} autoFocus={autoFocus} containerClassName="justify-center">
      <InputOTPGroup className="gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <InputOTPSlot key={i} index={i} className="h-12 w-11 rounded-xl border text-lg font-bold first:rounded-xl last:rounded-xl" />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

export function PwaBadge({ compact }: { compact?: boolean }) {
  const [online] = useState(true);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-emerald-soft font-semibold text-emerald", compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs")}>
      {online ? <Wifi className="h-3 w-3" /> : <CloudOff className="h-3 w-3" />} Offline PWA Cache Ready
    </span>
  );
}
