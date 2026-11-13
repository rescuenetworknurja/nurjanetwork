<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Shared interface state is hydrated from Supabase through authenticated server functions and public loader queries; localStorage contains only language preferences, to avoid presenting demo records as operational data.
- UI language: Bangla (default) / English via `lang` in the demo store; `src/lib/auto-translate.ts` swaps rendered English text using the dictionary in `src/lib/translations-bn.ts` — add a Bangla entry there for every new visible English string (keeps components untouched).
- Public website text lives in `websiteContent` (bilingual {en,bn} fields, seeded from `src/lib/website-content.ts`) in the demo store and is edited from /rpanel → Website CMS & CRM; never hardcode page copy in public routes — so the admin can change it without code.
- RescueTeam shares one VictimCamera presentation between the desktop side panel and the mobile/tablet dispatch footer to keep camera states consistent across layouts.
- VictimCamera uses a modal full-viewport viewer with optional native fullscreen/orientation locking and CSS landscape fallback so unsupported browsers still cover app navigation.
- Incident evidence and KYC media use private Supabase Storage and expiring signed URLs; save success requires durable server writes.
- Evidence reports generate in the browser from every frame in an incident, rasterize bilingual metadata for font fidelity, and require a separate download click to preserve mobile user activation.
- Evidence persistence recovers quota failures by compacting legacy PNG images without removing records; new captures use JPEG to reduce browser storage use.
- Incident mutations enforce caller roles and incident membership on the server; responder arrival retains active SOS and only administrators complete rescue.
- Live auth (external Supabase): phone+password sign-in derives a deterministic synthetic email (`<880…>@phone.nurja.com`, src/lib/auth.ts) because Supabase phone OTP needs an SMS provider; the real number lives in profiles.phone, roles in user_roles via has_role(), and route gates use AuthGate + getMyProfile server fn (bearer attached by src/lib/auth-attacher.ts in src/start.ts).
- Home-screen installation uses a manifest only, launching /NURJASOS; do not add an app-shell service worker without an explicit offline request, to keep previews fresh.
- Apply story pagination after filtering and sorting through the shared story-filter helpers so featured and regular stories share the same page limit.
- Load the Bangla digit font locally with digit-only Unicode ranges and prepend it to Bangla UI/export font stacks so lettering and English typography remain unchanged.

- Live video tokens are incident-scoped: only the incident owner publishes, authorized responders/admins subscribe, and missing relay configuration shows an unavailable state.
- Public CMS records load through the root query loader before hydration so first render matches persisted content.
- Map coordinate transforms are reversible without clipping, preserving real locations outside the initial map bounds.
