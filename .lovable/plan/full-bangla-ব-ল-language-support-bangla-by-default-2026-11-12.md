# Full Bangla (বাংলা) language support — Bangla by default

## What you'll get
- Every screen in all 4 interfaces (Public Website, NURJA App, Rescue Network, Control Panel) shows in Bangla by default.
- A **বাংলা / EN** toggle in: the website top bar, the NURJA app header, the Rescue Network header, the Control Panel top bar, and the floating Demo Switcher. Switching is instant, remembered in the browser, and syncs across open tabs like the rest of the demo.
- Hind Siliguri font (400–700) is used automatically while Bangla is active; Sora/Manrope stay for English.
- Numbers in Bangla mode use Bangla digits where they are shown to people (countdown ৩-২-১, stats, timers, counts). Phone numbers, PIN entry, IDs like V-J75UN2 and SOS case IDs stay in Latin digits so they remain typeable/searchable.

## What gets translated (using your exact wording)
- **Website:** nav (হোম, আমাদের গল্প, ব্লগ ও ঘটনা, যোগাযোগ, ভলান্টিয়ার হোন), hero, "কীভাবে কাজ করে" steps, stats, Our Story, Blog cards, Contact page, footer, and the full volunteer form with its labels and error messages.
- **NURJA App:** all 8 onboarding/KYC steps with your text (adult and under-18 paths, badges), bottom tabs, KYC status, SOS button, countdown, broadcast message, incoming responders, hold-to-stop and PIN popup, Safe Route and danger legend, Community, Profile, offline badge.
- **Rescue Network:** online/offline, Type 1 / Type 2 labels, incoming alert, accept button, map & directions, bottom tabs, case history, profile.
- **Control Panel:** all 7 sidebar menus, dashboard, dispatch actions (camera switch, video download, route summary), KYC, network, zones, publisher, API settings, status badges and toasts.
- **Demo content:** stories, posts, area names, responder names and case outcomes get Bangla versions too.

## Technical details
- New `src/lib/i18n.tsx`: `bn` and `en` dictionaries (grouped by interface), `useT()` hook returning `t(key)`, `num()` for Bangla digits, and `LangToggle` component.
- `lang` added to the shared demo store (default `"bn"`, persisted + cross-tab synced); `<html lang>` and a `lang-bn` body class updated in an effect so Hind Siliguri applies via CSS.
- Font loaded with the existing Google Fonts `<link>` in the root route (this project has no index.html); `--font-sans`/`--font-display` switch to Hind Siliguri under `.lang-bn` in styles.css.
- Mock data gets bilingual fields (`{ bn, en }`) for user-facing text; IDs and codes unchanged.
- Validation messages (phone, age cutoff) translated; existing logic and tests untouched. Add a small test that every `en` key has a `bn` counterpart and that default language is `bn`.
- Page titles/descriptions stay English for search previews.
