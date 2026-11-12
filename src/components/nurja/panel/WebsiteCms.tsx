import { useEffect, useState } from "react";
import { Check, Globe, ImageIcon, Inbox, Pencil, Plus, Save, Trash2, Undo2, Youtube } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemo } from "@/lib/demo-store";
import { useT } from "@/lib/i18n";
import { IMAGES, type Post } from "@/lib/mock-data";
import type { Bi, CardItem, IconKey, Inquiry, WebsiteContent } from "@/lib/website-content";
import { cn } from "@/lib/utils";
import { CMS_ICONS } from "../cms-icons";
import { Card, PageHead } from "./Dashboard";

const uid = () => Math.random().toString(36).slice(2, 8);

function BiField({ label, value, onChange, area, hint }: { label: string; value: Bi; onChange: (v: Bi) => void; area?: boolean; hint?: string }) {
  const F = area ? Textarea : Input;
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="relative"><span className="absolute right-2 top-2 z-10 rounded bg-muted px-1.5 text-[10px] font-bold text-muted-foreground">EN</span>
          <F rows={area ? 3 : undefined} value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} className="pr-10" /></div>
        <div className="relative" data-no-tr><span className="absolute right-2 top-2 z-10 rounded bg-muted px-1.5 text-[10px] font-bold text-muted-foreground">বাং</span>
          <F rows={area ? 3 : undefined} value={value.bn} onChange={(e) => onChange({ ...value, bn: e.target.value })} className="pr-10" /></div>
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function IconPick({ value, onChange }: { value: IconKey; onChange: (v: IconKey) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {(Object.keys(CMS_ICONS) as IconKey[]).map((k) => { const I = CMS_ICONS[k]; return (
        <button type="button" key={k} onClick={() => onChange(k)} aria-label={k} className={cn("grid h-8 w-8 place-items-center rounded-md border", value === k ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}><I className="h-4 w-4" /></button>
      ); })}
    </div>
  );
}

function CardsEditor({ items, onChange, addLabel }: { items: CardItem[]; onChange: (v: CardItem[]) => void; addLabel: string }) {
  const upd = (i: number, p: Partial<CardItem>) => onChange(items.map((x, j) => (j === i ? { ...x, ...p } : x)));
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={it.id} className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-sm font-bold">#{i + 1}</span>
            <IconPick value={it.icon} onChange={(icon) => upd(i, { icon })} />
            <Button type="button" size="icon" variant="ghost" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 className="text-crimson" /></Button>
          </div>
          <BiField label="Title" value={it.title} onChange={(title) => upd(i, { title })} />
          <BiField label="Description" value={it.text} onChange={(text) => upd(i, { text })} area />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...items, { id: uid(), icon: "shield", title: { en: "", bn: "" }, text: { en: "", bn: "" } }])}><Plus /> {addLabel}</Button>
    </div>
  );
}

