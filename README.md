# QC Dashboard

A quality-control dashboard for hot-dip galvanizing coating-thickness inspection, evaluated against **ASTM A123 Table 1**.

## What it does

- An inspector records material info (customer, material, SPK, category, steel thickness) plus an 18-point coating-thickness measurement grid (3 specimens x 6 points, in micrometers).
- The app averages the grid and checks it against the ASTM A123 Table 1 minimum-average-coating-thickness lookup (by material category and steel-thickness bin), producing **PASS**, **FAIL**, or **NO_STANDARD**.
- Every inspection is saved and searchable by company, material, SPK, result, and date range.
- Inspections can be edited or deleted after the fact.
- Each inspection can be exported as a one-page PDF report.

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
npm run dev              # http://localhost:3000
```

## Commands

```bash
npm run dev          # dev server
npm run build        # production build (also runs the TypeScript check)
npm run lint         # eslint
npm test             # vitest run (all tests)
npx prisma studio    # inspect/edit the SQLite database in a GUI
```

## Project structure

- `src/app/inspections/` — the history list (`/inspections`), the new-inspection form (`/inspections/new`), a read-only detail view (`/inspections/[id]`), and an edit form (`/inspections/[id]/edit`).
- `src/app/api/inspections/[id]/pdf/` — generates and streams the PDF report for one inspection.
- `src/lib/astm-a123.ts` — framework-agnostic ASTM A123 Table 1 lookup and evaluation logic; the single source of truth for the standard's numbers.
- `src/lib/validation.ts` — the Zod schema shared by the client form and the server actions.
- `src/lib/pdf/qc-report-document.tsx` — the PDF report layout.
- `prisma/schema.prisma` — the `Inspection` model (SQLite).

See `CLAUDE.md` for a deeper look at the architecture and the non-obvious gotchas (Prisma 7's driver-adapter requirement, Next.js 16's async `params`, a React 19 form-reset quirk, etc.).
