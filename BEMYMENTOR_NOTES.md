<!-- BEMYMENTOR_NOTES.md -->
# BeMyMentor — Working Notes
**Last updated:** 2025-10-17

## What exists
- **Stack:** Next.js 15 (App Router, Turbopack), Tailwind v4, TypeScript, pnpm.
- **Pages:** `/` (landing), `/catalog`, `/apply`, `/legal/{tos,privacy,refunds}`.
- **Structure:** `components/common/*` (UI primitives), `components/landing/*`, `components/apply/ApplyForm`, `lib/schemas/*`.
- **UI Primitives:** Button, Card, Input, Textarea, Label, Badge, Divider, Spinner, Skeleton, Select, Checkbox, Toggle, Prose, VisuallyHidden, SectionHeader, Modal.
- **Conventions:** 
  - Every code file starts with a path comment in our shared snippets.
  - Prefer reusable components; avoid hardcoding; keep folders tidy.

## Latest milestone (done)
- `/apply` **Mentor Onboarding MVP**:
  - **Client:** `react-hook-form` + `zod` with `applicationFormSchema` (string inputs).
  - **Server:** `/api/applications` uses `applicationSchema` (coerces `price`/`hourlyRate` to numbers).
  - Inline field errors, submit spinner, success message.
  - Build clean (no `any`, no unused vars).

## Quick testing checklist
- Local: `pnpm build && pnpm start` → `/apply` submit → terminal shows `[application:create] {...}` with numeric `price`/`hourlyRate`.
- Vercel: open live site → submit → Deployment → **Functions/Logs** show the payload.
- Error path: (optional) temporarily throw in the API to see a red error in the form.

## Next up (shortlist)
1. **Catalog mock data + cards**
   - Create `data/mentors.mock.ts` and render cards in `/catalog` (use Badge + Button).
   - Basic filtering by `?category=`.
2. **Site polish**
   - Add `NEXT_PUBLIC_SITE_URL` in Vercel → Settings → Environment Variables (improves OG tags).
   - Add a small “Site map” section on the home page with links to `/catalog`, `/apply`, and legal pages.
3. **Onboarding v2 (soon)**
   - Persist applications (Prisma + SQLite/Postgres).
   - Email notify on submission (Resend).
   - Admin vetting placeholder (`/admin` gated route).
4. **Payments planning**
   - Stripe Connect Standard accounts (mentors), platform fee model, products: ACCESS vs TIME.

## Parking lot
- Toast/notifications system.
- Search + server filters.
- Analytics + error tracking (PostHog/Sentry).
- i18n later if needed.
