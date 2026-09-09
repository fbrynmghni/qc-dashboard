# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

A QC dashboard for hot-dip galvanizing coating-thickness inspection. An inspector records material info plus an 18-point thickness measurement grid (3 specimens x 6 points, µm); the app averages the grid and checks it against **ASTM A123 Table 1** (minimum average coating thickness by material category and steel thickness) to produce PASS / FAIL / NO_STANDARD, and every inspection is persisted as searchable history. Inspections can be edited or deleted after the fact, and each one can be exported as a one-page PDF report.

Every dashboard route sits behind a simple email/password login (branded "QC Mini ERP"); there's no self-service signup, users are provisioned with a CLI script.

## Commands

```bash
npm run dev          # dev server, http://localhost:3000
npm run build        # production build (also runs the TS check)
npm run lint         # eslint
npm test             # vitest run (all tests)
npx vitest run src/lib/astm-a123.test.ts   # single test file
npx vitest run -t "returns PASS"           # single test by name
```

Provisioning a login (no signup UI exists — this is the only way to create a user):

```bash
npm run user:create -- "email@perusahaan.com" "password" "Nama Lengkap"
```

Database (Prisma + SQLite, file `dev.db` at repo root):

```bash
npx prisma migrate dev --name <description>   # after editing prisma/schema.prisma
npx prisma generate                            # regenerate client (also runs automatically on migrate dev)
npx prisma studio                              # GUI to inspect/edit data
```

## Architecture

**Stack**: Next.js 16 (App Router) + TypeScript + Tailwind, Prisma 7 + SQLite, Zod, Vitest, `@react-pdf/renderer`.

