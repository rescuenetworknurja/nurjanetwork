import { describe, expect, it } from "vitest";
import { DEFAULT_LANG, pick, toBnDigits } from "./i18n";

describe("i18n", () => {
  it("defaults to Bangla", () => expect(DEFAULT_LANG).toBe("bn"));
  it("converts digits to Bangla", () => expect(toBnDigits("3-2-1 10")).toBe("৩-২-১ ১০"));
  it("picks by language", () => {
    expect(pick("bn", "Home", "হোম")).toBe("হোম");
    expect(pick("en", { en: "Home", bn: "হোম" })).toBe("Home");
  });
});
