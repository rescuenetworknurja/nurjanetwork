import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { cn } from "@/lib/utils";
import type { MapUnit } from "./TacticalMap";
import type { Zone } from "@/lib/mock-data";

const LiveMap = lazy(() => import("./LiveMap"));

export type LiveMapProps = {
  className?: string | undefined;
  zones?: Zone[] | undefined;
  victim?: { x: number; y: number } | undefined;
  units?: MapUnit[] | undefined;
  route?: [number, number][] | undefined;
  routeTone?: "emerald" | "crimson";
  onMapClick?: ((x: number, y: number) => void) | undefined;
  selectedZone?: string | undefined;
  showLabels?: boolean;
  path?: [number, number][] | undefined;
  me?: [number, number] | undefined;
  endpoints?: [[number, number], [number, number]] | undefined;
  children?: React.ReactNode;
};

function MapFallback({ className }: { className?: string | undefined }) {
  return (
    <div className={cn("relative grid place-items-center overflow-hidden bg-map-land tactical-grid", className)}>
      <span className="rounded-full bg-card/80 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
        মানচিত্র লোড হচ্ছে…
      </span>
    </div>
  );
}

export function LiveMapLazy({ className, children, ...props }: LiveMapProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0">
        <ClientOnly fallback={<MapFallback className="h-full w-full" />}>
          <Suspense fallback={<MapFallback className="h-full w-full" />}>
            <LiveMap {...props} />
          </Suspense>
        </ClientOnly>
      </div>
      {children}
    </div>
  );
}
