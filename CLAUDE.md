# CLAUDE.md — ECHO Project

> ECHO is a real estate brokerage management platform for the Thai market. Agents manage listings, CRM, AI tools, and a public website — all from a single workspace. See `docs/PRODUCT_SPEC.md` for full feature details.

---

## Project Documentation

Always reference these docs (located in `/docs`) for detailed specifications:

| Document | Purpose |
|---|---|
| `PRODUCT_SPEC.md` | Feature specs, data model, all 29+ database tables |
| `TECH_STACK.md` | Framework choices, API patterns, conventions |
| `DESIGN_SYSTEM.md` | Colors, typography, components, layouts, animations |
| `IMPLEMENTATION_PLAN.md` | Phased build plan with deliverables and checklists |

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) — NOT Pages Router |
| Language | TypeScript (strict mode, `noUncheckedIndexedAccess: true`) |
| Styling | Tailwind CSS (utility-first, no custom CSS files) |
| UI Components | shadcn/ui (Radix primitives, copied into project) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma v6.19.2 — **DO NOT upgrade to Prisma 7** |
| Vector Store | pgvector (Supabase extension) |
| Auth | Supabase Auth (email/password, Google OAuth, 2FA) |
| File Storage | Supabase Storage |
| Real-time | Supabase Realtime |
| AI | Claude API (`@anthropic-ai/sdk`) |
| Email | Resend |
| Notifications | LINE Notify API |
| PDF | `@react-pdf/renderer` |
| Maps | `@react-google-maps/api` |
| Tables | `@tanstack/react-table` |
| Forms | `react-hook-form` + `zod` |
| DnD | `@dnd-kit/core` |
| State | `@tanstack/react-query` (server), Zustand (client) |
| Toast | Sonner (NOT shadcn's built-in toast) |
| Testing | Vitest (unit), Playwright (e2e) |
| Hosting | Vercel (frontend) + Supabase Cloud (backend, Seoul region) |

---

## Commands

```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Production build
pnpm lint             # ESLint check
pnpm format           # Prettier format
pnpm test             # Run Vitest unit tests
pnpm test:e2e         # Run Playwright e2e tests
npx prisma generate   # Regenerate Prisma client
npx prisma db push    # Push schema to Supabase
npx prisma studio     # Visual DB browser
npx prisma db seed    # Run seed script (prisma/seed.ts)
```

---

## Folder Structure

```
/echo
  /app
    /(public)/             → SSR public website pages (SEO-critical)
    /(dashboard)/          → CSR authenticated dashboard pages
    /api/                  → API routes (complex logic, webhooks, imports)
  /components
    /ui/                   → shadcn/ui base components
    /listings/             → Listing module components
    /crm/                  → CRM module components
    /website-builder/      → Website builder components
    /ai/                   → AI chat & report components
    /shared/               → Layout, nav, common components
  /lib
    /supabase.ts           → Supabase client init
    /prisma.ts             → Prisma client init
    /ai.ts                 → Claude API client
    /line.ts               → LINE Notify client
    /email.ts              → Resend client
    /utils.ts              → General utilities
    /validations/          → Zod schemas (shared between frontend forms + API)
  /hooks/                  → Custom React hooks
  /stores/                 → Zustand stores (UI state)
  /types/                  → Shared TypeScript types
  /prisma
    schema.prisma          → Database schema (single source of truth)
    seed.ts                → TypeScript seed script
    prisma.config.ts       → Prisma config (required for CLI in v6.19.2)
  /supabase
    /migrations/           → SQL migration files
    /functions/            → Edge Functions (Deno/TypeScript)
  /docs/                   → Project documentation (the 4 spec files)
  /public/                 → Static assets
```

---

## Naming Conventions

| Context | Convention | Example |
|---|---|---|
| DB tables | snake_case, plural | `listings`, `pipeline_stages` |
| DB columns | snake_case | `created_at`, `workspace_id` |
| TS types/interfaces | PascalCase | `Listing`, `PipelineStage` |
| React components | PascalCase | `ListingTable`, `DealCard` |
| Functions/variables | camelCase | `getListings`, `dealCount` |
| API routes | kebab-case | `/api/listings/bulk-update` |
| CSS | Tailwind utilities only | `className="flex items-center gap-2"` |
| Env vars | UPPER_SNAKE_CASE | `SUPABASE_URL`, `CLAUDE_API_KEY` |
| Branches | prefixed | `feat/listing-table`, `fix/crm-filter` |
| Commits | conventional | `feat:`, `fix:`, `chore:` |

---

## Critical Domain Rules

### No Separate "Lead" Entity

ECHO uses a unified Contact + Deal model. There is NO separate Lead table.

- **Contact** = a person (Buyer, Seller, Both, Referrer)
- **Deal** = a journey through a pipeline toward a transaction
- What agents call a "Lead" is simply a Deal in its early pipeline stages
- One Contact can have multiple simultaneous Deals

### Multi-Tenancy

Every table (except global ones like `zones`) includes a `workspace_id` column. ALL queries MUST filter by `workspace_id`. RLS policies enforce this at the database level.

### Soft Deletes

Never hard delete user data. Use an `archived` boolean column. Provide archive/restore actions.

---

## Database Rules

- All tables have `id` (UUID, `gen_random_uuid()`), `created_at` (timestamptz), and `workspace_id` (FK)
- JSON columns use `jsonb`
- All FKs have explicit `ON DELETE` behavior (CASCADE, SET NULL, or RESTRICT)
- Prisma schema is the single source of truth — migrations are generated from it

### Prisma v6.19.2 Specifics

- `DATABASE_URL` and `DIRECT_URL` declared in `schema.prisma` using `env()`
- Seed script (`prisma/seed.ts`) MUST use **Prisma schema field names**, NOT underlying DB column names (e.g., use `pipelineStageName` not `pipeline_stage_name` if the field uses `@map`)
- Seed script must be idempotent (re-runnable without duplicates)

### RLS Policies

- Every table with `workspace_id` must have RLS policies for workspace isolation + role-based access
- When writing bulk RLS policies, verify the table actually has a `workspace_id` column first — global tables (like `zones`) don't have one
- Test RLS with two separate user accounts in two different workspaces

---

## API Patterns

### Server Actions (Primary for Dashboard CRUD)

Use `"use server"` directive. Co-locate with page routes (e.g., `settings/actions.ts`). Used for workspace settings, pipeline config, team management, etc.

### API Routes (Complex Logic)

Used for smart matching, pipeline transitions with validation, AI endpoints, import/export, webhooks, and cron-triggered tasks.

### Supabase Client (Direct Access)

For straightforward reads, real-time subscriptions, file uploads, and auth operations where RLS is sufficient.

### Prisma (Complex Queries)

For dashboard aggregations, multi-table joins (3+ tables), audit log queries, and smart matching calculations.

---

## Design System — Quick Reference

Full details in `docs/DESIGN_SYSTEM.md`. These are the essentials:

### Brand & Colors

- **Primary:** Orange (`#F97316`, Tailwind `orange-500`)
- **Neutrals:** Warm gray (Tailwind `stone` palette)
- **Primary text:** `stone-800` (never pure black `#000`)
- **Secondary text:** `stone-500`
- **Borders:** `stone-200` (light), `stone-700` (dark)
- Orange is an ACCENT — never use it for large background fills in the dashboard

### Typography

- **Latin font:** Inter (14px body in dashboard, 16px on public site)
- **Thai font:** IBM Plex Sans Thai (auto-fallback in font stack)
- **Monospace:** JetBrains Mono (for IDs, prices, numerical data)
- Headings use `font-semibold` (600), never `font-bold` (700)
- Enable `tabular-nums` on all number columns

### Component Library

shadcn/ui components with these overrides:

- Toast: Use **Sonner**, not shadcn's toast
- Icons: **Lucide React**, `stroke-width={1.75}`
- Tables: 40px rows, `stone-50` header, `orange-50` selected rows
- Border radius: `rounded-lg` (buttons), `rounded-xl` (cards), `rounded-2xl` (modals)
- Shadows: `shadow-sm` (cards), `shadow-md` (hover), `shadow-xl` (modals)

### Dashboard Layout

- Sidebar: `w-60` (expanded), `w-16` (collapsed), dark `stone-900` background
- Top header: `h-14`
- Content area: `bg-stone-50`, `p-6`
- Sidebar collapses at `lg` (1024px), becomes overlay at `md` (768px)

### Dark Mode

- Strategy: `darkMode: 'class'` in Tailwind config
- Toggle adds/removes `dark` class on `<html>`
- Page bg: `stone-950`, cards: `stone-900`, borders: `stone-700`
- Orange primary button stays the same in dark mode

### Public Website vs Dashboard

Public pages are visually different — see `DESIGN_SYSTEM.md` Section 11:

- 16px body text (vs 14px dashboard)
- `max-w-6xl` content width
- `rounded-2xl` cards, `shadow-lg`
- Scroll-triggered animations, hover lift on cards
- More liberal use of orange (hero backgrounds, CTAs)

### Animations

- All interactive elements: `transition-all duration-150 ease-in-out`
- Max animation duration: 400ms
- Always respect `prefers-reduced-motion` (`motion-safe:` variants)
- Loading states: skeleton loaders (`animate-pulse bg-stone-200 rounded`)

---

## Implementation Phases

The project is built in 6 phases. Check `docs/IMPLEMENTATION_PLAN.md` for full deliverables and validation checklists.

| Phase | Name | Status |
|---|---|---|
| 0 | Foundation (scaffolding, schema, auth, dashboard shell) | In progress |
| 1 | Listing Management (table, inline editing, photos, comments) | Not started |
| 2 | CRM (contacts, deals, pipelines, reminders, notifications) | Not started |
| 3 | Website Builder (SSR public site, drag-and-drop builder, blog) | Not started |
| 4 | AI (RAG chatbot, autofill, reports, agent assistant) | Not started |
| 5 | Dashboard, Polish & Launch (analytics, import/export, testing) | Not started |

Dependencies flow strictly downward — no phase requires work from a future phase.

---

## State Management

| Type | Tool |
|---|---|
| Server state | `@tanstack/react-query` (caching, refetching, optimistic updates) |
| Client state | Zustand (sidebar open/closed, active filters, column config) |
| Form state | `react-hook-form` + Zod |
| URL state | Next.js `searchParams` (for shareable/bookmarkable filter states) |

---

## Validation & Error Handling

- All API routes validate input with **Zod** before processing
- Zod schemas in `/lib/validations/` are shared between frontend forms and API routes
- API error responses: `{ error: string, code: string, details?: any }`
- Frontend errors: **Sonner** toast notifications
- All Supabase and Prisma calls wrapped in try/catch
- Never expose internal error details to the client in production

---

## Security Checklist

- All DB queries go through Prisma (parameterized) or Supabase client — NEVER raw string concatenation
- RLS policies on every table — no exceptions
- File uploads validated for type and size
- CORS: allow only the application domain
- Rate limiting on AI endpoints and auth endpoints
- Secrets in env vars only (`.env.local`, never committed)
- PDPA compliance: data export, deletion, and consent tracking

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Prisma
DATABASE_URL=          # Supabase pooled connection string
DIRECT_URL=            # Supabase direct connection string

# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI
CLAUDE_API_KEY=

# Email
RESEND_API_KEY=

# LINE
LINE_NOTIFY_TOKEN=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## Do NOT

- Use Pages Router (App Router only)
- Upgrade Prisma beyond v6.19.2
- Use `font-bold` for headings (use `font-semibold`)
- Use pure black `#000` for text
- Use custom CSS files (Tailwind utilities only)
- Hard delete user data (use `archived` boolean)
- Write raw SQL string concatenation in application code
- Skip `workspace_id` filtering in any query
- Use shadcn's built-in toast (use Sonner)
- Apply `workspace_id` RLS to tables that don't have the column (e.g., `zones`)
- Create a separate "Lead" table — use Contact + Deal

---

## Thai Market Context

- Currency: Thai Baht (฿ / THB)
- Prices: 2M–30M THB (sell), 15K–100K THB/month (rent)
- Thai text must render in IBM Plex Sans Thai
- LINE is the primary messaging platform (not WhatsApp/SMS)
- PDPA = Thailand's data protection law (similar to GDPR)
- Zones are Bangkok neighborhoods: Sukhumvit, Silom-Sathorn, Thonglor-Ekkamai, etc.
- Seed data uses realistic Thai names, condo projects, and Bangkok zones
