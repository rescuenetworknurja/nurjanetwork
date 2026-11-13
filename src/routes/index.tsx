import { Slogan, useBi } from "@/lib/i18n";
import { CMS_ICONS } from "@/components/nurja/cms-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Radio, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/nurja/SiteLayout";
import { VolunteerDialog } from "@/components/nurja/VolunteerDialog";
import { PostCard } from "@/components/nurja/PostCard";
import { InstallNurjaButton } from "@/components/nurja/InstallNurjaButton";
import { useDemo } from "@/lib/demo-store";
import hero from "@/assets/hero-night-street.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NURJA — Women Safety & Rapid Rescue Network" },
      { name: "description", content: "One tap SOS that alerts nearby police and verified volunteers, streams live video and saves evidence." },
      { property: "og:title", content: "NURJA — Women Safety & Rapid Rescue Network" },
      { property: "og:description", content: "One tap SOS that alerts nearby police and verified volunteers, streams live video and saves evidence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function useTicker(base: number, step: number) {
  const [v, setV] = useState(base);
  useEffect(() => { const i = setInterval(() => setV((x) => x + Math.floor(Math.random() * step)), 2200); return () => clearInterval(i); }, [step]);
  return v;
}

function Home() {
  const { posts, sos, websiteContent: c } = useDemo();
  const L = useBi();
  const rescued = useTicker(c.stats.users, 3), volunteers = useTicker(c.stats.volunteers, 2);
  const blog = posts.filter((p) => p.targets.blog && p.published !== false).slice(0, 3);
  const headline = L(c.hero.headline).split(/\[|\]/);
  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-hero">
        <div aria-hidden className="pointer-events-none absolute inset-0 arch-grid" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="space-y-7 animate-rise">
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-crimson"><Slogan /></p>
            <h1 className="text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
              {headline.map((part, i) => i % 2 ? <span key={i} className="text-crimson">{part}</span> : <span key={i}>{part}</span>)}
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              {L(c.hero.sub)}
            </p>
            <div className="flex flex-wrap gap-3">
              <InstallNurjaButton />
              <VolunteerDialog><Button size="lg" variant="outline" className="h-12 rounded-lg px-6">{L(c.hero.cta)} <ArrowRight /></Button></VolunteerDialog>
            </div>
            <div className="grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-5">
              <Stat label="Women protected" value={rescued.toLocaleString()} />
              <Stat label="Verified volunteers" value={volunteers.toLocaleString()} />
              <Stat label="Police units connected" value={c.stats.police.toLocaleString()} />
              <Stat label="Avg. response" value={c.stats.response} />
              <Stat label="Live SOS now" value={String(sos ? 1 : 0)} live={!!sos} />
            </div>
          </div>
          <div className="relative">
            <img src={c.hero.image || hero} alt="A woman walking safely on a Dhaka street at night" width={1600} height={1008} className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-2xl lg:aspect-[4/5]" />
            <div className="absolute -bottom-6 -left-4 w-64 rounded-2xl border bg-card p-4 shadow-card sm:-left-8">
              <p className="flex items-center gap-2 text-xs font-bold uppercase text-crimson"><Radio className="h-3.5 w-3.5 animate-blink" /> Dispatch</p>
              <p className="mt-1 text-sm font-semibold">2 patrols · 1 fari · 1 station · 10 volunteers alerted</p>
              <p className="mt-1 text-xs text-muted-foreground">Nearest unit arriving in 3 min</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-crimson">{L(c.sections.howEyebrow)}</p>
          <h2 className="mt-2 text-4xl font-extrabold">{L(c.sections.howTitle)}</h2>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-4 md:gap-8">
          {c.steps.map((st, i) => { const Icon = CMS_ICONS[st.icon] ?? Radio; return (
            <li key={st.id} className="relative rounded-3xl border border-t-4 border-t-crimson bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card animate-rise" style={{ animationDelay: `${i * 90}ms` }}>
              <span className="font-display text-5xl font-extrabold text-crimson/15">0{i + 1}</span>
              <div className="mt-2 grid h-12 w-12 place-items-center rounded-2xl bg-crimson text-paper"><Icon className="h-6 w-6" /></div>
              <h3 className="mt-4 text-lg font-bold">{L(st.title)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{L(st.text)}</p>
              {i < c.steps.length - 1 && <ArrowRight className="absolute -right-7 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 text-crimson md:block" />}
            </li>
          ); })}
        </ol>
      </section>

      <section className="bg-muted/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-crimson">{L(c.sections.storiesEyebrow)}</p>
              <h2 className="mt-2 text-4xl font-extrabold">{L(c.sections.storiesTitle)}</h2>
            </div>
            <Button asChild variant="outline" className="rounded-lg"><Link to="/blog">View all stories <ArrowRight /></Link></Button>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">{blog.map((p) => <PostCard key={p.id} post={p} />)}</div>
        </div>
      </section>

      {c.features.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-sm font-bold uppercase tracking-widest text-crimson">{L(c.sections.featuresEyebrow)}</p>
          <h2 className="mt-2 text-3xl font-extrabold">{L(c.sections.featuresTitle)}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {c.features.map((f) => { const Icon = CMS_ICONS[f.icon] ?? Radio; return (
              <div key={f.id} className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-card">
                <Icon className="h-8 w-8 text-crimson" />
                <h3 className="mt-3 font-bold">{L(f.title)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{L(f.text)}</p>
              </div>
            ); })}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-8 rounded-[2rem] bg-navy p-10 text-paper md:grid-cols-[1fr_auto] md:p-14">
          <div>
            <Users className="h-10 w-10 text-crimson" />
            <h2 className="mt-4 text-4xl font-extrabold">{L(c.sections.bandTitle)}</h2>
            <p className="mt-2 max-w-xl text-paper/70">{L(c.sections.bandText)}</p>
          </div>
          <VolunteerDialog><Button size="lg" className="h-12 rounded-lg px-8">{L(c.hero.cta)}</Button></VolunteerDialog>
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
