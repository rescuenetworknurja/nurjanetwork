import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { SiteLayout } from "@/components/nurja/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — NURJA" },
      { name: "description", content: "Get in touch with the NURJA team for partnerships, volunteering or support." },
      { property: "og:title", content: "Contact Us — NURJA" },
      { property: "og:description", content: "Get in touch with the NURJA team for partnerships, volunteering or support." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <h1 className="text-5xl font-extrabold">Contact us</h1>
          <p className="text-muted-foreground">For emergencies, always use the NURJA SOS or call 999. For everything else, write to us.</p>
          {[{ i: Phone, t: "+880 1700-NURJA0" }, { i: Mail, t: "hello@nurja.org" }, { i: MapPin, t: "Level 4, Toyenbee Circular Rd, Motijheel, Dhaka 1000" }].map(({ i: I, t }) => (
            <p key={t} className="flex items-center gap-3 font-semibold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-crimson"><I className="h-5 w-5" /></span>{t}</p>
          ))}
        </div>
        <form className="space-y-4 rounded-3xl border bg-card p-8 shadow-card" onSubmit={(e) => { e.preventDefault(); (e.target as HTMLFormElement).reset(); toast.success("Message sent. We'll reply within 24 hours."); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Name</Label><Input required /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input required type="email" /></div>
          </div>
          <div className="space-y-1.5"><Label>Subject</Label><Input required /></div>
          <div className="space-y-1.5"><Label>Message</Label><Textarea required rows={5} /></div>
          <Button type="submit" size="lg" className="w-full">Send message</Button>
        </form>
      </section>
    </SiteLayout>
  );
}
