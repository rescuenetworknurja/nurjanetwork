# Add depth and texture to NURJA Home, public site and Rescue app

## 1. NURJA app Home screen
- **Background:** a faint city street grid with map contour lines (about 6% strength), over a soft glow that goes from warm rose-ivory in the middle to cool slate at the edges.
- **Radar around SOS:** 3 thin rings (dashed and solid, soft rose) with small 0°, 90°, 180° and 270° labels, crosshair lines, and a slow sweeping radar beam. When SOS is locked, the radar shows in grey with no sweep.
- **3D SOS button:** a raised light-metal ring around a deep crimson centre. The centre has a light top edge, a deep shadow underneath, a faint micro-grid, and a shield-and-siren symbol. It stays a 180px circle and keeps its pulsing ripples.
- **Header:** the greeting sits on a lightly tinted curved card, with a green "Coverage Zone: Active" pill next to the bell.
- **New coverage strip** (above the location card), 3 small tiles: 2 Patrols (0.6 km), 10 Volunteers Online, Dual-Cam & Audio Ready.
- **Location card:** a crimson bar down the left edge, a small radar/map preview in place of the pink pin box, a stronger shadow, and a frosted see-through white background.

## 2. Public website
- The top banner gets a faint grid pattern that fades out from the centre.
- The "How it works" and feature cards get a coloured strip along the top and a shadow that grows on mouse-over.

## 3. Rescue app
- The dispatch map and alert screens get the same faint tactical grid and layered card shadows (darker, in navy tones).

## Technical details
- Colours (rose-ivory, slate, crimson shades), shadows and the grid/contour patterns become shared theme values and utilities in `src/styles.css`. No colours are hard-coded inside screens.
- The radar sweep uses a slow rotating CSS gradient, turned off when the device asks for reduced motion.
- Every new English label gets a Bangla entry in `translations-bn.ts`.
- Files: `sos/Home.tsx`, `styles.css`, `routes/index.tsx`, `routes/RescueTeam.tsx`, `translations-bn.ts`.
