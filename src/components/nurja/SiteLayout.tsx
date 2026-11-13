import { Link } from "@tanstack/react-router";
import { Facebook, Menu, Phone, X, Youtube, Mail, MapPin } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LangToggle } from "@/lib/i18n";
import { NurjaMark } from "./Brand";
import { Slogan, useBi } from "@/lib/i18n";
import { useDemo } from "@/lib/demo-store";
import { VolunteerDialog } from "./VolunteerDialog";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/our-story", label: "About us" },
  { to: "/blog", label: "Stories" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const c = useDemo().websiteContent.contact;
  const L = useBi();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link to="/"><NurjaMark tagline taglineClassName="hidden sm:block" /></Link>
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} activeOptions={{ exact: true }}
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
                activeProps={{ className: "bg-accent text-accent-foreground" }}>{l.label}</Link>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-3 md:flex">
            <LangToggle />
            <VolunteerDialog><Button className="rounded-lg">Become a Volunteer</Button></VolunteerDialog>
          </div>
          <LangToggle className="ml-auto md:hidden" />
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
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
            <p className="font-display text-sm font-semibold text-crimson-soft"><Slogan /></p>
            <p className="max-w-sm text-sm text-paper/60">{L(c.footerAbout)}</p>
            <div className="flex gap-2 pt-2">
              {[{ I: Facebook, u: c.facebook }, { I: Youtube, u: c.youtube }, { I: Mail, u: c.email && `mailto:${c.email}` }].filter((x) => x.u).map(({ I, u }) => <a key={u} href={u} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-lg bg-paper/10 hover:bg-paper/20"><I className="h-4 w-4" /></a>)}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-display font-bold">Explore</p>
            {LINKS.map((l) => <Link key={l.to} to={l.to} className="block text-paper/60 hover:text-paper">{l.label}</Link>)}
          </div>
          <div className="space-y-2 text-sm text-paper/60">
            <p className="font-display font-bold text-paper">Emergency</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-crimson" /> National helpline {c.hotline}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-crimson" /> {c.phone}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-crimson" /> Women & child 109</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> {L(c.address)}</p>
          </div>
        </div>
        <div className="border-t border-paper/10 py-5 text-center text-xs text-paper/40">© 2026 NURJA Rescue Network. All rights reserved.</div>
      </footer>
    </div>
  );
}
