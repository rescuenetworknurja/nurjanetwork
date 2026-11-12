# NURJA — Frontend Prototype (mock data, no backend)

Four interfaces in one app, sharing a demo state store, with a floating "Demo View Switcher" pill (top-right, collapsible) to jump between them and flip states: KYC Pending/Approved, Adult/Under-18, Type 1 Police/Type 2 Volunteer, Onboarding/Main App.

## Brand & design
- Uploaded NURJA logo, lettering, app icon and Rescue Network logo used throughout; NURJA app icon becomes the favicon.
- Colors: Emergency Crimson #E11D48, Command Navy #0F172A, Trust Emerald #10B981, Warning Amber #F59E0B, plus brand plum from the wordmark. Danger zone scale #FECDD3 → #FB7185 → #881337.
- Fonts: Sora (headings) + Manrope (body). Light public site and user app; dark tactical style for Rescue Network and Control Panel.
- Smooth animations: SOS pulse/ripples, countdown, hold-to-stop progress ring, flashing alert.

## 1. Public website (`/`, `/our-story`, `/blog`, `/contact`)
Navbar, hero with live-ticking stats, 4-step "How it works", stories/blog cards with photos and YouTube embeds, footer. "Become a Volunteer" opens a form (name, phone, email, address, NID number, NID photo upload preview, occupation, motivation). Submitting shows the confirmation toast and adds the application to the Control Panel's pending list.

## 2. NURJA app (`/NURJASOS`, phone frame on desktop)
- Onboarding wizard: splash → phone → OTP → password → 6-digit PIN → name + date of birth (automatic age badge) → emergency contact → step 7 KYC, which changes by age (Adult: NID front/back + selfie; Under-18: birth registration, guardian consent form, guardian NID).
- Main app tabs: Home (KYC badge, locked or active 180px SOS, location card, 3-2-1 countdown, active broadcast with simulated camera, dispatch status, responders map with ETAs, hold-to-stop then PIN popup), Safe Route (search fields, shaded danger zones, green safest route), Community feed, Profile.

## 3. Rescue Network (`/RescueTeam`)
Type 1/Type 2 switch, role badge, Online/Offline toggle, "Simulate Incoming SOS". Type 1 sees a flashing mandatory auto-accept screen with turn-by-turn directions and victim camera. Type 2 sees an alert card (0.8 km) with Accept, which opens navigation. Tabs: Dispatch Map, Community, Case History, Profile.

## 4. Control Panel (`/rpanel`)
Sidebar with light/dark switch and 7 sections: Dashboard (KPIs + map), Live Incident & Dispatch (map + video feed, front/back camera switch, route summary, download buttons), KYC Queue (table + review drawer for adult and under-18 submissions, Approve/Reject), Rescue Network management (create Type 1/Type 2 accounts with automatic V-XXXXXX IDs; approve volunteer applications), Hazard Manager (click map to add zones, rating 1–5), Community/Blog Publisher (posts appear in the app feeds and the blog), API Settings (masked key fields, saved in the browser).

## Technical details
- TanStack routes for each path; shared React context store in `src/lib/demo-store.tsx` with seed data in `src/lib/mock-data.ts`.
- Maps are stylised SVG maps of Dhaka/Narayanganj, with no map service yet. Camera feeds are animated placeholders.
- framer-motion added; shadcn components (dialog, drawer, tabs, table, switch, input-otp, calendar, sonner) generated as needed.
- Logos uploaded as hosted assets; favicon taken from the app icon.
- Each page gets its own title and description.

## Live sync across interfaces
- One shared demo store for all 4 interfaces, saved in the browser and synced across tabs. Triggering SOS in the NURJA app shows up right away as an incoming alert in Rescue Network and as an active incident in the Control Panel. Stopping it clears the alert everywhere.
- Approving or rejecting KYC in the Control Panel updates the user's badge and unlocks SOS. Approving a volunteer generates a V-XXXXXX ID that shows in the Rescue Network profile.
- The Profile and Home screens of the NURJA app show an "Offline PWA Cache Ready" indicator. It is visual only; real offline caching comes later.
