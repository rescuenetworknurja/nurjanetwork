import icon from "@/assets/NURJA_APP_ICON.png.asset.json";
import type { Lang } from "./i18n";
import { toBnDigits } from "./i18n-digits";
import type { Post } from "./mock-data";

/** Photocard canvas size: 4:5 portrait, the shape most chat/social apps crop nicely. */
export const CARD_W = 1080;
export const CARD_H = 1350;

const NAVY = "#0F172A";
const NAVY_SOFT = "#1E293B";
const PAPER = "#F8FAFC";
const MUTED = "#94A3B8";
const CRIMSON = "#E11D48";
const EMERALD = "#10B981";

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_BN = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্দ্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট",
  "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

/**
 * Turn an ISO-ish story date into a readable one in the active language.
 * Unparseable dates (free text from the CMS) are returned unchanged.
 */
export function formatStoryDate(date: string, lang: Lang): string {
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(date.trim());
  if (!match) return date;
  const [, y, m, d] = match;
  const month = Number(m) - 1;
  if (month < 0 || month > 11) return date;
  const day = Number(d);
  return lang === "bn" ? toBnDigits(`${day} ${MONTHS_BN[month]} ${y}`) : `${day} ${MONTHS_EN[month]} ${y}`;
}

/**
 * Greedy word wrap with a hard line cap. The last kept line gets an ellipsis
 * instead of overflowing the card. `measure` is injected so this stays pure.
 */
export function wrapText(
  text: string,
  measure: (line: string) => number,
  maxWidth: number,
  maxLines = Infinity,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last && measure(`${last}…`) > maxWidth) last = last.replace(/\s*\S+$/, "");
    kept[maxLines - 1] = `${last}…`;
    return kept;
  }
  return lines;
}

export type StoryCardSpec = {
  width: number;
  height: number;
  /** Story photo, or undefined for video posts / posts without an image. */
  photo: string | undefined;
  tag: string;
  title: string;
  excerpt: string;
  /** "Author · 8 Nov 2026" style byline. */
  byline: string;
  /** Link printed on the card and shared with it. */
  url: string;
  host: string;
  brand: string;
  slogan: string;
  badge: string;
  icon: string;
  lang: Lang;
};

/** Describe the card without touching the DOM, so the layout can be unit tested. */
export function buildStoryCardSpec(
  post: Pick<Post, "image" | "youtube" | "tag" | "title" | "titleBn" | "excerpt" | "excerptBn" | "author" | "date">,
  opts: { lang: Lang; url: string; tag: string; title: string; excerpt: string; slogan: string; badge: string },
): StoryCardSpec {
  const host = (() => {
    try {
      return new URL(opts.url).host;
    } catch {
      return "";
    }
  })();
  return {
    width: CARD_W,
    height: CARD_H,
    photo: post.youtube ? undefined : post.image,
    tag: opts.tag,
    title: opts.title,
    excerpt: opts.excerpt,
    byline: `${post.author} · ${formatStoryDate(post.date, opts.lang)}`,
    url: opts.url,
    host,
    brand: "NURJA",
    slogan: opts.slogan,
    badge: opts.badge,
    icon: icon.url,
    lang: opts.lang,
  };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  try {
    const img = new Image();
    if (!src.startsWith("data:")) img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image load failed"));
      img.src = src;
    });
    return img;
  } catch {
    return null;
  }
}

