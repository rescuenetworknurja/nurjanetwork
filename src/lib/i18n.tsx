import { useEffect } from "react";
import { useDemo } from "./demo-store";
import { cn } from "./utils";
import { MOCK_BN } from "./mock-data-bn";

export type Lang = "bn" | "en";
export const DEFAULT_LANG: Lang = "bn";
export type Bi = { en: string; bn: string };

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
/** Convert Latin digits to Bangla digits. */
export function toBnDigits(v: string | number): string {
  return String(v).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/** Pick text for a language from an inline pair or a Bi object. */
export function pick(lang: Lang, en: string | Bi, bn?: string): string {
  if (typeof en === "object") return en[lang];
  return lang === "bn" && bn !== undefined ? bn : en;
}

export function useT() {
  const { lang, set } = useDemo();
  return {
    lang,
    setLang: (l: Lang) => set({ lang: l }),
    /** tr("English", "বাংলা") or tr({en, bn}) */
    tr: (en: string | Bi, bn?: string) => pick(lang, en, bn),
    /** Translate a demo-data string (from mock-data.ts) via MOCK_BN. */
    d: (en: string) => (lang === "bn" ? MOCK_BN[en] ?? en : en),
    /** Display number in the active script (not for phones/IDs/PINs). */
    num: (v: string | number) => (lang === "bn" ? toBnDigits(v) : String(v)),
  };
}

/** Keeps <html lang> in sync so Bangla font CSS applies. Mount once. */
export function LangSync() {
  const { lang } = useDemo();
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return null;
}

export function LangToggle({ className, dark }: { className?: string; dark?: boolean }) {
  const { lang, setLang } = useT();
  return (
    <div className={cn("inline-flex shrink-0 rounded-full p-0.5 text-[11px] font-bold", dark ? "bg-paper/10" : "bg-muted", className)} role="group" aria-label="Language">
      {(["bn", "en"] as const).map((l) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
          className={cn("rounded-full px-2.5 py-1 transition", lang === l ? "bg-crimson text-paper" : dark ? "text-paper/70" : "text-muted-foreground")}>
          {l === "bn" ? "বাংলা" : "EN"}
        </button>
      ))}
    </div>
  );
}
