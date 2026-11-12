# Roadmap

## Done
- RescueTeam records arrival without closing SOS; rpanel alone marks rescued and archives the incident

## Done
- Download all incident evidence as a PDF with capture times, tags and responder information
- Track evidence gallery searches, successful tag edits and evidence opens
- Fix evidence-save failures: smaller captures, recover storage space from previous PNG frames without deleting evidence, and specific error messages

## Done
- Evidence gallery: explicit capture time, editable persisted tags, and tag/time/responder search

## Done
- Store captured stills as evidence linked to the active incident and retain them in case history using the shared prototype store
- Victim Camera: select a current demo frame, preview it inline/fullscreen, download PNG, and return to live viewing

## Done
- Victim Camera: fullscreen, landscape, exit controls and navigation-free viewing on phone/tablet/desktop

## Done
- RescueTeam: reserve navigation space outside the scroll area so the full Victim Camera clears the bottom menu and device safe area
- RescueTeam: two-column tablet/desktop Community, Victim Cam below mobile/tablet dispatch, Online/Offline control in Profile only

## Done
- Rescue Network app: splash → login → app flow, responsive mobile/tablet/desktop layout
- User Database & Account Control in /rpanel with live ban-sync to NURJA app
- Rescue Network management: Type 1/2 directories, fixed vs live GPS, smart-paste coordinates

## Done
- Fix bottom navigation bars in /NURJASOS and /RescueTeam: fixed bottom-0 z-50, glassmorphism, iOS safe-area padding, content bottom spacing so lists never hide behind the bar

## Live backend (user's own Supabase)
- [~] Phase 1: logins, accounts, roles — schema, /auth page, gates done; blocked: user must disable "Confirm email" in Supabase dashboard, then end-to-end verify signup→session→role gates
- [ ] Phase 1b: wire rpanel User Database to real profiles; NURJASOS profile from real data
- [ ] Phase 2: real-time SOS and dispatch
- [ ] Phase 3: website CMS and CRM
- [ ] Phase 4: evidence storage and reports
