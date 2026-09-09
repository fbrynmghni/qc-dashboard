# QC Dashboard

A quality-control dashboard for hot-dip galvanizing coating-thickness inspection, evaluated against **ASTM A123 Table 1**.

## What it does

- An inspector records material info (customer, material, SPK, category, steel thickness) plus an 18-point coating-thickness measurement grid (3 specimens x 6 points, in micrometers).
- The app averages the grid and checks it against the ASTM A123 Table 1 minimum-average-coating-thickness lookup (by material category and steel-thickness bin), producing **PASS**, **FAIL**, or **NO_STANDARD**.
- Every inspection is saved and searchable by company, material, SPK, result, and date range.
- Inspections can be edited or deleted after the fact.
- Each inspection can be exported as a one-page PDF report.
- The dashboard sits behind a simple email/password login ("QC Mini ERP"); there's no self-service signup, so users are provisioned with a CLI command.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Prisma 7 + SQLite (via the `@prisma/adapter-better-sqlite3` driver adapter)
- Zod for validation, shared between the client form and the server actions
- Vitest for tests
- `@react-pdf/renderer` for the PDF report

## Getting started

```bash
npm install
npx prisma migrate dev   # creates dev.db and applies migrations
echo "AUTH_SECRET=\"$(openssl rand -hex 32)\"" >> .env   # signs login session cookies
npm run user:create -- "email@perusahaan.com" "password" "Nama Lengkap"  # create the first login
npm run dev              # http://localhost:3000
```

## Commands

```bash
npm run dev          # dev server
npm run build        # production build (also runs the TypeScript check)
npm run lint         # eslint
npm test             # vitest run (all tests)
npm run user:create -- "email@perusahaan.com" "password" "Nama Lengkap"  # create/update a login
npx prisma studio    # inspect/edit the SQLite database in a GUI
```

## Project structure

- `src/app/login/` — the public login page and its `login`/`logout` Server Actions.
- `src/app/(app)/inspections/` — the history list (`/inspections`), the new-inspection form (`/inspections/new`), a read-only detail view (`/inspections/[id]`), and an edit form (`/inspections/[id]/edit`), all behind the dashboard header defined in `src/app/(app)/layout.tsx`.
- `src/app/api/inspections/[id]/pdf/` — generates and streams the PDF report for one inspection.
- `src/proxy.ts` — Next.js 16's Proxy (the renamed `middleware.ts`); redirects unauthenticated requests to `/login` and authenticated requests away from `/login`.
- `src/lib/auth/` — password hashing (`scrypt`), signed session cookies, and the current-user lookup used to show the signed-in name in the header.
- `scripts/create-user.ts` — the only way to provision a login; run via `npm run user:create`.
- `src/lib/astm-a123.ts` — framework-agnostic ASTM A123 Table 1 lookup and evaluation logic; the single source of truth for the standard's numbers.
- `src/lib/validation.ts` — the Zod schema shared by the client form and the server actions.
- `src/lib/pdf/qc-report-document.tsx` — the PDF report layout.
- `prisma/schema.prisma` — the `Inspection` and `User` models (SQLite).

See `CLAUDE.md` for a deeper look at the architecture and the non-obvious gotchas (Prisma 7's driver-adapter requirement, Next.js 16's async `params`, a React 19 form-reset quirk, etc.).
