import { BN, BN_PATTERNS } from "./translations-bn";
import { toBnDigits } from "./i18n-digits";

/** Convert short standalone numbers to Bangla digits; leave phones, IDs and codes untouched. */
function convertDigits(text: string): string {
  return text.replace(/[^\s]+/g, (tok) => {
    if (!/\d/.test(tok) || /[A-Za-z]/.test(tok) || tok.startsWith("+") || /\d{7,}/.test(tok)) return tok;
    return toBnDigits(tok);
  });
}

export function translateText(text: string): string {
  const core = text.trim();
  if (!core) return text;
  let out = BN[core];
  if (out === undefined) {
    for (const [re, rep] of BN_PATTERNS) {
      if (re.test(core)) { out = core.replace(re, (...m) => rep.replace(/\$(\d)/g, (_, i) => BN[m[Number(i)]] ?? m[Number(i)])); break; }
    }
  }
  out = convertDigits(out ?? core);
  if (out === core) return text;
  return text.replace(core, out);
}

const ATTRS = ["placeholder", "aria-label", "title", "alt"] as const;
type Entry = { orig: string; tr: string };

/**
 * Translates rendered UI text in place while Bangla is active, and restores English when switched back.
 * Only text-node values and a few attributes are changed, so React's DOM structure is never altered.
 */
export function startAutoTranslate(root: HTMLElement, getLang: () => "bn" | "en") {
  const texts = new Map<Text, Entry>();
  const attrs = new Map<Element, Record<string, Entry>>();
  const skip = (el: Element | null) => !!el?.closest("script,style,textarea,[data-no-tr],[contenteditable]");

  const doText = (n: Text) => {
    if (skip(n.parentElement)) return;
    const cur = n.nodeValue ?? "";
    let e = texts.get(n);
    if (!e || (cur !== e.tr && cur !== e.orig)) { e = { orig: cur, tr: translateText(cur) }; texts.set(n, e); }
    const want = getLang() === "bn" ? e.tr : e.orig;
    if (cur !== want) n.nodeValue = want;
  };
  const doEl = (el: Element) => {
    if (skip(el)) return;
    for (const a of ATTRS) {
      const cur = el.getAttribute(a);
      if (cur == null) continue;
      const rec = attrs.get(el) ?? {};
      let e = rec[a];
      if (!e || (cur !== e.tr && cur !== e.orig)) { e = { orig: cur, tr: translateText(cur) }; rec[a] = e; attrs.set(el, rec); }
      const want = getLang() === "bn" ? e.tr : e.orig;
      if (cur !== want) el.setAttribute(a, want);
    }
  };
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) return doText(node as Text);
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    doEl(node as Element);
    const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let c = w.nextNode();
    while (c) { if (c.nodeType === Node.TEXT_NODE) doText(c as Text); else doEl(c as Element); c = w.nextNode(); }
  };

  const obs = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === "characterData") doText(m.target as Text);
      else if (m.type === "attributes") doEl(m.target as Element);
      else m.addedNodes.forEach(walk);
    }
  });
  walk(root);
  obs.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });
  return { refresh: () => walk(root), stop: () => obs.disconnect() };
}
