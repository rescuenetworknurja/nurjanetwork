import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import { SiteLayout } from "@/components/nurja/SiteLayout";
import { PostCard, PostMedia } from "@/components/nurja/PostCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemo } from "@/lib/demo-store";
import { useT } from "@/lib/i18n";
import {
  DATE_RANGES,
  DEFAULT_STORY_FILTER,
  filterStories,
  storyFilterActive,
  storyTopics,
  type StoryDateRange,
  type StoryFilter,
  type StorySort,
} from "@/lib/story-filters";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Stories & Awareness — Incident Stories | NURJA" },
      { name: "description", content: "Verified incident stories, safety awareness guides and videos from the NURJA Rescue Network. Filter by topic and publication date." },
      { property: "og:title", content: "Stories & Awareness — Incident Stories | NURJA" },
      { property: "og:description", content: "Verified incident stories, safety awareness guides and videos. Filter by topic and publication date." },
    ],
  }),
  component: Blog,
});

function Blog() {
  const { posts } = useDemo();
  const { lang, tr, num } = useT();
  const pick = (en: string, bn?: string) => (lang === "bn" && bn ? bn : en);

  const all = useMemo(() => posts.filter((p) => p.targets.blog && p.published !== false), [posts]);
  const topics = useMemo(() => ["All", ...storyTopics(all)], [all]);

  const [filter, setFilter] = useState<StoryFilter>(DEFAULT_STORY_FILTER);
  const set = <K extends keyof StoryFilter>(key: K, value: StoryFilter[K]) =>
    setFilter((f) => ({ ...f, [key]: value }));

  const list = useMemo(() => filterStories(all, filter), [all, filter]);
  const [featured, ...rest] = list;
  const active = storyFilterActive(filter);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h1 className="text-5xl font-extrabold">{tr("Stories & Awareness")}</h1>
        <p className="mt-2 text-muted-foreground">{tr("Published and verified by the NURJA Control Panel.")}</p>

        <div className="mt-6 space-y-4 rounded-2xl border bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{tr("Topic")}</span>
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("topic", t)}
                aria-pressed={filter.topic === t}
                className={cn(
                  "rounded-lg border px-4 py-1.5 text-sm font-semibold transition",
                  filter.topic === t ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
                )}
              >
                {t === "All" ? tr("All") : t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{tr("Published")}</span>
              <Select value={filter.range} onValueChange={(v) => set("range", v as StoryDateRange)}>
                <SelectTrigger className="w-48 rounded-lg bg-background text-sm font-semibold normal-case tracking-normal"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((r) => <SelectItem key={r.id} value={r.id}>{tr(r.label)}</SelectItem>)}
                </SelectContent>
              </Select>
            </label>

            {filter.range === "custom" && (
              <>
                <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {tr("From")}
                  <Input type="date" value={filter.from} max={filter.to || undefined}
                    onChange={(e) => set("from", e.target.value)} className="w-44 rounded-lg bg-background text-sm font-semibold" />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {tr("To")}
                  <Input type="date" value={filter.to} min={filter.from || undefined}
                    onChange={(e) => set("to", e.target.value)} className="w-44 rounded-lg bg-background text-sm font-semibold" />
                </label>
              </>
            )}

            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <span className="flex items-center gap-1.5"><ChevronDown className="h-3.5 w-3.5" />{tr("Order")}</span>
              <Select value={filter.sort} onValueChange={(v) => set("sort", v as StorySort)}>
                <SelectTrigger className="w-40 rounded-lg bg-background text-sm font-semibold normal-case tracking-normal"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{tr("Newest first")}</SelectItem>
                  <SelectItem value="oldest">{tr("Oldest first")}</SelectItem>
                </SelectContent>
              </Select>
            </label>

            {active && (
              <button type="button" onClick={() => setFilter(DEFAULT_STORY_FILTER)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted">
                <X className="h-3.5 w-3.5" />{tr("Clear filters")}
              </button>
            )}

            <p className="ml-auto text-sm text-muted-foreground">
              {tr("Showing")} {num(list.length)} {tr("of")} {num(all.length)} {tr("stories")}
            </p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed bg-card p-10 text-center">
            <p className="font-display text-lg font-bold">{tr("No stories match these filters")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{tr("Try another topic or a wider date range.")}</p>
          </div>
        ) : (
          <>
            {featured && (
              <article className="mt-8 grid overflow-hidden rounded-3xl border bg-card shadow-card md:grid-cols-2">
                <PostMedia post={featured} className="h-full" />
                <div className="space-y-4 p-8 md:p-10">
                  <span className="inline-flex w-fit items-center rounded-full bg-accent px-2.5 py-1 text-xs font-bold uppercase text-accent-foreground">{featured.tag}</span>
                  <h2 className="text-3xl font-extrabold leading-tight">{pick(featured.title, featured.titleBn)}</h2>
                  <p className="text-muted-foreground">{pick(featured.body, featured.bodyBn)}</p>
                  <p className="text-xs text-muted-foreground">{featured.author} · {featured.date}</p>
                </div>
              </article>
            )}
            <div className="mt-8 grid gap-6 md:grid-cols-3">{rest.map((p) => <PostCard key={p.id} post={p} />)}</div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
