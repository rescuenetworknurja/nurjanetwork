import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, Scale, ShieldCheck, Target } from "lucide-react";
import { SiteLayout } from "@/components/nurja/SiteLayout";
import { LOGOS } from "@/components/nurja/Brand";
import volunteers from "@/assets/story-volunteers.jpg";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "Our Story — NURJA" },
      { name: "description", content: "Why we built NURJA: a rescue network that brings police and community volunteers together for women's safety." },
      { property: "og:title", content: "Our Story — NURJA" },
      { property: "og:description", content: "Why we built NURJA: a rescue network that brings police and community volunteers together." },
    ],
  }),
  component: Story,
});

const VALUES = [
  { icon: Target, t: "Speed first", d: "Every second matters. Our dispatch picks the nearest help automatically." },
  { icon: ShieldCheck, t: "Verified trust", d: "Every user and volunteer is checked before joining the network." },
  { icon: Scale, t: "Evidence that counts", d: "Live video and routes are archived to support justice." },
  { icon: HeartHandshake, t: "Community power", d: "Police and neighbours working together, not alone." },
];

function Story() {
  return (
    <SiteLayout>
      <section className="bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-crimson">Our Story</p>
            <h1 className="mt-3 text-5xl font-extrabold leading-tight">Built so no woman has to wait alone for help.</h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              NURJA started in 2024 after a group of students in Narayanganj saw how long it took for help to arrive when a classmate was attacked near a bus stand. We brought together police units, community volunteers and technology into one rescue network.
            </p>
          </div>
          <img src={LOGOS.logo} alt="NURJA logo" className="h-56 w-56 rounded-3xl bg-paper object-contain p-4 shadow-card" />
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2">
        <img src={volunteers} alt="Volunteers at a safety briefing" loading="lazy" className="rounded-3xl object-cover shadow-card" />
        <div className="space-y-4 self-center text-muted-foreground">
          <h2 className="text-3xl font-extrabold text-foreground">Police and people, one network</h2>
          <p>Police stations, patrol units and fari vehicles are dispatched automatically. Trained volunteers nearby can accept the alert and reach her first.</p>
          <p>Our control room watches every live SOS, can switch the victim's camera remotely, and keeps evidence secure for legal action.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.t} className="rounded-3xl border bg-card p-6 shadow-card">
              <v.icon className="h-8 w-8 text-crimson" />
              <h3 className="mt-3 font-bold">{v.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
