import { useEffect, useState } from "react";
import { Copy, Download, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDemo } from "@/lib/demo-store";
import { translateText } from "@/lib/auto-translate";
import { SLOGAN, useT } from "@/lib/i18n";
import { buildStoryCardSpec, renderStoryCard, type StoryCardSpec } from "@/lib/story-card";
import type { Post } from "@/lib/mock-data";

type Status = "loading" | "ready" | "error";

function storyUrl(post: Post) {
  const base = typeof window === "undefined" ? "" : `${window.location.origin}/blog`;
  return `${base}#${post.id}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/**
 * Share a story as a photocard: a branded PNG built from the story photo,
 * headline and excerpt, ready for chat apps that accept image files.
 */
export function StoryShareDialog({ post, open, onOpenChange }: { post: Post | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { lang, tr, num } = useT();
  const { websiteContent } = useDemo();
  const [status, setStatus] = useState<Status>("loading");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [spec, setSpec] = useState<StoryCardSpec | null>(null);

  useEffect(() => {
    if (!open || !post) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    setStatus("loading");
    setBlob(null);
    setPreview(null);
    const slogan = websiteContent?.hero.slogan ?? SLOGAN;
    // Story copy is translated by the shared dictionary, exactly like the page itself.
    const bn = lang === "bn";
    const next = buildStoryCardSpec({ ...post, author: bn ? translateText(post.author) : post.author }, {
      lang,
      url: storyUrl(post),
      tag: bn ? translateText(post.tag) : post.tag,
      title: lang === "bn" && post.titleBn ? post.titleBn : bn ? translateText(post.title) : post.title,
      excerpt: lang === "bn" && post.excerptBn ? post.excerptBn : bn ? translateText(post.excerpt) : post.excerpt,
      slogan: lang === "bn" ? slogan.bn || SLOGAN.bn : slogan.en || SLOGAN.en,
      badge: lang === "bn" ? "যাচাইকৃত গল্প" : "Verified story",
    });
    setSpec(next);
    renderStoryCard(next)
      .then((file) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(file);
        setBlob(file);
        setPreview(objectUrl);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, post, lang, websiteContent]);

  if (!post) return null;
  const filename = `nurja-${post.id}-photocard.png`;

  const share = async () => {
    if (!blob || !spec) return;
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: spec.title, text: `${spec.title}\n${spec.url}` });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    downloadBlob(blob, filename);
    toast(tr("Photocard downloaded — attach it in any chat app", "পফোটোকার্ড ডাউনলোড হয়েছের — যেকোনো চ্যাত অ্যাপে য়াটচ করুন"));
  };

  const copyLink = async () => {
    if (!spec) return;
    try {
      await navigator.clipboard.writeText(`${spec.title}\n${spec.url}`);
      toast(tr("Story link copied", "গল্পর লিঙ্ক কপি হয়েছের"));
    } catch {
      toast(tr("Could not copy the link", "লিঙ্ক কপি করা যায়নি"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{tr("Share this story", "এই গল্পটি শেয়র করুন")}</DialogTitle>
          <DialogDescription>{tr("Saves the story as a photocard image you can send anywhere.", "গল্পটি একটি পফোটোকার্ড ছবি হিসেবে সজ্জায় হয়, যেকোনো জায়গায় পাঠাওয়া যাব।")}</DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border bg-muted/30 p-3">
          {status === "loading" && (
            <div className="flex aspect-[4/5] items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />{tr("Preparing photocard", "পফোটোকার্ড তৈরি হচ্ছের")}
            </div>
          )}
          {status === "error" && (
            <div className="flex aspect-[4/5] items-center justify-center px-6 text-center text-sm font-semibold text-crimson">
              {tr("Could not prepare the photocard", "পফোটোকার্ড তৈরি করা যায়নি")}
            </div>
          )}
          {status === "ready" && preview && (
            <img src={preview} alt={tr("Story photocard preview", "গল্পর পফোটোকার্ড প্রিভিউ")} className="w-full rounded-xl" />
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button className="rounded-lg" disabled={status !== "ready"} onClick={share}>
            <Share2 />{tr("Share photocard", "পফোটোকার্ড শেয়র করুন")}
          </Button>
          <Button variant="outline" className="rounded-lg" disabled={status !== "ready"} onClick={() => blob && downloadBlob(blob, filename)}>
            <Download />{tr("Download photocard", "পফোটোকার্ড ডাউনলোড")}
          </Button>
          <Button variant="ghost" className="rounded-lg sm:col-span-2" disabled={status !== "ready"} onClick={copyLink}>
            <Copy />{tr("Copy story link", "গল্পর লিঙ্ক কপি করুন")}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {tr("Photocard is a PNG image", "পফোটোকার্ড একটি PNG ছবি")} · {num(1080)}×{num(1350)}
        </p>
      </DialogContent>
    </Dialog>
  );
}
