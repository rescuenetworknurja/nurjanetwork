import { Slogan } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Archive, Radio, ShieldCheck, Siren, Users, Video, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/nurja/SiteLayout";
import { VolunteerDialog } from "@/components/nurja/VolunteerDialog";
import { PostCard } from "@/components/nurja/PostCard";
import { useDemo } from "@/lib/demo-store";
import hero from "@/assets/hero-night-street.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NURJA — Women Safety & Rapid Rescue Network" },
      { name: "description", content: "One tap SOS that alerts nearby police and verified volunteers, streams live video and saves evidence." },
      { property: "og:title", content: "NURJA — Women Safety & Rapid Rescue Network" },
      { property: "og:description", content: "One tap SOS that alerts nearby police and verified volunteers, streams live video and saves evidence." },
    ],
  }),
  component: Home,
});

const STEPS = [
  { icon: Siren, title: "Trigger SOS", text: "Tap the SOS button. A 3-second countdown prevents accidental alerts." },
  { icon: Zap, title: "Instant nearest dispatch", text: "Nearest patrol units, police fari, station and volunteers are alerted at once." },
  { icon: Video, title: "Live camera & GPS stream", text: "Responders and control room see live video and your location as you move." },
  { icon: Archive, title: "Safe rescue & evidence", text: "Video and route are archived securely as legal evidence." },
];

function useTicker(base: number, step: number) {
  const [v, setV] = useState(base);
  useEffect(() => { const i = setInterval(() => setV((x) => x + Math.floor(Math.random() * step)), 2200); return () => clearInterval(i); }, [step]);
  return v;
}

function Home() {
  const { posts, sos } = useDemo();
  const rescued = useTicker(12847, 3), volunteers = useTicker(4312, 2);
  const blog = posts.filter((p) => p.targets.blog).slice(0, 3);
  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-hero">
        <div aria-hidden className="pointer-events-none absolute inset-0 arch-grid" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="space-y-7 animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald animate-blink" /> Live across Dhaka & Narayanganj
            </span>
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-crimson"><Slogan /></p>
            <h1 className="text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
              Help reaches her <span className="text-crimson">in minutes,</span> not hours.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              NURJA is a women safety and rapid rescue network. One SOS alerts the nearest police and verified volunteers, streams live video, and keeps the evidence safe.
            </p>
            <div className="flex flex-wrap gap-3">
              <VolunteerDialog><Button size="lg" className="h-12 rounded-lg px-6 shadow-sos">Become a Volunteer <ArrowRight /></Button></VolunteerDialog>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-lg px-6"><a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" }); }}>How It Works</a></Button>
            </div>
            <div className="grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Women protected" value={rescued.toLocaleString()} />
              <Stat label="Verified volunteers" value={volunteers.toLocaleString()} />
              <Stat label="Avg. response" value="4m 12s" />
              <Stat label="Live SOS now" value={String(sos ? 1 : 0)} live={!!sos} />
            </div>
          </div>
          <div className="relative">
            <img src={hero} alt="A woman walking safely on a Dhaka street at night" width={1600} height={1008} className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-2xl lg:aspect-[4/5]" />
            <div className="absolute -bottom-6 -left-4 w-64 rounded-2xl border bg-card p-4 shadow-card sm:-left-8">
              <p className="flex items-center gap-2 text-xs font-bold uppercase text-crimson"><Radio className="h-3.5 w-3.5 animate-blink" /> Dispatch</p>
              <p className="mt-1 text-sm font-semibold">2 patrols · 1 fari · 1 station · 10 volunteers alerted</p>
              <p className="mt-1 text-xs text-muted-foreground">Nearest unit arriving in 3 min</p>
            </div>
            <div className="absolute -right-3 top-6 flex items-center gap-2 rounded-full bg-emerald px-3 py-1.5 text-xs font-bold text-paper shadow-lg">
              <ShieldCheck className="h-4 w-4" /> KYC verified users
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-crimson">How this system works</p>
          <h2 className="mt-2 text-4xl font-extrabold">From one tap to a safe rescue</h2>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative overflow-hidden rounded-3xl border border-t-4 border-t-crimson bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card animate-rise" style={{ animationDelay: `${i * 90}ms` }}>
              <span className="font-display text-5xl font-extrabold text-crimson/15">0{i + 1}</span>
              <div className="mt-2 grid h-12 w-12 place-items-center rounded-2xl bg-crimson text-paper"><s.icon className="h-6 w-6" /></div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              {i < 3 && <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 text-crimson md:block" />}
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-muted/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-crimson">Stories & awareness</p>
              <h2 className="mt-2 text-4xl font-extrabold">Incident stories from the network</h2>
            </div>
            <Button asChild variant="outline" className="rounded-lg"><Link to="/blog">View all stories <ArrowRight /></Link></Button>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">{blog.map((p) => <PostCard key={p.id} post={p} />)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-8 rounded-[2rem] bg-navy p-10 text-paper md:grid-cols-[1fr_auto] md:p-14">
          <div>
            <Users className="h-10 w-10 text-crimson" />
            <h2 className="mt-4 text-4xl font-extrabold">Be the nearest help.</h2>
            <p className="mt-2 max-w-xl text-paper/70">Verified volunteers get alerts when someone nearby needs help. Training and verification are free.</p>
          </div>
          <VolunteerDialog><Button size="lg" className="h-12 rounded-lg px-8">Become a Volunteer</Button></VolunteerDialog>
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="rounded-2xl border bg-card/80 p-3 backdrop-blur">
      <p className={`font-display text-xl font-extrabold tabular-nums ${live ? "text-crimson" : ""}`}>{value}</p>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