/** Cover-crop a photo into the card's top band. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, (w - dw) / 2, 0, dw, dh);
}

async function ensureFonts(lang: Lang) {
  if (typeof document === "undefined" || !document.fonts) return;
  const faces =
    lang === "bn"
      ? ['600 52px "Hind Siliguri"', '400 30px "Hind Siliguri"', '700 26px "Hind Siliguri"']
      : ['800 56px "Sora"', '400 30px "Manrope"', '700 26px "Manrope"'];
  await Promise.all(faces.map((f) => document.fonts.load(f).catch(() => undefined)));
  await document.fonts.ready.catch(() => undefined);
}

async function paint(spec: StoryCardSpec, photo?: HTMLImageElement): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = spec.width;
  canvas.height = spec.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Photocard rendering unavailable");
  const bn = spec.lang === "bn";
  const display = bn ? '"Hind Siliguri", sans-serif' : '"Sora", sans-serif';
  const body = bn ? '"Hind Siliguri", sans-serif' : '"Manrope", sans-serif';

  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, spec.width, spec.height);

  const photoH = 620;
  if (photo) {
    drawCover(ctx, photo, spec.width, photoH);
    const fade = ctx.createLinearGradient(0, photoH - 190, 0, photoH);
    fade.addColorStop(0, "rgba(15,23,42,0)");
    fade.addColorStop(1, NAVY);
    ctx.fillStyle = fade;
    ctx.fillRect(0, photoH - 190, spec.width, 190);
  } else {
    const band = ctx.createLinearGradient(0, 0, spec.width, photoH);
    band.addColorStop(0, CRIMSON);
    band.addColorStop(1, NAVY_SOFT);
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, spec.width, photoH);
  }

  // Verified badge sitting on the photo.
  ctx.font = `700 26px ${body}`;
  const badgeW = ctx.measureText(spec.badge).width + 74;
  ctx.fillStyle = "rgba(15,23,42,0.78)";
  roundRect(ctx, 64, 64, badgeW, 56, 12);
  ctx.fill();
  ctx.fillStyle = EMERALD;
  ctx.beginPath();
  ctx.arc(98, 92, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAPER;
  ctx.textBaseline = "middle";
  ctx.fillText(spec.badge, 118, 94);

  ctx.fillStyle = CRIMSON;
  roundRect(ctx, 64, 676, 92, 8, 4);
  ctx.fill();

  // Topic pill.
  ctx.font = `700 26px ${body}`;
  const tagW = ctx.measureText(spec.tag.toUpperCase()).width + 48;
  ctx.fillStyle = CRIMSON;
  roundRect(ctx, 64, 712, tagW, 52, 12);
  ctx.fill();
  ctx.fillStyle = PAPER;
  ctx.fillText(spec.tag.toUpperCase(), 88, 740);

  // Headline.
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = PAPER;
  ctx.font = `${bn ? "600" : "800"} ${bn ? 52 : 56}px ${display}`;
  const titleLines = wrapText(spec.title, (s) => ctx.measureText(s).width, spec.width - 128, 4);
  titleLines.forEach((line, i) => ctx.fillText(line, 64, 848 + i * 66));

  // Excerpt.
  const excerptTop = 848 + (titleLines.length - 1) * 66 + 62;
  ctx.fillStyle = MUTED;
  ctx.font = `400 30px ${body}`;
  const excerptLines = wrapText(spec.excerpt, (s) => ctx.measureText(s).width, spec.width - 128, 3);
  excerptLines.forEach((line, i) => ctx.fillText(line, 64, excerptTop + i * 42));

  // Byline.
  ctx.fillStyle = PAPER;
  ctx.font = `600 28px ${body}`;
  const byline = wrapText(spec.byline, (s) => ctx.measureText(s).width, spec.width - 128, 1);
  ctx.fillText(byline[0] ?? spec.byline, 64, 1178);

  ctx.strokeStyle = "rgba(248,250,252,0.14)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, 1212);
  ctx.lineTo(spec.width - 64, 1212);
  ctx.stroke();

  // Footer: mark + slogan + link.
  if (spec.icon) {
    const mark = await loadImage(spec.icon);
    if (mark) {
      ctx.save();
      roundRect(ctx, 64, 1240, 72, 72, 16);
      ctx.clip();
      ctx.fillStyle = PAPER;
      ctx.fillRect(64, 1240, 72, 72);
      ctx.drawImage(mark, 64, 1240, 72, 72);
      ctx.restore();
    }
  }
  ctx.fillStyle = PAPER;
  ctx.font = `800 34px ${display}`;
  ctx.fillText(spec.brand, 152, 1276);
  ctx.fillStyle = MUTED;
  ctx.font = `500 22px ${body}`;
  const slogan = wrapText(spec.slogan, (s) => ctx.measureText(s).width, 620, 1);
  ctx.fillText(slogan[0] ?? spec.slogan, 152, 1306);
  ctx.textAlign = "right";
  ctx.fillStyle = CRIMSON;
  ctx.font = `700 26px ${body}`;
  ctx.fillText(spec.host || spec.url, spec.width - 64, 1288);
  ctx.textAlign = "left";

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Photocard export failed"))), "image/png");
  });
}

/**
 * Render a story photocard to a PNG blob. A photo that cannot be drawn or that
 * taints the canvas (cross-origin without CORS) degrades to the branded card.
 */
export async function renderStoryCard(spec: StoryCardSpec): Promise<Blob> {
  await ensureFonts(spec.lang);
  const photo = spec.photo ? await loadImage(spec.photo) : null;
  try {
    return await paint(spec, photo ?? undefined);
  } catch {
    return paint(spec);
  }
}
