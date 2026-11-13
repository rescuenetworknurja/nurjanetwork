import { describe, expect, it } from "vitest";
import { seedPosts } from "./mock-data";
import {
  DEFAULT_STORY_FILTER,
  dayIndex,
  filterStories,
  inDateRange,
  storyFilterActive,
  storyTopics,
  type StoryFilter,
} from "./story-filters";

/** Fixed "today" so the day-count filters are checked against known dates. */
const NOW = new Date("2026-11-13T07:00:00Z");
const f = (over: Partial<StoryFilter>): StoryFilter => ({ ...DEFAULT_STORY_FILTER, ...over });

describe("storyTopics", () => {
  it("lists each topic once, alphabetical", () => {
    expect(storyTopics(seedPosts)).toEqual(["Awareness", "Community", "Incident Story"]);
  });
});

describe("dayIndex", () => {
  it("counts whole days between two ISO dates", () => {
    expect(dayIndex("2026-11-13") - dayIndex("2026-11-08")).toBe(5);
  });
  it("returns NaN for unreadable dates", () => {
    expect(Number.isNaN(dayIndex("Nov 08, 2026"))).toBe(true);
    expect(Number.isNaN(dayIndex("2026-13-40"))).toBe(true);
  });
});

describe("filterStories by publication date", () => {
  it("Last 7 days keeps only stories from 2026-11-07 onward", () => {
    expect(filterStories(seedPosts, f({ range: "7d" }), NOW).map((p) => p.id)).toEqual(["p1"]);
  });
  it("Last 30 days reaches back to 2026-10-15", () => {
    expect(filterStories(seedPosts, f({ range: "30d" }), NOW).map((p) => p.id)).toEqual(["p1", "p2", "p3", "p4"]);
  });
  it("Last 90 days keeps everything seeded", () => {
    expect(filterStories(seedPosts, f({ range: "90d" }), NOW)).toHaveLength(seedPosts.length);
  });
  it("This year keeps only 2026 stories", () => {
    expect(filterStories(seedPosts, f({ range: "year" }), NOW)).toHaveLength(seedPosts.length);
    expect(filterStories(seedPosts, f({ range: "year" }), new Date("2027-03-01T00:00:00Z"))).toHaveLength(0);
  });
  it("Custom range is inclusive on both ends", () => {
    const got = filterStories(seedPosts, f({ range: "custom", from: "2026-10-20", to: "2026-11-05" }), NOW);
    expect(got.map((p) => p.id)).toEqual(["p2", "p3"]);
  });
  it("Custom range with only a start date is open-ended", () => {
    expect(filterStories(seedPosts, f({ range: "custom", from: "2026-11-01" }), NOW).map((p) => p.id)).toEqual([
      "p1", "p2",
    ]);
  });
  it("A story with no readable date survives All time but drops out of dated ranges", () => {
    const odd = [...seedPosts, { ...seedPosts[0]!, id: "px", date: "" }];
    expect(filterStories(odd, f({ range: "all" }), NOW).map((p) => p.id)).toContain("px");
    expect(filterStories(odd, f({ range: "30d" }), NOW).map((p) => p.id)).not.toContain("px");
  });
});

describe("filterStories by topic and order", () => {
  it("filters by topic", () => {
    expect(filterStories(seedPosts, f({ topic: "Awareness" }), NOW).map((p) => p.id)).toEqual(["p3", "p4"]);
  });
  it("combines topic and date range", () => {
    expect(filterStories(seedPosts, f({ topic: "Awareness", range: "7d" }), NOW)).toHaveLength(0);
  });
  it("newest first by default, oldest first when asked", () => {
    expect(filterStories(seedPosts, f({}), NOW).map((p) => p.id)).toEqual(["p1", "p2", "p3", "p4"]);
    expect(filterStories(seedPosts, f({ sort: "oldest" }), NOW).map((p) => p.id)).toEqual(["p4", "p3", "p2", "p1"]);
  });
});

describe("storyFilterActive", () => {
  it("is false for defaults and true once anything changes", () => {
    expect(storyFilterActive(DEFAULT_STORY_FILTER)).toBe(false);
    expect(storyFilterActive(f({ topic: "Community" }))).toBe(true);
    expect(storyFilterActive(f({ range: "custom", from: "2026-01-01" }))).toBe(true);
  });
});

describe("inDateRange", () => {
  it("All time accepts any date", () => {
    expect(inDateRange("2019-01-01", "all", "", "", NOW)).toBe(true);
  });
});
