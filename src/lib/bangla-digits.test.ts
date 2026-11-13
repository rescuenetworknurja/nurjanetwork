import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/styles.css", "utf8");
const fontUrls = [...css.matchAll(/url\("([^"]+\.woff2)"\)/g)].map((m) => m[1]);

describe("Bangla digit font", () => {
  it("loads Noto Sans Bengali from files the site actually serves", () => {
    expect(fontUrls.length).toBeGreaterThan(0);
    for (const url of fontUrls) {
      expect(url, `digit font must be a site path, not a bare package path: ${url}`).toMatch(/^\//);
      expect(existsSync(`public${url}`), `missing font file public${url}`).toBe(true);
    }
  });

  it("restricts the font to digits so Bangla lettering stays unchanged", () => {
    expect(css).toContain("font-family: \"Noto Sans Bengali\"");
    expect(css).toMatch(/unicode-range:\s*U\+09E6-09EF/);
    expect(css).toMatch(/unicode-range:\s*U\+0030-0039/);
    expect(css).toContain("--font-bn: \"Noto Sans Bengali\"");
    expect(css).toMatch(/html\[lang="bn"\] body/);
  });
});
