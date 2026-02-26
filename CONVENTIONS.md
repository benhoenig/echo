# ECHO — Codebase Conventions

## ⚠️ Read Before Writing ANY Code

### 1. Database Column Names
- **Always verify column names** from `src/types/supabase.ts` before writing any Supabase query.
- Never guess column names from memory or spec docs — the generated types are the source of truth.
- Column names are `snake_case` (e.g., `workspace_name`, `pipeline_stage_name`, `stage_order`).

### 2. Enum Values
- All database enums use **UPPER_CASE** with underscores.
- Examples: `OWNER`, `ADMIN`, `CO_WORKER`, `LISTING_SUPPORT`, `BUYER`, `SELLER`, `PENDING`, `ACCEPTED`, `REVOKED`.
- The frontend must pass uppercase values when inserting or filtering.
- Check the `Enums` section at the bottom of `src/types/supabase.ts` for the exact values.

### 3. Supabase Query Patterns
- Use `createClient()` from `@/lib/supabase/server` for server-side queries.
- Use `createAdminClient()` from `@/lib/supabase/admin` only when bypassing RLS is required.
- All tables have RLS enabled. The policy function `get_auth_workspace_id()` scopes access by workspace.
- `.order()` column names must exactly match the database column — Supabase returns empty results silently for invalid column names.

### 4. Server Actions
- ECHO uses **Next.js Server Actions** (`"use server"`) for dashboard CRUD operations.
- Action files are co-located with their pages (e.g., `settings/actions.ts`, `settings/pipeline-actions.ts`).
- All database inserts/updates that have a required `updated_at` or `last_updated_at` column must include `new Date().toISOString()`.

### 5. Type Safety
- Run `npx tsc --noEmit` after writing new queries or components.
- Avoid `as any` casts — they hide type mismatches that cause runtime bugs.
- When Supabase types don't match, investigate the root cause rather than casting.

### 6. Regenerating Types
After any database migration or schema change:
```bash
npx supabase gen types typescript --project-id okouxpbruaippmgzcasc > src/types/supabase.ts
```

### 7. Tech Stack Quick Reference
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| ORM | Prisma v6.19.2 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Toasts | Sonner (`sonner` package) |
| Drag & Drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
