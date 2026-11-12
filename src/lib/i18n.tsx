import { useEffect, useRef } from "react";
import { startAutoTranslate } from "./auto-translate";
import { useDemo } from "./demo-store";
import { cn } from "./utils";
import { MOCK_BN } from "./mock-data-bn";

export type Lang = "bn" | "en";
export const DEFAULT_LANG: Lang = "bn";
export type Bi = { en: string; bn: string };

import { toBnDigits } from "./i18n-digits";
export { toBnDigits };

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
  const langRef = useRef(lang);
  const ctl = useRef<ReturnType<typeof startAutoTranslate> | null>(null);
  useEffect(() => {
    ctl.current = startAutoTranslate(document.body, () => langRef.current);
    return () => ctl.current?.stop();
  }, []);
  useEffect(() => {
    langRef.current = lang;
    document.documentElement.lang = lang;
    ctl.current?.refresh();
  }, [lang]);
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

/** Language row for in-app Profile settings (mobile apps). */
export function LanguageSetting({ dark }: { dark?: boolean }) {
  const { lang, setLang, tr } = useT();
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-bold">{tr("Language", "ভাষা")}</p>
        <p className={cn("text-xs", dark ? "text-paper/60" : "text-muted-foreground")}>{tr("App display language", "অ্যাপের প্রদর্শন ভাষা")}</p>
      </div>
      <div className={cn("inline-flex shrink-0 rounded-lg border p-0.5 text-xs font-bold", dark ? "border-paper/10 bg-paper/5" : "bg-muted")} role="group" aria-label="Language">
        {(["bn", "en"] as const).map((l) => (
          <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
            className={cn("rounded-md px-3 py-1.5 transition", lang === l ? "bg-crimson text-paper shadow-sm" : dark ? "text-paper/70" : "text-muted-foreground")}>
            {l === "bn" ? "বাংলা" : "English"}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Official NURJA brand slogan (bilingual). */
export const SLOGAN = { en: "Safety • Confidence • Freedom", bn: "নিরাপত্তা • আত্মবিশ্বাস • স্বাধীনতা" } as const;
export function Slogan({ className }: { className?: string }) {
  const { lang } = useT();
  return <span className={cn("tracking-wide", className)} data-no-tr>{lang === "bn" ? SLOGAN.bn : SLOGAN.en}</span>;
}
