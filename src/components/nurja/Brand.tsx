import logo from "@/assets/NURJA_LOGO.png.asset.json";
import icon from "@/assets/NURJA_APP_ICON.png.asset.json";
import lettering from "@/assets/NURJA_Lettering.png.asset.json";
import rescue from "@/assets/Rescue_Network_Logo.png.asset.json";
import { cn } from "@/lib/utils";
import { Slogan } from "@/lib/i18n";

export const LOGOS = { logo: logo.url, icon: icon.url, lettering: lettering.url, rescue: rescue.url };

export function NurjaMark({ className, withText = true, tagline = false, taglineClassName }: { className?: string; withText?: boolean; tagline?: boolean; taglineClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img src={icon.url} alt="NURJA shield" className="h-9 w-9 rounded-xl bg-paper object-contain" />
      {withText && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-xl font-extrabold tracking-tight text-plum">NURJA</span>
          {tagline && <Slogan className={cn("mt-1 text-[10px] font-semibold text-muted-foreground", taglineClassName)} />}
        </span>
      )}
    </span>
  );
}

export function RescueMark({ className, label = "Rescue Network", tagline = false }: { className?: string; label?: string; tagline?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img src={rescue.url} alt="Rescue Network" className="h-8 w-8 rounded-lg bg-paper object-contain p-0.5" />
      {label && <span className="flex flex-col">
        <span className="font-display text-sm font-bold leading-tight">{label}</span>
        {tagline && <Slogan className="mt-0.5 text-[10px] font-medium opacity-60" />}
      </span>}
    </span>
  );
}
