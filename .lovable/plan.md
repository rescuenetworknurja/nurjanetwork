# NURJA: move from demo to a live backend (your own Supabase project)

The data currently stays in each browser. This plan moves it to one shared backend in four phases, so the public site, NURJA app, Rescue app and Control Panel work for real users on any device. Each phase is tested before the next starts.

## Phase 1: Logins, accounts and roles
- Use your own connected Supabase project, not Lovable Cloud. All tables, logins and files live in your Supabase account.
- **NURJA users:** sign up and sign in with a phone number and an SMS OTP sent through your Bulk SMS BD account, then set a 6-digit PIN. Profile, emergency contacts and KYC are saved to the backend.
- **Responders:** sign in with a phone number, Unit Code, Volunteer ID or TaskForce ID plus a password. Only the Control Panel can create these accounts.
- **Control Panel:** admin login only. The first admin is set up once.
- Roles are stored separately: user, volunteer, police, officer and admin. Each app opens only for its own role.
- Bans, suspensions and KYC decisions are made on the server, so a banned user is really locked out.

## Phase 2: SOS and dispatch, in real time
- When a user triggers SOS, an incident is created with a live location trail.
- Nearby online responders get the alert instantly. Accept, navigate and Arrived update everywhere at once.
- Only an admin can mark a case Rescued and close it. The server enforces this; it is no longer only hidden in the app.
- Responders' online/offline status and live GPS are saved. Fixed police units keep their saved coordinates.
- Hazards, safe-route reports and community posts are saved and shared by everyone.

## Phase 3: Website CMS and CRM
- Homepage, Our Story, team, milestones, blog, contact details and footer are saved to the backend in Bangla and English.
- Visitors can read published content without signing in. Drafts stay hidden.
- Contact form and volunteer applications go to the Control Panel inbox.
- Uploaded images go to file storage instead of the browser.

## Phase 4: Evidence and reports
- Captured camera frames go to private file storage, linked to the incident, with their tags and capture time.
- Only the responders on that case and admins can view them.
- PDF reports work as they do now, using the stored frames.

## What I need from you
- **Supabase connection:** this project doesn't show a connection yet. Go to Project Settings → General → External Supabase and click Connect, then approve. If you already did, it may need a moment to appear.
- **Bulk SMS BD details:** your API key and approved Sender ID. You'll enter them in a secure form; I won't ask you to paste them in chat. You also need to confirm the API address from your Bulk SMS BD panel.
- **First admin:** the email or phone number of the first Control Panel admin.

## Limits to know about
- The live victim camera stays a visual mock. A real live video stream needs a separate video service, which would be its own project.
- Push notifications when the app is closed aren't included. Alerts arrive while the app is open.
- The floating demo view switcher and demo login shortcuts will be removed from the live site.

## Technical details
- Tables: profiles, user_roles (app_role enum + has_role security-definer), emergency_contacts, kyc_submissions, responders, incidents, incident_locations, incident_events, hazards, community_posts, website_content, blog_posts, contact_messages, volunteer_applications, evidence. Every table gets GRANTs and RLS.
- SMS OTP: server routes send codes through the Bulk SMS BD HTTP API. OTPs are stored as hashes with an expiry and a limit on attempts. When an OTP checks out, a server function signs the user in using a phone-derived auth identity.
- Responder accounts are created by admin-only server functions using the service role, after a has_role check.
- Realtime: Supabase Realtime channels on incidents, incident_locations and responders replace the localStorage storage-event sync.
- `demo-store.tsx` is replaced one area at a time by TanStack Query hooks plus server functions. Its public interface stays the same while that happens, so the screens barely change.
- The status transition logic in `incident-status.ts` is reused inside server functions and in a DB check, so Rescued requires the admin role.
- Storage buckets: `cms-images` (public read) and `evidence` (private, RLS limited to case responders and admins).
- Existing vitest tests are kept, and new tests cover the role and status rules.
