import { createFileRoute } from "@tanstack/react-router";
import { Compass, Flag, Radio, Users } from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { useBi } from "@/lib/i18n";
import { CMS_ICONS } from "@/components/nurja/cms-icons";
import { SiteLayout } from "@/components/nurja/SiteLayout";
import { LOGOS } from "@/components/nurja/Brand";
import volunteers from "@/assets/story-volunteers.webp";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "Our Story — NURJA" },
      { name: "description", content: "Why we built NURJA: a rescue network that brings police and community volunteers together for women's safety." },
      { property: "og:title", content: "Our Story — NURJA" },
      { property: "og:description", content: "Why we built NURJA: a rescue network that brings police and community volunteers together." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Story,
});

function Story() {
  const c = useDemo().websiteContent;
  const st = c.story;
  const L = useBi();
  return (
    <SiteLayout>
      <section className="bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-crimson">Our Story</p>
            <h1 className="mt-3 text-5xl font-extrabold leading-tight">{L(st.title)}</h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{L(st.intro)}</p>
          </div>
          <img src={LOGOS.logo} alt="NURJA logo" className="h-56 w-56 rounded-3xl bg-paper object-contain p-4 shadow-card" />
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pt-16 md:grid-cols-2">
        {[{ I: Flag, t: "Our mission", v: st.mission }, { I: Compass, t: "Our vision", v: st.vision }].map(({ I, t, v }) => (
          <div key={t} className="rounded-2xl border border-t-4 border-t-crimson bg-card p-6 shadow-sm">
            <I className="h-7 w-7 text-crimson" /><h2 className="mt-3 text-xl font-extrabold">{t}</h2><p className="mt-2 text-muted-foreground">{L(v)}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2">
        <img src={volunteers} alt="Volunteers at a safety briefing" loading="lazy" className="rounded-3xl object-cover shadow-card" />
        <div className="space-y-4 self-center text-muted-foreground">
          <h2 className="text-3xl font-extrabold text-foreground">{L(st.sectionTitle)}</h2>
          {st.paragraphs.map((p, i) => <p key={i}>{L(p)}</p>)}
        </div>
      </section>
      {st.milestones.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <h2 className="text-3xl font-extrabold">Milestones</h2>
          <ol className="mt-6 space-y-4 border-l-2 border-crimson/30 pl-6">
            {st.milestones.map((m) => (
              <li key={m.id} className="relative">
                <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-background bg-crimson" />
                <p className="font-display text-sm font-bold text-crimson">{m.year}</p>
                <p className="font-bold">{L(m.title)}</p>
                <p className="text-sm text-muted-foreground">{L(m.text)}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-4">
          {c.features.map((v) => { const Icon = CMS_ICONS[v.icon] ?? Radio; return (
            <div key={v.id} className="rounded-3xl border bg-card p-6 shadow-card">
              <Icon className="h-8 w-8 text-crimson" />
              <h3 className="mt-3 font-bold">{L(v.title)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{L(v.text)}</p>
            </div>
          ); })}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-navy p-8 text-paper">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold"><Users className="h-6 w-6 text-crimson" /> Team & organisation</h2>
          <p className="mt-2 max-w-3xl text-paper/70">{L(st.org)}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {st.team.map((t) => <div key={t.id} className="rounded-xl bg-paper/5 p-4"><p className="font-bold">{L(t.name)}</p><p className="text-sm text-paper/60">{L(t.role)}</p></div>)}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
