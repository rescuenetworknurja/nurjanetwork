import { Building2, Car, Shield, Siren, User } from "lucide-react";
import type { Zone } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export type MapUnit = { id: string; label: string; kind: "patrol" | "fari" | "station" | "volunteer" | "officer" | "self"; x: number; y: number; eta?: number | undefined };

const zoneColor = (r: number) => (r >= 5 ? "var(--zone-5)" : r >= 4 ? "color-mix(in oklab, var(--zone-5) 55%, var(--zone-3))" : r >= 3 ? "var(--zone-3)" : r >= 2 ? "color-mix(in oklab, var(--zone-3) 50%, var(--zone-1))" : "var(--zone-1)");
const zoneOpacity = (r: number) => 0.3 + r * 0.08;

const ICONS = { patrol: Car, fari: Siren, station: Building2, volunteer: User, officer: Shield, self: User };

export function TacticalMap({
  className, zones = [], victim, units = [], route, routeTone = "emerald", onMapClick, selectedZone, showLabels = false, children,
}: {
  className?: string | undefined; zones?: Zone[] | undefined; victim?: { x: number; y: number } | undefined; units?: MapUnit[] | undefined;
  route?: [number, number][] | undefined; routeTone?: "emerald" | "crimson"; onMapClick?: ((x: number, y: number) => void) | undefined;
  selectedZone?: string | undefined; showLabels?: boolean; children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-map-land", className)}>
      <svg
        viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("absolute inset-0 h-full w-full", onMapClick && "cursor-crosshair")}
        onClick={(e) => {
          if (!onMapClick) return;
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          onMapClick(+(((e.clientX - r.left) / r.width) * 100).toFixed(1), +(((e.clientY - r.top) / r.height) * 100).toFixed(1));
        }}
      >
        {/* river */}
        <path d="M0 88 C 20 80, 35 92, 55 86 S 85 74, 100 82 L100 100 L0 100Z" fill="var(--map-water)" />
        <path d="M78 0 C 82 20, 74 30, 86 50 S 92 70, 100 72 L100 0Z" fill="var(--map-water)" opacity=".6" />
        {/* parks */}
        <rect x="28" y="30" width="10" height="8" rx="2" fill="var(--emerald)" opacity=".14" />
        <rect x="60" y="14" width="8" height="6" rx="2" fill="var(--emerald)" opacity=".14" />
        {/* roads */}
        <g stroke="var(--map-road)" strokeLinecap="round" fill="none">
          <path d="M0 50 H100" strokeWidth="2.4" />
          <path d="M50 0 V100" strokeWidth="2.4" />
          <path d="M0 20 C 30 24, 60 18, 100 26" strokeWidth="1.4" />
          <path d="M0 74 C 30 70, 60 78, 100 66" strokeWidth="1.4" />
          <path d="M20 0 C 22 40, 18 70, 26 100" strokeWidth="1.2" />
          <path d="M76 0 C 72 40, 80 60, 74 100" strokeWidth="1.2" />
          <path d="M0 0 L100 100" strokeWidth=".8" opacity=".7" />
          <path d="M35 0 L35 100 M65 0 L65 100 M0 35 H100 M0 62 H100" strokeWidth=".6" opacity=".6" />
        </g>
        {zones.map((z) => (
          <g key={z.id}>
            <circle cx={z.x} cy={z.y} r={z.r} fill={zoneColor(z.rating)} opacity={zoneOpacity(z.rating)} />
            {selectedZone === z.id && <circle cx={z.x} cy={z.y} r={z.r + 0.8} fill="none" stroke="var(--amber)" strokeWidth=".6" strokeDasharray="1.5 1" />}
          </g>
        ))}
        {route && (
          <>
            <polyline points={route.map((p) => p.join(",")).join(" ")} fill="none" stroke={`var(--${routeTone})`} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" opacity=".25" />
            <polyline points={route.map((p) => p.join(",")).join(" ")} fill="none" stroke={`var(--${routeTone})`} strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="3 2" className="animate-dash" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 4 }} />
          </>
        )}
        {victim && units.filter((u) => u.kind !== "volunteer").map((u) => (
          <line key={`l${u.id}`} x1={u.x} y1={u.y} x2={victim.x} y2={victim.y} stroke="var(--crimson)" strokeWidth=".3" strokeDasharray="1 1" opacity=".6" />
        ))}
      </svg>

      {zones.map((z) => showLabels && (
        <span key={`t${z.id}`} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded bg-card/80 px-1 text-[9px] font-semibold text-foreground" style={{ left: `${z.x}%`, top: `${z.y}%` }}>
          {z.name} · {z.rating}
        </span>
      ))}

      {units.map((u) => {
        const I = ICONS[u.kind];
        const tone = u.kind === "volunteer" ? "bg-emerald" : u.kind === "self" ? "bg-plum" : "bg-navy";
        return (
          <div key={u.id} className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000" style={{ left: `${u.x}%`, top: `${u.y}%` }}>
            <div className={cn("grid place-items-center rounded-full border-2 border-paper text-paper shadow-md", tone, u.kind === "volunteer" ? "h-5 w-5" : "h-7 w-7")}>
              <I className={u.kind === "volunteer" ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} />
            </div>
            {u.eta !== undefined && u.kind !== "volunteer" && (
              <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded bg-ink/85 px-1 text-[9px] font-bold text-paper">{u.eta} min</span>
            )}
          </div>
        );
      })}

      {victim && (
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${victim.x}%`, top: `${victim.y}%` }}>
          <span className="absolute inset-0 rounded-full bg-crimson animate-ripple" />
          <span className="absolute inset-0 rounded-full bg-crimson animate-ripple [animation-delay:1.2s]" />
          <div className="relative grid h-8 w-8 place-items-center rounded-full border-2 border-paper bg-crimson text-paper shadow-sos">
            <Siren className="h-4 w-4" />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
