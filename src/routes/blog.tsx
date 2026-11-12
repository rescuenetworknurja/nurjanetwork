import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/nurja/SiteLayout";
import { PostCard, PostMedia } from "@/components/nurja/PostCard";
import { useDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Incident Stories & Awareness | NURJA" },
      { name: "description", content: "Verified incident stories, safety awareness guides and videos from the NURJA Rescue Network." },
      { property: "og:title", content: "Blog — Incident Stories & Awareness | NURJA" },
      { property: "og:description", content: "Verified incident stories, safety awareness guides and videos." },
    ],
  }),
  component: Blog,
});

function Blog() {
  const { posts } = useDemo();
  const all = posts.filter((p) => p.targets.blog);
  const tags = ["All", ...Array.from(new Set(all.map((p) => p.tag)))];
  const [tag, setTag] = useState("All");
  const list = all.filter((p) => tag === "All" || p.tag === tag);
  const [featured, ...rest] = list;
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h1 className="text-5xl font-extrabold">Stories & Awareness</h1>
        <p className="mt-2 text-muted-foreground">Published and verified by the NURJA Control Panel.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((t) => (
            <button key={t} onClick={() => setTag(t)} className={cn("rounded-full border px-4 py-1.5 text-sm font-semibold", tag === t ? "border-primary bg-primary text-primary-foreground" : "bg-card")}>{t}</button>
          ))}
        </div>
        {featured && (
          <article className="mt-8 grid overflow-hidden rounded-3xl border bg-card shadow-card md:grid-cols-2">
            <PostMedia post={featured} className="h-full" />
            <div className="space-y-3 p-8">
              <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold uppercase text-accent-foreground">{featured.tag}</span>
              <h2 className="text-3xl font-extrabold">{featured.title}</h2>
              <p className="text-muted-foreground">{featured.body}</p>
              <p className="text-xs text-muted-foreground">{featured.author} · {featured.date}</p>
            </div>
          </article>
        )}
        <div className="mt-8 grid gap-6 md:grid-cols-3">{rest.map((p) => <PostCard key={p.id} post={p} />)}</div>
      </section>
    </SiteLayout>
  );
}
