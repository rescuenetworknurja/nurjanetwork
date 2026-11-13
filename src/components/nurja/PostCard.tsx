import { PlayCircle, Share2 } from "lucide-react";
import type { Post } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export function PostMedia({ post, className }: { post: Post; className?: string }) {
  if (post.youtube)
    return (
      <div className={cn("relative aspect-video overflow-hidden bg-ink", className)}>
        <iframe src={post.youtube} title={post.title} className="absolute inset-0 h-full w-full" loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
    );
  if (post.image) return <img src={post.image} alt="" loading="lazy" className={cn("aspect-video w-full object-cover", className)} />;
  return null;
}

export function PostCard({ post, compact, dark, id, onShare }: { post: Post; compact?: boolean; dark?: boolean; id?: string; onShare?: () => void }) {
  const { lang } = useT();
  const bn = lang === "bn";
  return (
    <article id={id} className={cn("overflow-hidden rounded-2xl border bg-card shadow-card", dark && "border-border")}>
      <PostMedia post={post} />
      <div className={cn("space-y-2", compact ? "p-3.5" : "p-5")}>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
          <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">{post.tag}</span>
          {post.youtube && <span className="flex items-center gap-1 text-muted-foreground"><PlayCircle className="h-3 w-3" /> Video</span>}
          <span className="ml-auto text-muted-foreground">{post.date}</span>
        </div>
        <h3 className={cn("font-display font-bold leading-snug", compact ? "text-[15px]" : "text-lg")}>{bn && post.titleBn ? post.titleBn : post.title}</h3>
        <p className="text-sm text-muted-foreground">{bn && post.excerptBn ? post.excerptBn : post.excerpt}</p>
        <p className="text-xs text-muted-foreground">Published by <span className="font-semibold text-foreground">{post.author}</span> · Verified</p>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition hover:bg-muted"
          >
            <Share2 className="h-3.5 w-3.5" />{bn ? "শেয়র করুন" : "Share"}
          </button>
        )}
      </div>
    </article>
  );
}
