import { describe, expect, it } from "vitest";
import { buildStoryCardSpec, formatStoryDate, wrapText } from "./story-card";

const post = {
  image: "/assets/story-patrol.jpg",
  tag: "Incident Story",
  title: "How a 3-second SOS stopped an assault in Mirpur-10",
  titleBn: "৩ সেকেন্ডের SOS কীভাবে মিরপুর-১০-এ হামলা থামাল",
  excerpt: "A patrol unit reached Shirin within 4 minutes after her SOS was triggered near the metro station.",
  excerptBn: "মেট্রো স্টেশনের কাছে SOS চালু হওয়ার ৪ মিনিটের মধ্যে প্যাট্রোল ইউনিট শিরিনের কাছে পৌঁছায়।",
  author: "NURJA Control",
  date: "2026-11-08",
};

const opts = {
  lang: "en" as const,
  url: "https://nurja.app/blog#p1",
  tag: "Incident Story",
  title: post.title,
  excerpt: post.excerpt,
  slogan: "Safety • Confidence • Freedom",
  badge: "Verified story",
};

describe("formatStoryDate", () => {
  it("reads an ISO date in English", () => {
    expect(formatStoryDate("2026-11-08", "en")).toBe("8 Nov 2026");
  });
  it("reads an ISO date in Bangla with Bangla month names and digits", () => {
    expect(formatStoryDate("2026-11-08", "bn")).toBe("৮ নভেম্বর ২০২৬");
  });
  it("passes free-text CMS dates through untouched", () => {
    expect(formatStoryDate("Last week", "en")).toBe("Last week");
  });
});

describe("wrapText", () => {
  const measure = (s: string) => s.length * 10;
  it("wraps at the pixel budget without dropping words", () => {
    expect(wrapText("alpha beta gamma", measure, 100)).toEqual(["alpha beta", "gamma"]);
  });
  it("ellipsizes instead of overflowing the line cap", () => {
    expect(wrapText("alpha beta gamma", measure, 100, 1)).toEqual(["alpha…"]);
  });
});

describe("buildStoryCardSpec", () => {
  it("carries the story text, link and branding onto a 4:5 card", () => {
    const spec = buildStoryCardSpec(post, opts);
    expect(spec.width).toBe(1080);
    expect(spec.height).toBe(1350);
    expect(spec.title).toBe("How a 3-second SOS stopped an assault in Mirpur-10");
    expect(spec.photo).toBe("/assets/story-patrol.jpg");
    expect(spec.byline).toBe("NURJA Control · 8 Nov 2026");
    expect(spec.url).toBe("https://nurja.app/blog#p1");
    expect(spec.host).toBe("nurja.app");
    expect(spec.brand).toBe("NURJA");
    expect(spec.badge).toBe("Verified story");
  });
  it("drops the photo for video posts so the branded band is used", () => {
    const spec = buildStoryCardSpec({ ...post, youtube: "https://www.youtube.com/embed/KuRxu4Ncsmc" }, opts);
    expect(spec.photo).toBeUndefined();
  });
});
