import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronsLeft, FileCheck2, LayoutDashboard, Map, Moon, Newspaper, Settings, Siren, Sun, Users } from "lucide-react";
import { RescueMark } from "@/components/nurja/Brand";
import { DashboardSection, IncidentSection } from "@/components/nurja/panel/Dashboard";
import { HazardSection, KycSection, NetworkSection, PublisherSection, SettingsSection } from "@/components/nurja/panel/Manage";
import { useDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rpanel")({
  head: () => ({
    meta: [
      { title: "Control Panel — NURJA Command Center" },
      { name: "description", content: "Central command for live SOS incidents, dispatch, KYC approvals, volunteers, hazard zones and publishing." },
      { property: "og:title", content: "Control Panel — NURJA Command Center" },
      { property: "og:description", content: "Central command for live SOS incidents, dispatch, KYC approvals and volunteers." },
    ],
  }),
  component: Panel,
});

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "incident", label: "Live Incident & Dispatch", icon: Siren },
  { id: "kyc", label: "KYC Approval Queue", icon: FileCheck2 },
  { id: "network", label: "Rescue Network", icon: Users },
  { id: "hazard", label: "Hazard Manager", icon: Map },
  { id: "publisher", label: "Community & Blog", icon: Newspaper },
  { id: "settings", label: "API & Settings", icon: Settings },
];

function Panel() {
  const d = useDemo();
  const [sec, setSec] = useState("dashboard");
  const [dark, setDark] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const badge = (id: string) => id === "kyc" ? d.kyc.filter((k) => k.status === "pending").length : id === "network" ? d.volunteerApps.filter((a) => a.status === "pending").length : id === "incident" && d.sos ? 1 : 0;
  return (
    <div className={cn("flex min-h-screen bg-background text-foreground", dark && "dark")}>
      <aside className={cn("sticky top-0 flex h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-all", collapsed ? "w-[72px]" : "w-64")}>
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <RescueMark label={collapsed ? "" : "NURJA Command"} />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setSec(n.id)} title={n.label}
              className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                sec === n.id ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
              <n.icon className={cn("h-4 w-4 shrink-0", n.id === "incident" && d.sos && "animate-blink")} />
              {!collapsed && <span className="flex-1 text-left">{n.label}</span>}
              {!collapsed && badge(n.id) > 0 && <span className={cn("rounded-full px-1.5 text-[10px] font-bold", n.id === "incident" ? "bg-paper text-crimson" : "bg-amber text-ink")}>{n.id === "incident" ? "LIVE" : badge(n.id)}</span>}
            </button>
          ))}
        </nav>
        <div className="space-y-1 border-t border-sidebar-border p-3">
          <button onClick={() => setDark(!dark)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{!collapsed && (dark ? "Light mode" : "Dark mode")}</button>
          <button onClick={() => setCollapsed(!collapsed)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent"><ChevronsLeft className={cn("h-4 w-4 transition", collapsed && "rotate-180")} />{!collapsed && "Collapse"}</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6 pt-16 lg:p-8 lg:pt-16">
        {sec === "dashboard" && <DashboardSection go={setSec} />}
        {sec === "incident" && <IncidentSection />}
        {sec === "kyc" && <KycSection />}
        {sec === "network" && <NetworkSection />}
        {sec === "hazard" && <HazardSection />}
        {sec === "publisher" && <PublisherSection />}
        {sec === "settings" && <SettingsSection />}
      </main>
    </div>
  );
}