export function WebsiteCmsSection() {
  const d = useDemo();
  const { tr } = useT();
  const [draft, setDraft] = useState<WebsiteContent>(d.websiteContent);
  const dirty = JSON.stringify(draft) !== JSON.stringify(d.websiteContent);
  useEffect(() => { if (!dirty) setDraft(d.websiteContent); }, [d.websiteContent]); // eslint-disable-line react-hooks/exhaustive-deps
  const up = <K extends keyof WebsiteContent>(k: K, v: Partial<WebsiteContent[K]>) => setDraft((s) => ({ ...s, [k]: { ...s[k], ...v } }));
  const publish = () => { d.set({ websiteContent: draft }); toast.success(tr("Website updated", "ওয়েবসাইট হালনাগাদ হয়েছে"), { description: tr("Changes are live on the public website.", "পরিবর্তনগুলো পাবলিক ওয়েবসাইটে চালু হয়েছে।") }); };
  const newMsgs = d.inquiries.filter((q) => q.status === "new").length;

  const SaveBar = () => (
    <div className={cn("sticky top-2 z-20 mb-4 flex items-center justify-between gap-3 rounded-lg border p-3 shadow-card backdrop-blur", dirty ? "border-amber/40 bg-amber-soft/90" : "bg-card/90")}>
      <p className="text-sm font-semibold">{dirty ? tr("You have unpublished changes", "অপ্রকাশিত পরিবর্তন আছে") : tr("All changes are live", "সব পরিবর্তন চালু আছে")}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={!dirty} onClick={() => setDraft(d.websiteContent)}><Undo2 /> {tr("Discard", "বাতিল")}</Button>
        <Button size="sm" disabled={!dirty} onClick={publish}><Save /> {tr("Save & publish", "সংরক্ষণ ও প্রকাশ")}</Button>
      </div>
    </div>
  );

  const h = draft.hero, st = draft.story, c = draft.contact, sec = draft.sections;
  return (
    <>
      <PageHead title={tr("Public Website CMS & CRM", "পাবলিক ওয়েবসাইট ও সিআরএম")} sub={tr("Edit every page of the public website in Bangla and English, and manage inquiries and volunteer leads", "পাবলিক ওয়েবসাইটের প্রতিটি পাতা বাংলা ও ইংরেজিতে সম্পাদনা করুন, বার্তা ও ভলান্টিয়ার আবেদন পরিচালনা করুন")} />
      <Tabs defaultValue="home">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="home">{tr("Homepage", "হোমপেজ কন্টেন্ট")}</TabsTrigger>
          <TabsTrigger value="story">{tr("Our Story", "আমাদের গল্প")}</TabsTrigger>
          <TabsTrigger value="blog">{tr("Blog & Stories", "ব্লগ ও ঘটনা প্রকাশনা")}</TabsTrigger>
          <TabsTrigger value="contact">{tr("Contact & Footer", "যোগাযোগ ও ফুটার")}</TabsTrigger>
          <TabsTrigger value="crm">{tr("Inbox & Volunteer CRM", "ইনবক্স ও ভলান্টিয়ার সিআরএম")}{newMsgs > 0 && <span className="ml-1.5 rounded-full bg-crimson px-1.5 text-[10px] text-paper">{newMsgs}</span>}</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-4">
          <SaveBar />
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="space-y-4">
              <p className="font-display font-bold">{tr("Hero section", "হিরো সেকশন")}</p>
              <BiField label={tr("Top badge", "উপরের ব্যাজ")} value={h.badge} onChange={(badge) => up("hero", { badge })} />
              <BiField label={tr("Slogan", "স্লোগান")} value={h.slogan} onChange={(slogan) => up("hero", { slogan })} />
              <BiField label={tr("Headline", "শিরোনাম")} value={h.headline} onChange={(headline) => up("hero", { headline })} hint={tr("Wrap words in [square brackets] to show them in crimson.", "লাল রঙে দেখাতে শব্দগুলো [বন্ধনী]-তে রাখুন।")} />
              <BiField label={tr("Sub-headline", "উপ-শিরোনাম")} value={h.sub} onChange={(sub) => up("hero", { sub })} area />
              <BiField label={tr("Button text", "বাটনের লেখা")} value={h.cta} onChange={(cta) => up("hero", { cta })} />
              <div className="space-y-1.5"><Label>{tr("Hero image URL (leave empty for default)", "হিরো ছবির লিংক (ডিফল্টের জন্য খালি রাখুন)")}</Label>
                <div className="flex gap-2"><Input value={h.image} onChange={(e) => up("hero", { image: e.target.value })} placeholder="https://…" />
                  <label className="grid h-9 w-11 shrink-0 cursor-pointer place-items-center rounded-lg border"><ImageIcon className="h-4 w-4" /><input type="file" accept="image/*" className="hidden" onChange={(e) => { const x = e.target.files?.[0]; if (!x) return; const r = new FileReader(); r.onload = () => up("hero", { image: String(r.result) }); r.readAsDataURL(x); }} /></label>
                </div>
              </div>
            </Card>
            <div className="space-y-4">
              <Card className="space-y-4">
                <p className="font-display font-bold">{tr("Live impact statistics", "লাইভ প্রভাব পরিসংখ্যান")}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([["users", tr("Active users", "সক্রিয় ব্যবহারকারী")], ["volunteers", tr("Verified volunteers", "যাচাইকৃত ভলান্টিয়ার")], ["police", tr("Police units connected", "সংযুক্ত পুলিশ ইউনিট")]] as const).map(([k, l]) => (
                    <div key={k} className="space-y-1.5"><Label>{l}</Label><Input type="number" min={0} value={draft.stats[k]} onChange={(e) => up("stats", { [k]: Number(e.target.value) || 0 })} /></div>
                  ))}
                  <div className="space-y-1.5"><Label>{tr("Average response time", "গড় রেসপন্স সময়")}</Label><Input value={draft.stats.response} onChange={(e) => up("stats", { response: e.target.value })} /></div>
                </div>
              </Card>
              <Card className="space-y-4">
                <p className="font-display font-bold">{tr("Section headings", "সেকশনের শিরোনাম")}</p>
                <BiField label={tr("How it works — label", "কীভাবে কাজ করে — লেবেল")} value={sec.howEyebrow} onChange={(howEyebrow) => up("sections", { howEyebrow })} />
                <BiField label={tr("How it works — title", "কীভাবে কাজ করে — শিরোনাম")} value={sec.howTitle} onChange={(howTitle) => up("sections", { howTitle })} />
                <BiField label={tr("Features — title", "বৈশিষ্ট্য — শিরোনাম")} value={sec.featuresTitle} onChange={(featuresTitle) => up("sections", { featuresTitle })} />
                <BiField label={tr("Stories — title", "ঘটনা — শিরোনাম")} value={sec.storiesTitle} onChange={(storiesTitle) => up("sections", { storiesTitle })} />
                <BiField label={tr("Volunteer banner — title", "ভলান্টিয়ার ব্যানার — শিরোনাম")} value={sec.bandTitle} onChange={(bandTitle) => up("sections", { bandTitle })} />
                <BiField label={tr("Volunteer banner — text", "ভলান্টিয়ার ব্যানার — লেখা")} value={sec.bandText} onChange={(bandText) => up("sections", { bandText })} area />
              </Card>
            </div>
            <Card className="space-y-3"><p className="font-display font-bold">{tr("How It Works steps", "কীভাবে কাজ করে — ধাপসমূহ")}</p>
              <CardsEditor items={draft.steps} onChange={(steps) => setDraft({ ...draft, steps })} addLabel={tr("Add step", "ধাপ যোগ করুন")} /></Card>
            <Card className="space-y-3"><p className="font-display font-bold">{tr("Key feature cards", "মূল বৈশিষ্ট্য কার্ড")}</p>
              <CardsEditor items={draft.features} onChange={(features) => setDraft({ ...draft, features })} addLabel={tr("Add feature", "বৈশিষ্ট্য যোগ করুন")} /></Card>
          </div>
        </TabsContent>

        <TabsContent value="story" className="mt-4">
          <SaveBar />
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="space-y-4">
              <BiField label={tr("Page headline", "পাতার শিরোনাম")} value={st.title} onChange={(title) => up("story", { title })} />
              <BiField label={tr("Intro / history", "ভূমিকা / ইতিহাস")} value={st.intro} onChange={(intro) => up("story", { intro })} area />
              <BiField label={tr("Mission statement", "মিশন")} value={st.mission} onChange={(mission) => up("story", { mission })} area />
              <BiField label={tr("Vision statement", "ভিশন")} value={st.vision} onChange={(vision) => up("story", { vision })} area />
              <BiField label={tr("Story section title", "গল্প সেকশনের শিরোনাম")} value={st.sectionTitle} onChange={(sectionTitle) => up("story", { sectionTitle })} />
              {st.paragraphs.map((p, i) => (
                <div key={i} className="flex gap-2"><div className="flex-1"><BiField label={`${tr("Paragraph", "অনুচ্ছেদ")} ${i + 1}`} value={p} onChange={(v) => up("story", { paragraphs: st.paragraphs.map((x, j) => (j === i ? v : x)) })} area /></div>
                  <Button size="icon" variant="ghost" className="mt-6" onClick={() => up("story", { paragraphs: st.paragraphs.filter((_, j) => j !== i) })}><Trash2 className="text-crimson" /></Button></div>
              ))}
              <Button variant="outline" onClick={() => up("story", { paragraphs: [...st.paragraphs, { en: "", bn: "" }] })}><Plus /> {tr("Add paragraph", "অনুচ্ছেদ যোগ করুন")}</Button>
            </Card>
            <div className="space-y-4">
              <Card className="space-y-3">
                <p className="font-display font-bold">{tr("Milestone timeline", "মাইলফলক টাইমলাইন")}</p>
                {st.milestones.map((m, i) => {
                  const set = (p: Partial<typeof m>) => up("story", { milestones: st.milestones.map((x, j) => (j === i ? { ...x, ...p } : x)) });
                  return (
                    <div key={m.id} className="space-y-3 rounded-lg border bg-muted/30 p-4">
                      <div className="flex gap-2"><Input className="w-28" value={m.year} onChange={(e) => set({ year: e.target.value })} placeholder="2026" />
                        <Button size="icon" variant="ghost" className="ml-auto" onClick={() => up("story", { milestones: st.milestones.filter((_, j) => j !== i) })}><Trash2 className="text-crimson" /></Button></div>
                      <BiField label="Title" value={m.title} onChange={(title) => set({ title })} />
                      <BiField label="Description" value={m.text} onChange={(text) => set({ text })} />
                    </div>
                  );
                })}
                <Button variant="outline" onClick={() => up("story", { milestones: [...st.milestones, { id: uid(), year: "", title: { en: "", bn: "" }, text: { en: "", bn: "" } }] })}><Plus /> {tr("Add milestone", "মাইলফলক যোগ করুন")}</Button>
              </Card>
              <Card className="space-y-3">
                <p className="font-display font-bold">{tr("Team & organisation", "টিম ও প্রতিষ্ঠান")}</p>
                <BiField label={tr("Organisation profile", "প্রতিষ্ঠানের পরিচিতি")} value={st.org} onChange={(org) => up("story", { org })} area />
                {st.team.map((t, i) => {
                  const set = (p: Partial<typeof t>) => up("story", { team: st.team.map((x, j) => (j === i ? { ...x, ...p } : x)) });
                  return (
                    <div key={t.id} className="flex gap-2 rounded-lg border bg-muted/30 p-3"><div className="flex-1 space-y-2">
                      <BiField label={tr("Name", "নাম")} value={t.name} onChange={(name) => set({ name })} />
                      <BiField label={tr("Role", "ভূমিকা")} value={t.role} onChange={(role) => set({ role })} /></div>
                      <Button size="icon" variant="ghost" onClick={() => up("story", { team: st.team.filter((_, j) => j !== i) })}><Trash2 className="text-crimson" /></Button></div>
                  );
                })}
                <Button variant="outline" onClick={() => up("story", { team: [...st.team, { id: uid(), name: { en: "", bn: "" }, role: { en: "", bn: "" } }] })}><Plus /> {tr("Add member", "সদস্য যোগ করুন")}</Button>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="blog" className="mt-4"><BlogManager /></TabsContent>

        <TabsContent value="contact" className="mt-4">
          <SaveBar />
          <Card className="max-w-4xl space-y-4">
            <BiField label={tr("Contact page intro", "যোগাযোগ পাতার ভূমিকা")} value={c.intro} onChange={(intro) => up("contact", { intro })} area />
            <BiField label={tr("Office address", "অফিসের ঠিকানা")} value={c.address} onChange={(address) => up("contact", { address })} />
            <div className="grid gap-3 md:grid-cols-2">
              {([["hotline", tr("Emergency hotline", "জরুরি হটলাইন")], ["phone", tr("Support phone", "সাপোর্ট ফোন")], ["email", tr("Official email", "অফিসিয়াল ইমেইল")], ["supportEmail", tr("Support email", "সাপোর্ট ইমেইল")], ["facebook", "Facebook"], ["youtube", "YouTube"], ["linkedin", "LinkedIn"]] as const).map(([k, l]) => (
                <div key={k} className="space-y-1.5"><Label>{l}</Label><Input value={c[k]} onChange={(e) => up("contact", { [k]: e.target.value })} /></div>
              ))}
            </div>
            <BiField label={tr("Working hours", "কর্মঘণ্টা")} value={c.hours} onChange={(hours) => up("contact", { hours })} />
            <BiField label={tr("Footer about text", "ফুটারের পরিচিতি")} value={c.footerAbout} onChange={(footerAbout) => up("contact", { footerAbout })} area />
          </Card>
        </TabsContent>

        <TabsContent value="crm" className="mt-4 space-y-6"><InboxCrm /><VolunteerPipeline /></TabsContent>
      </Tabs>
    </>
  );
}

