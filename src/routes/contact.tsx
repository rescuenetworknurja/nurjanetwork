import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { SiteLayout } from "@/components/nurja/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, Facebook, Linkedin, Youtube } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/lib/demo-store";
import { useBi } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — NURJA" },
      { name: "description", content: "Get in touch with the NURJA team for partnerships, volunteering or support." },
      { property: "og:title", content: "Contact Us — NURJA" },
      { property: "og:description", content: "Get in touch with the NURJA team for partnerships, volunteering or support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const d = useDemo();
  const c = d.websiteContent.contact;
  const L = useBi();
  const blank = { name: "", contact: "", subject: "", message: "" };
  const [f, setF] = useState(blank);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await d.submitInquiry(f); setF(blank); toast.success("Message sent"); } catch { /* The shared action reports failure. */ }
  };
  const rows = [
    { i: Phone, t: `${c.phone} · Hotline ${c.hotline}` },
    { i: Mail, t: [c.email, c.supportEmail].filter(Boolean).join(" · ") },
    { i: MapPin, t: L(c.address) },
    { i: Clock, t: L(c.hours) },
  ];
  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <h1 className="text-5xl font-extrabold">Contact us</h1>
          <p className="text-muted-foreground">{L(c.intro)}</p>
          {rows.map(({ i: I, t }) => (
            <p key={t} className="flex items-center gap-3 font-semibold"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-crimson"><I className="h-5 w-5" /></span>{t}</p>
          ))}
          <div className="flex gap-2">
            {[{ I: Facebook, u: c.facebook }, { I: Youtube, u: c.youtube }, { I: Linkedin, u: c.linkedin }].filter((x) => x.u).map(({ I, u }) => (
              <a key={u} href={u} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-lg border bg-card hover:text-crimson"><I className="h-5 w-5" /></a>
            ))}
          </div>
        </div>
        <form className="space-y-4 rounded-3xl border bg-card p-8 shadow-card" onSubmit={send}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Name</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Phone or email</Label><Input required value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5"><Label>Subject</Label><Input required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Message</Label><Textarea required rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
          <Button type="submit" size="lg" className="w-full">Send message</Button>
        </form>
      </section>
    </SiteLayout>
  );
}
