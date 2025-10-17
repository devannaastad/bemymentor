<!-- BEMYMENTOR_NOTES.md -->
# BeMyMentor — Working Notes

**Last updated:** (fill in on commit)

## What exists
- **Stack:** Next.js 15 (App Router, Turbopack), Tailwind v4, TypeScript, pnpm.
- **Pages:** `/` (landing), `/catalog`, `/apply`, `/legal/{tos,privacy,refunds}`.
- **Structure:** `components/common/*` (UI primitives), `components/landing/*`, `components/common/index.ts` barrel.
- **UI Primitives:** Button, Card, Input, Textarea, Label, Badge, Divider, Spinner, Skeleton, Select, Checkbox, Toggle, Prose, VisuallyHidden, SectionHeader, Modal.
- **Conventions:** 
  - Start each shared file with a path comment in code blocks we exchange.
  - Prefer components over hardcoding; keep folders tidy.

## Next up (shortlist)
1. **Mentor Onboarding (MVP)**  
   - `/apply` → real form (zod + react-hook-form), validation, submit to API route (store draft application).
   - Admin vetting UI stub (`/admin` placeholder, auth later).
2. **Catalog data model (mock)**  
   - Local mock data + list cards using `Badge`/`Button`.
3. **SEO polish**  
   - Add `NEXT_PUBLIC_SITE_URL` on Vercel; confirm OG tags.
4. **Auth scaffold** (later)  
   - NextAuth (email/pass or OAuth), minimal session context for gated routes.

## Decisions / principles
- Keep a single source of truth for primitives; no duplicate button styles.
- Minimal dependencies until we need them (no heavy UI libs).
- Stripe Connect & DB will come after onboarding UX is in place.

## Parking lot
- Toast/notifications system.
- Search + filters (server/components).
- Analytics + error tracking (PostHog/Sentry).
- i18n (if needed later).

