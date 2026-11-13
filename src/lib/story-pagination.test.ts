import { describe, expect, it } from "vitest";
import { seedPosts } from "./mock-data";
import { paginateStories } from "./story-filters";

describe("story pagination", () => {
  const posts = [...seedPosts, ...seedPosts.map((p) => ({ ...p, id: `${p.id}-extra` }))];

  it("shows exactly four posts at a time, including the featured post", () => {
    expect(paginateStories(posts, 1).items.map((p) => p.id)).toEqual(posts.slice(0, 4).map((p) => p.id));
    expect(paginateStories(posts, 1).items).toHaveLength(4);
  });

  it("puts the remaining posts on the next page without repeating posts", () => {
    expect(paginateStories(posts, 2).items.map((p) => p.id)).toEqual(posts.slice(4, 8).map((p) => p.id));
    expect(paginateStories(posts, 2).totalPages).toBe(2);
  });

  it("clamps the page after filtering reduces the result", () => {
    expect(paginateStories(posts.slice(0, 2), 2)).toEqual({ items: posts.slice(0, 2), page: 1, totalPages: 1 });
  });
});