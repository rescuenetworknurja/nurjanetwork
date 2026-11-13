# Nurjanetwork

Build a complete, high-craft UI/UX frontend prototype (NO backend or Supabase integration yet—use realistic interactive mock data and React state/context so all flows can be tested visually) for an Emergency Response & Women Safety Ecosystem called "NURJA".

### Global Navigation & Demo Switcher

Include a sleek, floating, collapsible "Demo View Switcher" pill in the top-right corner of the screen so I can easily jump between all 4 interfaces and test states (e.g., KYC Pending vs Approved, Adult vs Under-18, Type 1 Police vs Type 2 Volunteer) during preview:

1. `/` — Public Website (Desktop & Mobile responsive)

2. `/NURJASOS` — "NURJA" Women Safety App (Strictly Mobile Viewport `max-w-[430px] mx-auto min-h-screen` centered with a clean phone frame on desktop)

3. `/RescueTeam` — "Rescue Network" Responder App (Mobile-first `max-w-[430px] mx-auto` tactical interface)

4. `/rpanel` — Central Command & Control Panel (Full Desktop Dashboard layout)

### Design System & Colors

- **Emergency Crimson:** `#E11D48` (Rose-600 for SOS buttons, active alerts, danger zones)

- **Command Navy:** `#0F172A` (Slate-900 for headers, tactical panels, dark mode surfaces)

- **Trust Emerald:** `#10B981` (Emerald-500 for KYC Approved badges, safe route paths, online status)

- **Warning Amber:** `#F59E0B` (Amber-500 for pending states, moderate risk zones)

- Use Lucide icons, Tailwind CSS, Framer Motion / smooth CSS animations, and Shadcn UI components.

---

### INTERFACE 1: `/` (Public Website)

- **Navbar:** Brand Logo ("NURJA"), Links: Home, Our Story, Blog, Contact Us, and a primary CTA button "Become a Volunteer".

- **Hero Section:** Impactful headline about Women Safety & Rapid Rescue Network, live mock statistics, and "Become a Volunteer" button.

- **Volunteer Application Modal/Drawer:** Clicking "Become a Volunteer" opens a multi-field application form (Full Name, Phone, Email, Present Address, NID Number, NID Photo Upload UI, Occupation, Motivation). Submitting shows a confirmation toast ("Application sent to Control Panel. Your Volunteer ID e.g., V-J75UN2 will be generated upon approval").

- **How This System Works Section:** Visual 4-step breakdown (Trigger SOS -> Instant Nearest Dispatch -> Live Camera & GPS Stream -> Safe Rescue & Evidence Archival).

- **Incident Stories & Awareness Blog Section:** Cards with photos, text excerpts, and embedded YouTube video previews.

- **Additional Pages/Sections:** "Our Story" (About Us), full "Blog" view, "Contact Us" form, and a complete Footer.

---

### INTERFACE 2: `/NURJASOS` ("NURJA" User App - Mobile View Only)

Add a quick toggle inside the prototype to switch between **"Onboarding Wizard"** and **"Main App Screen"**.

#### A. 8-Step Registration & Conditional KYC Wizard:

- **Step 0:** Splash Screen with animated NURJA shield logo and "Get Started" button.

- **Step 1:** Phone Number input (`01XXXXXXXXX`).

- **Step 2:** 6-digit OTP verification input boxes.

- **Step 3:** Create Password for future logins.

- **Step 4:** Setup 6-digit Security PIN (explain that this PIN is required to turn off SOS).

- **Step 5:** Full Name and Date of Birth picker. **Crucial UI Logic:** Automatically calculate age from the selected Date of Birth and show a badge ("Adult 18+ Profile" or "Under 18 Minor Profile").

- **Step 6:** Emergency Family Contact Number and Relationship input.

- **Step 7 (Conditional KYC Screen based on Step 5 Age):**

  - **If Age is 18 or older:**

    - Step 7.1: NID Front Page Photo Click/Upload card.

    - Step 7.2: NID Back Page Photo Click/Upload card.

    - Step 7.3: Live Selfie Photo Click/Upload card.

  - **If Age is Under 18:**

    - Step 7.1: Birth Registration Number input field.

    - Step 7.2: In-App Guardian NOC Form (Guardian Name, Guardian Phone, Relationship, and a mandatory legal consent checkbox).

    - Step 7.3: Guardian NID Photo Click/Upload card.

#### B. Main App & Bottom Navigation (`Home`, `Safe Route`, `Community`, `Profile`):

