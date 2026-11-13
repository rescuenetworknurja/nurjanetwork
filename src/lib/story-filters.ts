import type { Post } from "./mock-data";

/** Topic = a story's tag. Publication date = its ISO YYYY-MM-DD date field. */
export type StoryDateRange = "all" | "7d" | "30d" | "90d" | "year" | "custom";
export type StorySort = "newest" | "oldest";

export const DATE_RANGES: { id: StoryDateRange; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "year", label: "This year" },
  { id: "custom", label: "Custom date range" },
];

export type StoryFilter = {
  topic: string;
  range: StoryDateRange;
  /** YYYY-MM-DD, only used when range === "custom"; empty means open-ended. */
  from: string;
  to: string;
  sort: StorySort;
};

export const DEFAULT_STORY_FILTER: StoryFilter = { topic: "All", range: "all", from: "", to: "", sort: "newest" };

/** Paginate the filtered result, including the featured story in the page limit. */
export function paginateStories(posts: Post[], requestedPage: number) {
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const page = Math.min(totalPages, Math.max(1, Math.floor(requestedPage)));
  const offset = (page - 1) * pageSize;
  return { items: posts.slice(offset, offset + pageSize), page, totalPages };
}

/** Every distinct topic in the list, alphabetical, ready for filter chips. */
export function storyTopics(posts: Post[]): string[] {
  return Array.from(new Set(posts.map((p) => p.tag))).sort();
}

/** Whole days since the epoch for a YYYY-MM-DD string; NaN when it cannot be read. */
export function dayIndex(date: string): number {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(date.trim());
  if (!m) return NaN;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return NaN;
  return Math.floor(Date.UTC(y, mo - 1, d) / 86400000);
}

const RANGE_DAYS: Partial<Record<StoryDateRange, number>> = { "7d": 7, "30d": 30, "90d": 90 };

/** Does a publication date fall inside the chosen range? */
export function inDateRange(date: string, range: StoryDateRange, from: string, to: string, now: Date): boolean {
  const day = dayIndex(date);
  if (Number.isNaN(day)) return range === "all";
  if (range === "all") return true;
  if (range === "custom") {
    const first = from ? dayIndex(from) : NaN;
    const last = to ? dayIndex(to) : NaN;
    if (!Number.isNaN(first) && day < first) return false;
    if (!Number.isNaN(last) && day > last) return false;
    return true;
  }
  if (range === "year") return date.slice(0, 4) === String(now.getUTCFullYear());
  const days = RANGE_DAYS[range];
  if (days === undefined) return true;
  const today = dayIndex(now.toISOString().slice(0, 10));
  return day >= today - (days - 1);
}

/** Apply topic + publication-date filters, then sort by publication date. */
export function filterStories(posts: Post[], f: StoryFilter, now: Date = new Date()): Post[] {
  const list = posts.filter(
    (p) => (f.topic === "All" || p.tag === f.topic) && inDateRange(p.date, f.range, f.from, f.to, now),
  );
  const dir = f.sort === "oldest" ? 1 : -1;
  return [...list].sort((a, b) => {
    const diff = dayIndex(a.date) - dayIndex(b.date);
    if (!Number.isNaN(diff) && diff !== 0) return diff * dir;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

/** True when any filter differs from the default (drives the Clear button). */
export function storyFilterActive(f: StoryFilter): boolean {
  return (
    f.topic !== "All" || f.range !== "all" || f.sort !== "newest" || f.from !== "" || f.to !== ""
  );
}