const toEmbed = (u: string) => { const m = u.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/); return m ? `https://www.youtube.com/embed/${m[1]}` : undefined; };
type PostDraft = { id?: string; title: string; titleBn: string; excerpt: string; excerptBn: string; body: string; bodyBn: string; image: string; youtube: string; tag: string; blog: boolean; app: boolean; published: boolean };
const blankPost: PostDraft = { title: "", titleBn: "", excerpt: "", excerptBn: "", body: "", bodyBn: "", image: "", youtube: "", tag: "Awareness", blog: true, app: true, published: true };

function BlogManager() {
  const d = useDemo();
  const { tr } = useT();
  const [edit, setEdit] = useState<PostDraft | null>(null);
  const open = (p?: Post) => setEdit(p ? { id: p.id, title: p.title, titleBn: p.titleBn ?? "", excerpt: p.excerpt, excerptBn: p.excerptBn ?? "", body: p.body, bodyBn: p.bodyBn ?? "", image: p.image ?? "", youtube: p.youtube ?? "", tag: p.tag, blog: p.targets.blog, app: p.targets.app || p.targets.rescue, published: p.published !== false } : { ...blankPost });
  const save = (e: React.FormEvent) => {
    e.preventDefault(); if (!edit) return;
    if (edit.youtube && !toEmbed(edit.youtube)) { toast.error(tr("That YouTube link doesn't look right", "ইউটিউব লিংকটি সঠিক নয়")); return; }
    const post: Post = { id: edit.id ?? `p${Date.now()}`, title: edit.title, titleBn: edit.titleBn || undefined, excerpt: edit.excerpt || edit.body.slice(0, 140), excerptBn: edit.excerptBn || undefined, body: edit.body, bodyBn: edit.bodyBn || undefined,
      image: edit.image || undefined, youtube: edit.youtube ? toEmbed(edit.youtube) : undefined, tag: edit.tag, published: edit.published,
      date: d.posts.find((p) => p.id === edit.id)?.date ?? new Date().toISOString().slice(0, 10), author: d.posts.find((p) => p.id === edit.id)?.author ?? "NURJA Control",
      targets: { blog: edit.blog, app: edit.app, rescue: edit.app } };
    d.set((s) => ({ posts: edit.id ? s.posts.map((p) => (p.id === edit.id ? post : p)) : [post, ...s.posts] }));
    toast.success(edit.published ? tr("Post published", "পোস্ট প্রকাশিত হয়েছে") : tr("Saved as draft", "খসড়া হিসেবে সংরক্ষিত")); setEdit(null);
  };
  const togglePub = (p: Post) => d.set((s) => ({ posts: s.posts.map((x) => (x.id === p.id ? { ...x, published: x.published === false } : x)) }));
  const del = (p: Post) => { d.set((s) => ({ posts: s.posts.filter((x) => x.id !== p.id) })); toast(tr("Post deleted", "পোস্ট মুছে ফেলা হয়েছে")); };
  const e = edit;
  return (
    <>
      <div className="mb-3 flex justify-end"><Button onClick={() => open()}><Plus /> {tr("New post", "নতুন পোস্ট")}</Button></div>
      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>{tr("Title", "শিরোনাম")}</TableHead><TableHead>{tr("Category", "বিভাগ")}</TableHead><TableHead>{tr("Shown on", "যেখানে দেখাবে")}</TableHead><TableHead>{tr("Status", "অবস্থা")}</TableHead><TableHead className="text-right">{tr("Actions", "কার্যক্রম")}</TableHead></TableRow></TableHeader>
          <TableBody>
            {d.posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-[320px]"><p className="truncate font-semibold">{p.title}</p>{p.titleBn && <p className="truncate text-xs text-muted-foreground" data-no-tr>{p.titleBn}</p>}</TableCell>
                <TableCell>{p.tag}</TableCell>
                <TableCell className="text-xs">{[p.targets.blog && tr("Website", "ওয়েবসাইট"), (p.targets.app || p.targets.rescue) && tr("App feeds", "অ্যাপ ফিড")].filter(Boolean).join(" · ") || "—"}</TableCell>
                <TableCell><button onClick={() => togglePub(p)} className={cn("rounded-full px-2 py-0.5 text-xs font-bold", p.published === false ? "bg-amber-soft text-amber" : "bg-emerald-soft text-emerald")}>{p.published === false ? tr("Draft", "খসড়া") : tr("Published", "প্রকাশিত")}</button></TableCell>
                <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => open(p)} aria-label="Edit"><Pencil /></Button><Button size="icon" variant="ghost" onClick={() => del(p)} aria-label="Delete"><Trash2 className="text-crimson" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Sheet open={!!e} onOpenChange={(o) => !o && setEdit(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader><SheetTitle>{e?.id ? tr("Edit post", "পোস্ট সম্পাদনা") : tr("New post", "নতুন পোস্ট")}</SheetTitle><SheetDescription>{tr("Bangla and English versions", "বাংলা ও ইংরেজি সংস্করণ")}</SheetDescription></SheetHeader>
          {e && (
            <form onSubmit={save} className="mt-4 space-y-4 px-1 pb-6">
              <BiField label={tr("Title", "শিরোনাম")} value={{ en: e.title, bn: e.titleBn }} onChange={(v) => setEdit({ ...e, title: v.en, titleBn: v.bn })} />
              <BiField label={tr("Summary", "সারসংক্ষেপ")} value={{ en: e.excerpt, bn: e.excerptBn }} onChange={(v) => setEdit({ ...e, excerpt: v.en, excerptBn: v.bn })} area />
              <BiField label={tr("Full article", "সম্পূর্ণ লেখা")} value={{ en: e.body, bn: e.bodyBn }} onChange={(v) => setEdit({ ...e, body: v.en, bodyBn: v.bn })} area />
              <div className="space-y-1.5"><Label>{tr("Category", "বিভাগ")}</Label>
                <Select value={e.tag} onValueChange={(tag) => setEdit({ ...e, tag })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Incident Story", "Awareness", "Community"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label>{tr("Cover image", "কভার ছবি")}</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(IMAGES).map(([k, src]) => <button type="button" key={k} onClick={() => setEdit({ ...e, image: e.image === src ? "" : src })} className={cn("overflow-hidden rounded-lg border-2", e.image === src ? "border-primary" : "border-transparent")}><img src={src} alt={k} className="h-14 w-20 object-cover" /></button>)}
                  <label className="grid h-14 w-20 cursor-pointer place-items-center rounded-lg border-2 border-dashed text-muted-foreground"><Plus className="h-5 w-5" /><input type="file" accept="image/*" className="hidden" onChange={(ev) => { const x = ev.target.files?.[0]; if (!x) return; const r = new FileReader(); r.onload = () => setEdit({ ...e, image: String(r.result) }); r.readAsDataURL(x); }} /></label>
                </div>
                <Input value={e.image.startsWith("data:") ? "" : e.image} onChange={(ev) => setEdit({ ...e, image: ev.target.value })} placeholder={tr("…or paste an image URL", "…অথবা ছবির লিংক দিন")} />
              </div>
              <div className="space-y-1.5"><Label className="flex items-center gap-1"><Youtube className="h-4 w-4 text-crimson" /> YouTube</Label><Input value={e.youtube} onChange={(ev) => setEdit({ ...e, youtube: ev.target.value })} placeholder="https://youtube.com/watch?v=…" /></div>
              <div className="space-y-2 rounded-lg bg-muted p-3 text-sm">
                <label className="flex items-center gap-2"><Checkbox checked={e.blog} onCheckedChange={(v) => setEdit({ ...e, blog: !!v })} />{tr("Publish to Public Website Blog", "পাবলিক ওয়েবসাইট ব্লগে প্রকাশ")}</label>
                <label className="flex items-center gap-2"><Checkbox checked={e.app} onCheckedChange={(v) => setEdit({ ...e, app: !!v })} />{tr("Publish to NURJA & Rescue Network app Community feed", "নুর্জা ও রেসকিউ নেটওয়ার্ক অ্যাপ কমিউনিটি ফিডে প্রকাশ")}</label>
                <label className="flex items-center gap-2 border-t pt-2"><Checkbox checked={e.published} onCheckedChange={(v) => setEdit({ ...e, published: !!v })} />{tr("Published (uncheck to keep as draft)", "প্রকাশিত (খসড়া রাখতে টিক তুলে দিন)")}</label>
              </div>
              <div className="flex gap-2"><Button type="submit"><Save /> {tr("Save post", "পোস্ট সংরক্ষণ")}</Button><Button type="button" variant="outline" onClick={() => setEdit(null)}>{tr("Cancel", "বাতিল")}</Button></div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

const Q_TONE: Record<Inquiry["status"], string> = { new: "bg-crimson-soft text-crimson", progress: "bg-amber-soft text-amber", resolved: "bg-emerald-soft text-emerald" };

function InboxCrm() {
  const d = useDemo();
  const { tr } = useT();
  const label = (s: Inquiry["status"]) => s === "new" ? tr("New", "নতুন") : s === "progress" ? tr("In Progress", "চলমান") : tr("Resolved", "সমাধান হয়েছে");
  const upd = (id: string, p: Partial<Inquiry>) => d.set((s) => ({ inquiries: s.inquiries.map((q) => (q.id === id ? { ...q, ...p } : q)) }));
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 font-display text-lg font-bold"><Inbox className="h-5 w-5 text-crimson" /> {tr("Contact Us inbox", "যোগাযোগ ইনবক্স")}</p>
      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>{tr("Sender", "প্রেরক")}</TableHead><TableHead>{tr("Subject & message", "বিষয় ও বার্তা")}</TableHead><TableHead>{tr("Received", "প্রাপ্তি")}</TableHead><TableHead>{tr("Status", "অবস্থা")}</TableHead><TableHead className="min-w-[200px]">{tr("Admin notes", "অ্যাডমিন নোট")}</TableHead><TableHead className="text-right">{tr("Actions", "কার্যক্রম")}</TableHead></TableRow></TableHeader>
          <TableBody>
            {d.inquiries.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">{tr("No messages yet", "এখনো কোনো বার্তা নেই")}</TableCell></TableRow>}
            {d.inquiries.map((q) => (
              <TableRow key={q.id}>
                <TableCell><p className="font-semibold">{q.name}</p><p className="text-xs text-muted-foreground">{q.contact}</p></TableCell>
                <TableCell className="max-w-[320px]"><p className="font-semibold">{q.subject}</p><p className="line-clamp-2 text-xs text-muted-foreground">{q.message}</p></TableCell>
                <TableCell className="whitespace-nowrap text-xs">{q.at}</TableCell>
                <TableCell>
                  <Select value={q.status} onValueChange={(v) => upd(q.id, { status: v as Inquiry["status"] })}>
                    <SelectTrigger className={cn("h-8 w-[130px] border-0 text-xs font-bold", Q_TONE[q.status])}><SelectValue /></SelectTrigger>
                    <SelectContent>{(["new", "progress", "resolved"] as const).map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell><Input className="h-8 text-xs" value={q.notes} onChange={(e) => upd(q.id, { notes: e.target.value })} placeholder={tr("Add a note…", "নোট লিখুন…")} /></TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  {q.status !== "resolved" && <Button size="sm" variant="outline" onClick={() => { upd(q.id, { status: "resolved" }); toast.success(tr("Marked as resolved", "সমাধান হিসেবে চিহ্নিত")); }}><Check /> {tr("Resolve", "সমাধান")}</Button>}
                  <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => d.set((s) => ({ inquiries: s.inquiries.filter((x) => x.id !== q.id) }))}><Trash2 className="text-crimson" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function VolunteerPipeline() {
  const d = useDemo();
  const { tr } = useT();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const list = d.volunteerApps.filter((a) => filter === "all" || a.status === filter);
  const count = (s: string) => d.volunteerApps.filter((a) => a.status === s).length;
  const note = (id: string, notes: string) => d.set((s) => ({ volunteerApps: s.volunteerApps.map((a) => (a.id === id ? { ...a, notes } : a)) }));
  const F = [["pending", tr("Pending", "অপেক্ষমাণ")], ["approved", tr("Approved (ID generated)", "অনুমোদিত (আইডি তৈরি)")], ["rejected", tr("Rejected", "বাতিল")], ["all", tr("All", "সব")]] as const;
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-display text-lg font-bold"><Globe className="h-5 w-5 text-crimson" /> {tr("Volunteer leads & applications", "ভলান্টিয়ার আবেদন পাইপলাইন")}</p>
        <div className="flex flex-wrap gap-1">
          {F.map(([k, l]) => <button key={k} onClick={() => setFilter(k)} className={cn("rounded-lg border px-3 py-1.5 text-xs font-bold", filter === k ? "border-primary bg-primary text-primary-foreground" : "bg-card")}>{l}{k !== "all" && ` (${count(k)})`}</button>)}
        </div>
      </div>
      <div className="space-y-3">
        {list.length === 0 && <Card className="text-center text-sm text-muted-foreground">{tr("No applications in this view", "এই তালিকায় কোনো আবেদন নেই")}</Card>}
        {list.map((a) => (
          <Card key={a.id} className="flex flex-wrap items-start gap-4">
            <div className="grid h-20 w-32 shrink-0 place-items-center rounded-lg border bg-muted text-center text-[10px] text-muted-foreground"><div><ImageIcon className="mx-auto h-6 w-6" />{a.hasPhoto ? tr("NID photo", "এনআইডি ছবি") : tr("No photo", "ছবি নেই")}</div></div>
            <div className="min-w-[240px] flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2"><p className="font-display font-bold">{a.name}</p>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold capitalize", a.status === "approved" ? "bg-emerald-soft text-emerald" : a.status === "rejected" ? "bg-crimson-soft text-crimson" : "bg-amber-soft text-amber")}>{a.status}</span>
                {a.volunteerId && <span className="font-mono text-sm font-bold text-emerald">{a.volunteerId}</span>}</div>
              <p className="text-sm text-muted-foreground">{a.occupation} · {a.address} · {a.phone} · {a.email}</p>
              <p className="text-xs text-muted-foreground">NID {a.nid} · {a.submittedAt}</p>
              <p className="text-sm italic">"{a.motivation}"</p>
              <Textarea rows={2} className="mt-2 text-xs" value={a.notes ?? ""} onChange={(e) => note(a.id, e.target.value)} placeholder={tr("Screening notes…", "যাচাই নোট…")} />
            </div>
            {a.status === "pending" && (
              <div className="flex flex-col gap-2">
                <Button onClick={() => { const id = d.approveVolunteer(a.id); toast.success(tr("Volunteer approved", "ভলান্টিয়ার অনুমোদিত"), { description: `ID ${id}` }); }}><Check /> {tr("Approve & Auto-Generate Volunteer ID", "অনুমোদন ও ভলান্টিয়ার আইডি তৈরি")}</Button>
                <Button variant="outline" onClick={() => { d.rejectVolunteer(a.id); toast(tr("Application rejected", "আবেদন বাতিল")); }}>{tr("Reject", "বাতিল")}</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
