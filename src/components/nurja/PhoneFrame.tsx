import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Full-screen on phones; a centered device frame on larger screens. */
export function PhoneFrame({ children, dark, backdrop }: { children: ReactNode; dark?: boolean; backdrop?: ReactNode }) {
  return (
    <div className={cn("min-h-screen md:flex md:items-center md:justify-center md:py-8", dark ? "dark bg-ink tactical-grid" : "bg-hero bg-muted")}>
      {backdrop}
      <div className={cn(
        "relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-background text-foreground",
        "md:h-[880px] md:min-h-0 md:rounded-[44px] md:border-[10px] md:border-ink md:shadow-2xl",
      )}>
        <div className="hidden md:block absolute left-1/2 top-2 z-50 h-6 w-28 -translate-x-1/2 rounded-full bg-ink" />
        <div className="relative flex h-full min-h-screen flex-col md:min-h-0">{children}</div>
      </div>
    </div>
  );
}
