import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("NURJASOS installation", () => {
  it("opens the requested user app when launched from its installed icon", () => {
    const manifest = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));
    expect(manifest.start_url).toBe("/NURJASOS");
  });
});