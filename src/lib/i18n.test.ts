import { describe, expect, it } from "vitest";
import { DEFAULT_LANG, pick, toBnDigits } from "./i18n";

describe("i18n", () => {
  it("defaults to English", () => expect(DEFAULT_LANG).toBe("en"));
  it("converts digits to Bangla", () => expect(toBnDigits("3-2-1 10")).toBe("৩-২-১ ১০"));
  it("picks by language", () => {
    expect(pick("bn", "Home", "হোম")).toBe("হোম");
    expect(pick("en", { en: "Home", bn: "হোম" })).toBe("Home");
  });
});

import { translateText } from "./auto-translate";
describe("auto translation", () => {
  it("uses the user's required Bangla wording", () => {
    expect(translateText("Home")).toBe("হোম");
    expect(translateText("Become a Volunteer")).toBe("ভলান্টিয়ার হোন");
    expect(translateText("Dashboard")).toBe("ড্যাশবোর্ড");
  });
  it("keeps phone numbers and IDs in Latin digits", () => {
    expect(translateText("01712349876")).toBe("01712349876");
    expect(translateText("V-J75UN2")).toBe("V-J75UN2");
  });
  it("converts plain numbers and dynamic phrases", () => {
    expect(translateText("3")).toBe("৩");
    expect(translateText("4 min")).toBe("৪ মিনিট");
  });
});
