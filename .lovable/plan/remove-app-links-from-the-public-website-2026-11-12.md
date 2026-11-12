# Remove app links from the public website

## Changes
- **Homepage top banner:** swap the "Try the NURJA app" button for a "How It Works" (কীভাবে কাজ করে) button that scrolls smoothly down to the 4-step section. "Become a Volunteer" stays as the main button.
- **Footer:** remove the "Open NURJA app" link from the Explore column.
- **Already clear:** the menu bar, Our Story, Blog and Contact pages have no links to the NURJA app, Rescue app or Control Panel, so they stay as they are.
- **Still reachable:** the apps and the Control Panel can still be opened by typing their web address or through the floating Demo switcher.

## Technical details
- `src/routes/index.tsx`: replace the outline button's `<Link to="/NURJASOS">` with an `<a href="#how-it-works">`, and add `id="how-it-works"` plus `scroll-mt-20` to the steps section.
- `src/components/nurja/SiteLayout.tsx`: delete the footer `/NURJASOS` link.
- `translations-bn.ts`: add a Bangla entry for "How It Works" if it is missing.
