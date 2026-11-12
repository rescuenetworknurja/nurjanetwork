import { Link } from "@tanstack/react-router";
import { Facebook, Menu, Phone, X, Youtube, Mail, MapPin } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { NurjaMark } from "./Brand";
import { VolunteerDialog } from "./VolunteerDialog";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/our-story", label: "Our Story" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 pr-40 sm:px-6 lg:pr-48">
          <Link to="/"><NurjaMark /></Link>
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} activeOptions={{ exact: true }}
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
                activeProps={{ className: "bg-accent text-accent-foreground" }}>{l.label}</Link>
            ))}
          </nav>
          <div className="ml-auto hidden md:block">
            <VolunteerDialog><Button className="rounded-full">Become a Volunteer</Button></VolunteerDialog>
          </div>
          <button className="ml-auto md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <div className="space-y-1 border-t px-4 py-3 md:hidden">
            {LINKS.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 font-semibold">{l.label}</Link>)}
            <VolunteerDialog><Button className="w-full">Become a Volunteer</Button></VolunteerDialog>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="bg-navy text-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <NurjaMark className="[&_span]:text-paper" />
            <p className="max-w-sm text-sm text-paper/60">Women safety and rapid rescue network for Bangladesh. One tap connects you with police and verified volunteers nearby.</p>
            <div className="flex gap-2 pt-2">
              {[Facebook, Youtube, Mail].map((I, i) => <span key={i} className="grid h-9 w-9 place-items-center rounded-full bg-paper/10"><I className="h-4 w-4" /></span>)}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-display font-bold">Explore</p>
            {LINKS.map((l) => <Link key={l.to} to={l.to} className="block text-paper/60 hover:text-paper">{l.label}</Link>)}
            <Link to="/NURJASOS" className="block text-paper/60 hover:text-paper">Open NURJA app</Link>
          </div>
          <div className="space-y-2 text-sm text-paper/60">
            <p className="font-display font-bold text-paper">Emergency</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-crimson" /> National helpline 999</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-crimson" /> Women & child 109</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Motijheel, Dhaka 1000</p>
          </div>
        </div>
        <div className="border-t border-paper/10 py-5 text-center text-xs text-paper/40">© 2026 NURJA Rescue Network. All rights reserved.</div>
      </footer>
    </div>
  );
}