- **Home Screen:**

  - Top bar with KYC Status Badge (include a demo toggle to switch between "KYC Pending - SOS Locked" and "KYC Approved - SOS Active").

  - Center: Large, pulsing red **SOS Button** (`180px` circle) with ripple animations. Below it: Current Location card (Mock GPS coordinates + Dhaka/Narayanganj street address).

  - **SOS Trigger Flow:** Tapping SOS starts a full-screen **3-Second Countdown (`3... 2... 1...`)** with a Cancel button.

  - **Active SOS Broadcast State:** Once countdown finishes, show:

    1. Live Camera Preview simulation box with a badge: `"LIVE STREAMING (Back Camera) + Saving Offline Video Chunks"`.

    2. Alert Dispatch Status: `"Alerted Nearest 2 Patrol Units, 1 Police Fari, 1 Police Station, 10 Volunteers + Sent SOS SMS to 5 Nearest Devices"`.

    3. **Incoming Responders Live Map & List:** Show which Police Team and Volunteers are coming to rescue the user and their live distance/ETA markers on a map view.

    4. **Stop SOS Flow:** A "HOLD 3-5 SECONDS TO STOP SOS" button with a circular fill progress bar on press-and-hold. After holding for 3 seconds, pop up a **6-Digit Security PIN Modal** to deactivate SOS.

- **Safe Route Screen:** Interactive simulated map view with Origin & Destination search bars. Show circular danger zones colored from **Light Red** (Low/Medium risk) to **Dark Red** (High risk) and a green recommended "Safest Route" line avoiding the dark red zones.

- **Community Screen:** Feed of verified incident awareness posts published by the Control Panel (supports Photos, Text, and embedded YouTube Video players).

- **Profile Screen:** User details, KYC verification badge, Volunteer/User info, Emergency contacts, Security PIN reset, and "Offline PWA Cache Ready" indicator.

---

### INTERFACE 3: `/RescueTeam` ("Rescue Network" App - Mobile View)

- Include a demo switcher at the top to toggle between **Type 1 User** (`Police Station / Police Fari / Patrolling Unit`) and **Type 2 User** (`Volunteer [ID: V-J75UN2] / Police Officer [TaskForce ID: TF-902]`).

- **Top Header:** Role badge + prominent **Online / Offline** toggle switch.

- **Incoming SOS Alert Experience:**

  -Include a "Simulate Incoming SOS Alert" button.

  - **For Type 1 (Station/Fari/Patrol):** Show a high-priority red flashing screen with `"MANDATORY DISPATCH - AUTO ACCEPTED"` and immediate turn-by-turn navigation direction to the victim's location + live victim camera preview.

  - **For Type 2 (Volunteers/Officers):** Show an incoming alert card with victim distance (`0.8 km away`) and an **"Accept / Respond"** button. Clicking "Accept" switches to the live navigation map directing them to the incident location.

- **Bottom Navigation Bar:** `Dispatch Map`, `Community`, `Case History`, `Profile`.

---

### INTERFACE 4: `/rpanel` (Central Control Panel - Desktop View)

- Dark/Light modern command sidebar with sections:

  1. **Dashboard:** High-level KPI cards (Active SOS Alerts, Online Patrol Units, Active Volunteers, Pending KYCs) and live overview map.

  2. **Live Incident & Dispatch Center:** Split-screen tactical view. Left: Map showing Victim pin, nearest 2 Patrol Units, 1 Fari, 1 Station, and 10 Volunteers. Right: Live Victim Video Feed player with a prominent **"Switch Victim Camera (Front ↔ Back)"** remote control button, live route summary, and "Download Evidence Video & Route Summary" buttons.

  3. **KYC Approval Queue:** Table + Review Drawer for both **Adult (18+)** (NID Front/Back + Selfie) and **Under-18** (Birth Reg + Guardian NOC + Guardian NID) submissions with Approve/Reject buttons.

  4. **Rescue Network & Volunteer Management:**

     - Create accounts manually for Type 1 (Station/Fari/Patrol) and Type 2 (Volunteers with auto-generated `V-XXXXXX` ID or Officers with `TaskForce ID`).

     - Tab to review pending "Become a Volunteer" applications from the Public Website and click "Approve & Generate Volunteer ID".

  5. **Safe Route Hazard Manager:** Interface to add/edit unsafe zones on the map and set their Danger Rating from `1` (Light Red) to `5` (Darker Red).

  6. **Community & Blog Publisher:** CMS form to publish incident stories (Photo, Text, YouTube video link) to the `/NURJASOS` & `/RescueTeam` Community tab and the Public Website Blog.

  7. **API & System Settings:** Clean configuration form to submit and save API keys for Map API, Live Streaming (LiveKit/Agora) API, Bulk SMS Gateway API, and Push Notification keys.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nurjanetwork.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/44ddcdd6-f871-4e32-b3da-9a3b319ed281).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
