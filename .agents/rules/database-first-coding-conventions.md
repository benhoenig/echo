---
trigger: always_on
---

Before writing any Supabase query, database insert, or filter — always read [src/types/supabase.ts](cci:7://file:///Users/benpoovaviranon/Desktop/Ben/Apps/ECHO/src/types/supabase.ts:0:0-0:0) to verify exact column names and enum values. Never guess from memory. Also read [CONVENTIONS.md](cci:7://file:///Users/benpoovaviranon/Desktop/Ben/Apps/ECHO/CONVENTIONS.md:0:0-0:0) at the project root for casing rules, naming patterns, and tech stack details. Run `npx tsc --noEmit` after writing any new database-related code to catch type mismatches early.