**Routes**:
- `/login` (`src/app/login/`) — the public login page. `src/components/login-form.tsx` (Client Component) submits to the `login` Server Action in `src/app/login/actions.ts`. It's the only route outside the `(app)` group, so it renders under the bare root `layout.tsx` (no dashboard header).
- Everything else lives under the `(app)` route group (`src/app/(app)/`), which is where the dashboard header/nav (with the signed-in user's name and a "Keluar" logout button) is rendered from `src/app/(app)/layout.tsx` — the group segment doesn't affect URLs:
  - `/inspections` — history/list, Server Component, filters by company/material/spk/result/date read from `searchParams` and turned into a Prisma `where`. Each row links to Detail, Edit, a PDF download, and a delete action.
  - `/inspections/new` — the input form (`src/components/inspection-form.tsx`, Client Component) submitting to the Server Action `createInspection` in `src/app/(app)/inspections/actions.ts`.
  - `/inspections/[id]` — read-only detail view, with links to edit, download the PDF report, or delete the inspection.
  - `/inspections/[id]/edit` — the same `InspectionForm` component in edit mode (`mode="edit"`, pre-filled via an `initialValues` prop), submitting to the `updateInspection` Server Action.
- `/api/inspections/[id]/pdf` — a Route Handler (Node runtime) that loads the inspection, renders `src/lib/pdf/qc-report-document.tsx` with `@react-pdf/renderer`'s `renderToBuffer`, and streams it back as `application/pdf`.
- `/` just redirects to `/inspections` (and from there, `src/proxy.ts` bounces to `/login` if there's no session).

**Authentication**: `src/proxy.ts` (Next 16's renamed `middleware.ts` — see the non-obvious note below) gates every route except `/login`: no valid session cookie redirects to `/login`; a valid session on `/login` redirects to `/inspections`. Sessions are a signed, stateless cookie (`src/lib/auth/session.ts`, HMAC-SHA256 over `userId.expiresAt` keyed by the `AUTH_SECRET` env var, 7-day expiry) — there's no session table. Passwords are hashed with Node's built-in `scrypt` (`src/lib/auth/password.ts`, `salt:hash` hex format), not bcrypt, to avoid adding a native dependency. `src/lib/auth/current-user.ts` reads the cookie and loads the `User` row for display (the nav's name + logout button); enforcement itself happens in the proxy, not there. There is no signup flow — `scripts/create-user.ts` (run via `npm run user:create`, needs `tsx`) upserts a `User` row directly.

**`InspectionForm`** (`src/components/inspection-form.tsx`) serves both create and edit via optional `mode`, `inspectionId`, and `initialValues` props: the default `mode="create"` binds to `createInspection`; `mode="edit"` binds `updateInspection` with the inspection's id via `.bind(null, inspectionId)` (the standard pattern for passing extra arguments to a Server Action used with `useActionState`). Delete is a separate small Client Component, `src/components/delete-inspection-button.tsx`, wrapping `deleteInspection` in a `<form>` with a `confirm()` guard in `onSubmit`.

**The PDF report** (`src/lib/pdf/qc-report-document.tsx`) is a plain `@react-pdf/renderer` document, not HTML/CSS — it uses that library's own `View`/`Text`/`StyleSheet` primitives and Yoga-based flexbox layout, not Tailwind. It deliberately carries no company branding (no logo, no document/revision number, no signature, no certification badges) — just the ASTM A123 data: the measurement grid, the full Table 1 reference grid (imported from `astm-a123.ts`, with the inspection's own category/thickness cell highlighted), and a static corrosion-rate reference chart drawn with `Svg`/`Line`/`Text`. If you need to touch its column widths, they're driven by the shared `COLS` flex-ratio object so the header and body stay aligned — don't reintroduce per-cell pixel widths.

**Domain logic lives in `src/lib/astm-a123.ts` and must stay framework-agnostic** (no Prisma/Node imports). It's imported by both the client form (for a live PASS/FAIL preview as the inspector types) and the server action (for the authoritative save-time check) — one source of truth for the ASTM A123 Table 1 lookup table and the `evaluateInspection` function. If you touch the standard's numbers or bins, this is the only file that should need to change.

**Validation** (`src/lib/validation.ts`) is a single Zod schema shared by the client (inline error messages) and the server action (authoritative parse of `FormData`). The 18 measurement fields (`r1c1`...`r3c6`) are declared explicitly rather than generated from a loop/map — spreading a `Record<string, ZodType>` into `z.object()` loses TypeScript's literal key inference, so the field names must match `MEASUREMENT_FIELD_NAMES` (exported from `astm-a123.ts`) by hand.

**Data model**: the 18 grid points are stored as 18 flat `Float` columns on `Inspection` (`r1c1`..`r3c6`), not JSON or a child table — the 3x6 shape is fixed by the inspection method, so flat columns keep reads/writes trivial. `averageThicknessUm`, `minimumRequiredUm`, and `result` are computed in `createInspection` and re-computed in `updateInspection`, then stored redundantly so the history page can filter/sort without recomputing. The `User` model (`email`, `passwordHash`, `name`) exists solely for login — there's no role/permission field, since every authenticated user currently sees the same dashboard.

## Non-obvious things worth knowing before changing code

- **Prisma is v7**, not the more commonly-known v5/6 shape. It requires an explicit driver adapter — there is no "just set DATABASE_URL and go." `src/lib/db.ts` constructs `PrismaBetterSqlite3` from `@prisma/adapter-better-sqlite3` and passes it to `new PrismaClient({ adapter })`. CLI commands (migrate/studio) instead read config from `prisma7.config.ts`, which explicitly `import`s `dotenv/config` because Prisma no longer auto-loads `.env`.
- **The Prisma Client generator is the new `prisma-client` provider** (TS-native, wasm query engine), which emits **TypeScript source** into `src/generated/prisma/` (see `output` in `prisma/schema.prisma`) instead of compiled JS in `node_modules`. This directory is gitignored and regenerated by `npx prisma generate`. Import from `@/generated/prisma/client`, not `@prisma/client`.
- **Next.js is v16**: `params` and `searchParams` in page props are `Promise`s and must be `await`ed (see both `inspections/page.tsx` and `inspections/[id]/page.tsx`).
- `AGENTS.md` (imported above via `@AGENTS.md`) is regenerated by `next dev` on every run per its own header — it warns that this Next.js version has breaking changes from typical training data and points at `node_modules/next/dist/docs/` as the authority. Don't strip the `@AGENTS.md` import.
- The 18 measurement field names must stay in sync across three places: `prisma/schema.prisma` columns, `MEASUREMENT_FIELD_NAMES` in `astm-a123.ts`, and the explicit keys in `validation.ts` — there's no single generated source for this triplication, by design (see validation note above).
- **React 19 form actions run a native-style form reset after every submission attempt** (success or failure), which can snap a field back to its blank `defaultValue` at the DOM level even though it's React-controlled — confirmed (via a throwaway jsdom test) to actually happen to the `<select>` in `InspectionForm`, though not to its plain text/number inputs. `InspectionForm` works around this with a `formRef` + `useEffect` keyed on `state` that re-pushes the current `header`/`measurements` state onto every real DOM field once an action settles. If you add new form fields, they're covered automatically as long as they're inside that `<form>` and have a matching `name`.
- `getMinimumRequiredCoatingUm`/`evaluateInspection` aren't the only exports from `astm-a123.ts` worth knowing about: `TABLE_1`, `THICKNESS_BINS`, and `findThicknessBinIndex` are also exported specifically so the PDF report can render the *entire* Table 1 reference grid (not just look up one cell) without duplicating the standard's numbers.
- **Next.js 16 renamed `middleware.ts` to `proxy.ts`** — `middleware` is deprecated in favor of a file that must be named `proxy.ts` and export a function named (or default-exported) `proxy`, not `middleware`. It also now defaults to the **Node.js runtime** (previously Edge), which is what makes it safe for `src/proxy.ts` to call the `node:crypto`-based session verifier directly.
- **A `"use server"` file may only export async functions** (plus types, which are erased). A plain constant like an initial `useActionState` state object breaks the build with "A 'use server' file can only export async functions, found object." — that's why `INITIAL_LOGIN_STATE` lives in `login-form.tsx` (the client component) instead of alongside the `login` action in `actions.ts`, even though the type it's shaped from is exported from there.
- The React 19 form-reset quirk noted above for `<select>` also applies to any **uncontrolled** text input: after a failed `login` submission, a plain `<input name="email">` would clear itself along with the password, forcing the user to retype their email too. `LoginForm` keeps `email` as controlled React state (survives the reset) while leaving `password` uncontrolled (intentionally clears on failure).
