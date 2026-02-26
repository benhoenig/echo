# ECHO — Implementation Plan

> This document defines the phased build plan for ECHO. Each phase has clear scope, deliverables, dependencies, and a validation checklist. Reference `PRODUCT_SPEC.md` for feature details and `TECH_STACK.md` for all technology decisions.

---

## Table of Contents

1. [Phase Overview](#1-phase-overview)
2. [Phase 0 — Foundation](#2-phase-0--foundation)
3. [Phase 1 — Listing Management](#3-phase-1--listing-management)
4. [Phase 2 — CRM](#4-phase-2--crm)
5. [Phase 3 — Website Builder](#5-phase-3--website-builder)
6. [Phase 4 — AI](#6-phase-4--ai)
7. [Phase 5 — Dashboard, Polish & Launch Readiness](#7-phase-5--dashboard-polish--launch-readiness)
8. [Dependency Map](#8-dependency-map)
9. [Seed Data Strategy](#9-seed-data-strategy)
10. [Risk & Mitigation](#10-risk--mitigation)

---

## 1. Phase Overview

| Phase | Name | What it delivers | Depends on |
|---|---|---|---|
| **0** | Foundation | Project scaffolding, full database schema, auth, workspace management, dashboard shell, seed data | Nothing |
| **1** | Listing Management | Complete listing table with inline editing, filters, grouping, photo management, project database, comments & activity feed | Phase 0 |
| **2** | CRM | Contacts, Deals, pipeline management, buyer/seller tabs, reminders & suggested actions, notifications | Phase 0, Phase 1 (comments system) |
| **3** | Website Builder | Public website rendering, drag-and-drop builder, listing sync, blog, lead capture forms | Phase 0, Phase 1 |
| **4** | AI | RAG chatbot, data input autofill, marketing report, listing comparison report, agent assistant | Phase 0, Phase 1, Phase 2 |
| **5** | Dashboard, Polish & Launch | Dashboard analytics, data import/export, LINE Official Account, onboarding tours, PDPA hardening, automated testing, performance optimization | All previous phases |

**Guiding principles:**
- Each phase ends with something usable in the browser.
- Data model is established in Phase 0; subsequent phases build features on top of it.
- Dependencies flow strictly downward — no phase requires work from a future phase.
- AI comes after data-producing modules (Listings, CRM) so there's real data to work with.
- Every phase includes a validation checklist for manual QA with seed data.
- All UI implementation must reference `DESIGN_SYSTEM.md` for colors, typography, component patterns, spacing, and animation. Consistency across phases is non-negotiable.

**Reference documents:** All phases should be built with these four documents loaded as context:
- `PRODUCT_SPEC.md` — What to build (features, schema, data model)
- `TECH_STACK.md` — How to build it (frameworks, libraries, conventions)
- `IMPLEMENTATION_PLAN.md` — When to build it (this document)
- `DESIGN_SYSTEM.md` — What it looks like (colors, typography, components, layouts)

---

## 2. Phase 0 — Foundation

> **Goal:** Set up the entire project skeleton, database schema, authentication, workspace management, and the dashboard shell. After this phase, you can log in, see the dashboard layout, switch between empty pages, and manage workspace settings. No feature modules yet — just the infrastructure everything else sits on.

### 2.1 Deliverables

#### 2.1.1 Project Setup

- [x] Initialize Next.js 14+ project with App Router and TypeScript (strict mode).
- [x] Install and configure Tailwind CSS with custom theme tokens.
- [x] Install and configure shadcn/ui — initialize all base components.
- [x] Set up monorepo folder structure as defined in `TECH_STACK.md` Section 10.4.
- [x] Configure ESLint, Prettier, and Husky pre-commit hooks.
- [x] Set up Git repository with branch strategy (`main`, `staging`, feature branches).
- [x] Create `.env.local` template with all required environment variables.

#### 2.1.1b Design System Setup

Configure the full design system as defined in `DESIGN_SYSTEM.md` so all subsequent phases inherit the correct visual foundation.

- [x] **Font loading:** Configure Next.js Google Fonts for Inter (Latin), IBM Plex Sans Thai (Thai), and JetBrains Mono (monospace). Set CSS variables `--font-inter`, `--font-ibm-plex-thai`.
- [x] **Tailwind theme:** Extend `tailwind.config.ts` with:
  - `fontFamily` — sans stack (Inter + IBM Plex Sans Thai), mono stack (JetBrains Mono).
  - `colors` — primary (orange-50 through orange-950), neutrals (stone palette), semantic status colors (success/warning/error/info/sold/expired), potential tier defaults, pipeline stage defaults.
  - `borderRadius` — consistent radius tokens (lg for buttons/inputs, xl for cards, 2xl for modals).
  - `boxShadow` — custom shadow tokens (sm, md, lg, xl as defined in design system).
- [x] **Dark mode:** Configure Tailwind `darkMode: 'class'`. Add dark mode toggle utility that adds/removes `dark` class on `<html>`. Store preference in localStorage (synced to user preferences DB in auth phase).
- [x] **Base styles:** Create `globals.css` with:
  - Font smoothing (`antialiased`).
  - Default `tabular-nums` on number-containing elements.
  - Focus ring defaults (`ring-2 ring-orange-500 ring-offset-2`).
  - Scrollbar styling (subtle, thin, matching the neutral palette).
- [x] **shadcn/ui theme override:** Update shadcn CSS variables to use the orange primary and stone neutral palettes instead of defaults.
- [x] **Icon configuration:** Install `lucide-react`. Set default icon stroke width to 1.75 across the project.
- [x] **Animation utilities:** Add custom Tailwind animation classes for slide-in, fade-up, and spring easing curves as defined in `DESIGN_SYSTEM.md` Section 7.

#### 2.1.2 Supabase Setup

- [x] Create Supabase project (Seoul region — `ap-northeast-2`).
- [x] Enable required extensions: `pgvector`, `pg_cron`, `uuid-ossp`.
- [x] Configure Supabase Auth providers: email/password + Google OAuth.
- [x] Set up Supabase Storage buckets: `listings`, `agreements`, `avatars`, `website`, `reports`.
- [x] Configure storage bucket policies (public read for `listings`, `website`, and `avatars`; private for `agreements` and `reports`).

#### 2.1.3 Database Schema (Full)

Deploy the complete database schema in Phase 0. All 29+ tables are created now, even if their corresponding features come in later phases. This prevents schema migrations mid-feature and gives AI tools the full context of the data model.

**Core tables:**
- [x] `workspaces`
- [x] `users`
- [x] `contacts`
- [x] `listings`
- [x] `listing_updates` (change log)
- [x] `projects` (condominium/development database)
- [x] `zones`
- [x] `deals`
- [x] `pipeline_stages`
- [x] `pipeline_stage_history`
- [x] `comments`
- [x] `activity_logs`
- [x] `notifications`
- [x] `potential_configs`
- [x] `stage_action_playbooks`
- [x] `saved_filters`
- [x] `exclusive_agreements`
- [x] `listing_contact_matches`
- [x] `media`
- [x] `custom_field_definitions`
- [x] `custom_field_values`
- [x] `tags`
- [x] `audit_logs`
- [x] `website_pages`
- [x] `website_sections`
- [x] `form_submissions`
- [x] `blog_posts`
- [x] `ai_reports`
- [x] `ai_query_logs`
- [x] `workspace_invitations` *(added during Phase 0 development for pending invitation tracking)*

**Schema tasks:**
- [x] Write full Prisma schema (`prisma/schema.prisma`) with all models, relations, enums, and indexes.
- [x] Generate and run Supabase migration from Prisma schema.
- [x] Write Row Level Security (RLS) policies for every table (workspace isolation + role-based access). **Important Note**: When applying bulk RLS policies, ensure you *only* apply workspace-scoped policies to tables that actually contain a `workspace_id` column (e.g. exclude global tables like `zones`).
- [ ] Verify RLS policies block cross-workspace access. *(Deferred — will be validated incrementally during Phase 1 & 2)*
- [x] Define all foreign key constraints with appropriate `ON DELETE` behavior.
- [x] Add database indexes on frequently queried columns (`workspace_id`, `status`, `created_at`, `potential_tier`, `pipeline_stage_id`).

#### 2.1.4 Seed Data

- [x] Create TypeScript seed script `prisma/seed.ts` with realistic Thai real estate data using Prisma Client (see [Section 9: Seed Data Strategy](#9-seed-data-strategy)). *Note: Do not use raw SQL for seeding, as Prisma `@map` directives change underlying column names.*
- [x] Seed data should be idempotent (can be re-run without duplicating records).

#### 2.1.5 Authentication

- [x] Sign-up page (email/password).
- [x] Login page (email/password).
- [x] Google OAuth login button.
- [x] Password reset flow (email-based).
- [x] Session management (auto-refresh, redirect to login on expiry).
- [x] Auth middleware: protect all `/(dashboard)` routes — redirect unauthenticated users to login.
- [ ] ~~Two-Factor Authentication (2FA) setup page using TOTP (authenticator app).~~ *(Deferred to Phase 5 — §7.2.8 Security Hardening)*
- [ ] ~~2FA verification step during login flow.~~ *(Deferred to Phase 5 — §7.2.8 Security Hardening)*

#### 2.1.6 Workspace Management

- [x] Workspace creation flow (auto-created on first sign-up; dedicated wizard deferred to Phase 5).
- [x] Workspace settings page: name, brand color. *(Logo upload and business profile fields deferred to Phase 1)*
- [x] Multi-workspace support: workspace switcher in the dashboard header. *(Zustand store for instant sidebar updates)*
- [x] Team invitation: invite users by email with role selection.
- [x] Team management page: list members, change roles, deactivate members.
- [ ] Role definitions enforced: Owner, Admin, Co-Worker, Listing Support. *(Roles stored as enums but granular permission checks deferred to Phase 2)*

#### 2.1.7 Dashboard Shell

Build the dashboard layout following the component patterns and page layouts defined in `DESIGN_SYSTEM.md` Sections 8.5 (Sidebar Navigation) and 9.1–9.4 (Page Layouts).

- [x] Dashboard layout: sidebar navigation (dark, `stone-900`, `w-60`) + top header (`h-14`) + content area (`bg-stone-50`, `p-6`). See `DESIGN_SYSTEM.md` Section 4.2 for exact dimensions.
- [x] Sidebar navigation with links to all modules (Listings, CRM, Projects, Website, AI, Dashboard, Settings). Styled per `DESIGN_SYSTEM.md` Section 8.5 — dark background, orange active states, section grouping with overline labels. Modules not yet built show a "Coming in Phase X" placeholder.
- [x] Top header: workspace name/logo, workspace switcher, notification bell (empty for now), user avatar + dropdown (profile, settings, logout).
- [x] Settings page with sub-pages: Workspace, Team, Pipeline Stages, Potential Tiers, Playbooks, Notifications, Integrations. Use settings layout from `DESIGN_SYSTEM.md` Section 9.3.
- [ ] ~~Global search shell (Cmd+K command palette) — UI component ready, search logic implemented in later phases.~~ *(Deferred to Phase 5 — §7.2.3 Global Search)*
- [x] Dark mode toggle (stored in user preferences). Toggle switches between light and dark themes as defined in `DESIGN_SYSTEM.md` Section 10.
- [x] Responsive layout: sidebar collapses to icon-only (`w-16`) below `lg` (1024px). Below `md` (768px), sidebar becomes overlay with hamburger trigger.
- [x] Loading states: skeleton loaders (`animate-pulse bg-stone-200 rounded`) on all data-fetching areas as defined in `DESIGN_SYSTEM.md` Section 7.2.
- [x] Toast notification system: configure shadcn toast with positioning and styling from `DESIGN_SYSTEM.md` Section 8.9.

#### 2.1.8 Pipeline & Potential Configuration

- [x] Pipeline Stages settings page: create, rename, reorder (drag-and-drop via `@dnd-kit`), color-code, and delete stages. Separate tabs for Buyer and Seller pipelines.
- [x] Default pipeline stages seeded for new workspaces (via `ensureDefaultPipelineStages`).
- [x] Potential Tier settings page: configure display names, colors, and reminder intervals per module (Listings, Buyer CRM, Seller CRM). *(Fixed module casing mismatch and `display_order` → `order` column bug)*
- [x] Stage Action Playbook settings page: shell exists with basic CRUD.

### 2.2 Validation Checklist

After Phase 0 is complete, manually verify:

- [x] Can sign up with email, log in, and log out.
- [x] Can sign in with Google OAuth.
- [ ] ~~Can enable and verify 2FA.~~ *(Deferred to Phase 5)*
- [x] After login, the dashboard shell loads with sidebar, header, and navigation.
- [x] Can create/edit workspace settings (name, brand color). *(Logo upload deferred)*
- [x] Can invite a team member and assign a role.
- [x] Can switch between workspaces (if multiple exist).
- [x] Can create, reorder, rename, and delete pipeline stages for both Buyer and Seller.
- [x] Can configure Potential Tiers with custom labels, colors, and reminder intervals.
- [x] Can create Stage Action Playbook entries.
- [x] Dark mode toggle works.
- [x] Thai text renders correctly in IBM Plex Sans Thai.
- [x] Orange primary color applied correctly.
- [x] shadcn/ui components reflect the custom theme (orange primary, stone neutrals).
- [x] Skeleton loading states display on data-fetching pages.
- [x] Toast notification appears correctly (Sonner).
- [x] Sidebar collapses on mobile.
- [x] Seed data is loaded and visible when querying the database directly.
- [ ] RLS blocks access: User A cannot see User B's workspace data. *(To be validated incrementally)*

---

## 3. Phase 1 — Listing Management

> **Goal:** Build the core listing management table — the module agents will use most. After this phase, agents can create listings, edit them inline, upload photos, filter and group their portfolio, track status changes, and collaborate via comments. The project database is also built here since listings reference it.

### 3.1 Dependencies

- Phase 0 (complete): Auth, database schema, dashboard shell, workspace settings, pipeline/potential config.

### 3.2 Deliverables

#### 3.2.1 Project Database

- [ ] Projects page in the dashboard: table view of all condominium/development projects.
- [ ] Create new project form with all fields from the Project Table schema.
- [ ] Edit project details (full detail page).
- [ ] Project search and filter (by zone, property type, developer).
- [ ] Zone management: settings page or inline creation for zones (Thai + English names).

#### 3.2.2 Listing Table — Core

Build the listing table following `DESIGN_SYSTEM.md` Section 8.6 (Table Rows & Cells) and Section 9.1 (Table View Page Layout).

- [ ] Listings page: full-width data table using `@tanstack/react-table` + shadcn DataTable. Table styling per design system: 40px rows, `stone-50` header, `stone-50` row hover, `orange-50` selected rows, `border-b border-stone-100` between rows.
- [ ] Column configuration: show/hide columns, resize, reorder. Configuration saved per user (localStorage or database).
- [ ] Inline editing: click a cell to edit. Changes save on blur or Enter. Supports text, number, dropdown, and date fields.
- [ ] Create new listing: slide-out panel or modal with all listing fields. Required fields enforced.
- [ ] Quick-create shortcuts: create a new Seller Contact inline without leaving the listing form.
- [ ] Quick-create shortcuts: create a new Project inline without leaving the listing form.
- [ ] Auto-fill from Project Database: when a project is selected, populate zone, BTS, MRT, Google Maps link, and property type automatically.
- [ ] Listing detail page: full-page view of a single listing with all fields, editable.

#### 3.2.3 Listing Table — Organization

- [ ] Group by: Potential Tier, Listing Status, or Project. Toggle between group modes.
- [ ] Filter: filter by any column or combination of columns. Filter UI using dropdowns, range sliders (price, size), and text search.
- [ ] Saved Filters: save current filter configuration with a name. Load saved filters from a dropdown. Option to share filters with the team.
- [ ] Sorting: click column headers to sort ascending/descending.
- [ ] Potential Tier selection: assign A/B/C/D tier to each listing via inline dropdown. Colors from Potential Config.
- [ ] Listing Status: change status via inline dropdown. **Status changes trigger a confirmation dialog** before saving (because status changes are tracked).

#### 3.2.4 Listing Table — Flags & Visibility

- [ ] Website Visible toggle: Active/Inactive switch per listing. Controls public website display.
- [ ] Featured Listing flag: toggle to mark listings for homepage display.
- [ ] Focus Listing flag: internal priority flag. Visible only in the dashboard.
- [ ] Exclusive Listing flag: indicates an exclusive agreement exists. Links to agreement record.
- [ ] Missing Details / Photo flag: automatic visual indicator (icon or badge) when a listing has empty required fields or zero photos.

#### 3.2.5 Status & Timeline Tracking

- [ ] Listing Status Timeline: when status changes (after confirmation dialog), log the change in `listing_updates` table with timestamp, old status, new status, and user.
- [ ] Status timeline visualization on the listing detail page: show all status changes as a vertical timeline with durations (e.g., "Active for 45 days → Reserved for 3 days → Sold").
- [ ] Days on Market: auto-calculated from the date status was first set to "Active." Displayed as a column in the table.
- [ ] Price History Tracking: every change to Asking Price or Rental Price is logged. Price history shown as a mini-table or chart on the listing detail page.

#### 3.2.6 Photo & Media Management

- [ ] Bulk photo upload: drag-and-drop zone on the listing detail page. Upload multiple photos at once.
- [ ] Photo gallery: grid view of all listing photos on the detail page.
- [ ] Drag-and-drop photo reordering: change photo display order by dragging. First photo = cover image.
- [ ] Photo delete: remove individual photos with confirmation.
- [ ] Media files section: upload non-photo files (floor plans, documents). Displayed as a file list.
- [ ] Watermark generation: option to apply workspace watermark to listing photos. Watermarked versions stored separately.
- [ ] Storage usage display: show total storage used per workspace in settings.

#### 3.2.7 Comments & Activity Feed

Build the comments and activity feed system here as a **reusable, entity-agnostic system** that works for both Listings (now) and Deals (Phase 2).

- [ ] Comment section on the listing detail page (below listing fields, similar to a Notion page).
- [ ] Rich text comment input (basic formatting: bold, italic, links).
- [ ] @Mention users: type `@` to see a list of workspace members. Mentioned users receive a notification (Notification table entry). Mentioned users see listing data filtered by their role-based access.
- [ ] Tag a Contact: type a trigger to search and tag a buyer contact in the comment. Creates a cross-reference.
- [ ] Tag a Pipeline Stage: option to annotate a comment with a pipeline stage reference (e.g., "Showing completed" note).
- [ ] Activity Feed on the listing detail page: a chronological log that auto-records:
  - Listing created
  - Field edited (which field, old value → new value)
  - Status changed
  - Photo uploaded / deleted / reordered
  - Comment added
  - User mentioned
  - Contact tagged
- [ ] Activity Feed entries stored in the `activity_logs` table.
- [ ] Activity Feed UI: filterable by activity type (e.g., show only status changes, or only comments).

#### 3.2.8 Cross-Module Insights (Read-Only Previews)

These features display data from the CRM (Phase 2). In Phase 1, build the UI placeholders and the database queries. They will populate with real data once Phase 2 is complete.

- [ ] Linked Deal Counter: on the listing detail page, show the count of active Deals where the buyer contact's requirements match this listing. Clicking shows the matched contacts. (In Phase 1, this shows "0" or a placeholder until CRM data exists.)
- [ ] Pipeline Stage Count: on the listing detail page, show a summary bar of buyer-side activity (Units Sent: X, Showings: X, Negotiations: X). (Placeholder until Phase 2.)

#### 3.2.9 Exclusive Agreements

- [ ] Exclusive Agreement section on the listing detail page (when Exclusive flag = true).
- [ ] Create/edit agreement: start date, end date, commission rate/type, upload signed document, notes.
- [ ] Agreement status tracking: Active, Expired, Renewed, Cancelled.
- [ ] Renewal flow: create a new agreement linked to the previous one, increment renewal count.
- [ ] Expiry reminder: configurable "reminder X days before expiry" — creates a notification when triggered.

#### 3.2.10 Listing Copy Generation

- [ ] Auto-generated listing copy: button on the listing detail page that generates a marketing description from a template using listing fields (property type, location, size, bedrooms, price, features, nearby transport).
- [ ] Template is a simple string template (not AI-generated — AI copy comes in Phase 4). Agent can edit the generated copy.

#### 3.2.11 Archive

- [ ] Archive listing action (instead of delete). Moves listing out of active views.
- [ ] "Show archived" toggle in the listing table to view/restore archived listings.
- [ ] Restore from archive action.

### 3.3 Validation Checklist

After Phase 1 is complete, manually verify:

- [ ] Can create a new project with all fields.
- [ ] Can create a new listing, selecting a project and auto-filling shared fields.
- [ ] Can create a seller contact inline from the listing form.
- [ ] Listing table displays with all configured columns.
- [ ] Can inline-edit any field and changes persist on blur.
- [ ] Can group by Potential Tier, Status, and Project.
- [ ] Can filter by price range, zone, bedrooms, status, and property type.
- [ ] Can save a filter, reload the page, and re-apply it.
- [ ] Changing listing status triggers the confirmation dialog and logs the change.
- [ ] Status timeline on the detail page shows all historical status changes.
- [ ] Days on Market calculates correctly from the first Active date.
- [ ] Changing Asking Price logs the old price in price history.
- [ ] Can upload 5+ photos via drag-and-drop and reorder them by dragging.
- [ ] First photo displays as cover image in the listing table row.
- [ ] Missing details flag appears when required fields are empty.
- [ ] Missing photo flag appears when a listing has zero photos.
- [ ] Can write a comment, @mention a user, and the mentioned user sees a notification.
- [ ] Activity feed shows all listing events in chronological order.
- [ ] Can create an exclusive agreement with file upload.
- [ ] Can archive a listing and restore it.
- [ ] RLS verified: Co-Worker can only see/edit their own listings (or all, depending on role definition). Listing Support can see listings but not CRM data.

---

## 4. Phase 2 — CRM

> **Goal:** Build the full CRM — contacts, deals, pipeline management, reminders, and suggested actions. After this phase, agents have a complete workflow: manage listings (Phase 1), manage relationships and deals (Phase 2), and collaborate across both modules via comments and activity feeds.

### 4.1 Dependencies

- Phase 0 (complete): Auth, schema, pipeline/potential config.
- Phase 1 (complete): Comments & activity feed system (reused here), listing data (for cross-referencing deals to listings).

### 4.2 Deliverables

#### 4.2.1 Contact Management

- [ ] Contacts page in the dashboard: data table with all contact fields.
- [ ] Create new contact form: all fields from the Contact Table schema. Contact Type multi-select (Buyer, Seller, Both, Referrer).
- [ ] Contact detail page: full view of all contact information, editable.
- [ ] Buyer requirements section on contact detail page: dedicated fields for budget, preferred zones, property type, size range, floor range, facilities, pet/EV/parking, pain points, timeline, financing, pre-approval.
- [ ] Contact Source tracking: dropdown selection on create/edit.
- [ ] Referral chain: "Referred By" field links to another contact. Visual display of referral chain on detail page.
- [ ] Contact Status management: Active, On Hold, Closed Won, Closed Lost, Unqualified, Reactivate.
- [ ] Contact Details Completeness Score: visual progress indicator showing what percentage of profile fields are filled.
- [ ] Duplicate Contact Detection: on creating a new contact, check for existing contacts with matching phone number, email, or name + phone combination. Display a warning with option to merge or proceed.
- [ ] Contact archive and restore (same pattern as listings).

#### 4.2.2 Deal Management

- [ ] CRM page with **Buyer** and **Seller** tabs. Each tab shows deals filtered by deal type.
- [ ] Create new deal: creates a Contact (if new) + Deal record in one action. Deal is auto-placed in the first pipeline stage.
- [ ] Deal auto-naming: auto-generate deal name from contact name + listing/project name + deal type (e.g., "Somchai — Ideo Q Siam — Sell"). Editable.
- [ ] Deal detail page: all deal fields, linked contact info, linked listing info, pipeline stage, status, value tracking.
- [ ] Deal table: data table with inline editing, same UX patterns as the listing table.
- [ ] Customizable columns and rows (same column config memory system as listings).
- [ ] Group by: Potential Tier, Deal Status, Pipeline Stage.
- [ ] Filter / Saved Filter (same system as listings, module = CRM).
- [ ] Potential Tier selection (A/B/C/D) on deals — inherited from the linked contact or set independently.
- [ ] Deal Status management: Active, On Hold, Closed Won, Closed Lost.
- [ ] Closed Lost Reason: required field when marking a deal as Closed Lost. Dropdown with common reasons + free text option.
- [ ] Lead Source tracking on the deal: where this specific deal originated (may differ from the contact's source if a returning client).
- [ ] Deal Value Tracking: estimated deal value, commission rate, estimated commission (auto-calculated).
- [ ] Deal archive and restore.

#### 4.2.3 Pipeline Management

- [ ] Pipeline Stage display: visual indicator (colored badge) of current stage on each deal row.
- [ ] Pipeline Stage change: dropdown to move deal to a different stage. Each change is logged.
- [ ] Pipeline Stage History & Timeline: on the deal detail page, show every stage transition with timestamps and duration in each stage. Same vertical timeline pattern as listing status timeline.
- [ ] Pipeline Stage History stored in `pipeline_stage_history` table.
- [ ] Pipeline board view (optional, stretch goal): Kanban-style board where deals are cards in stage columns. Drag to move between stages. This is a nice-to-have visual alternative to the table view.

#### 4.2.4 Comments & Activity Feed (Reuse from Phase 1)

- [ ] Hook the comments system (built in Phase 1) into the Deal entity. Deal detail page gets the same comment section.
- [ ] @Mention users in deal comments.
- [ ] Tag a Listing in deal comments: search and link a listing for context.
- [ ] Activity Feed on the deal detail page: auto-records deal creation, stage changes, field edits, comments, contact updates.

#### 4.2.5 Reminders & Suggested Actions Engine

Build a shared engine that serves both Listings and CRM.

- [ ] Action Reminder system: based on Potential Tier config, calculate when each listing/deal is due for follow-up. When the interval is reached, create a Notification record.
- [ ] Reminder check: a scheduled task (Vercel Cron or Supabase `pg_cron`) that runs daily, checks all active listings and deals against their potential tier's reminder interval and `last_action_date`, and generates notifications for overdue items.
- [ ] Suggested Action display: when a reminder triggers, show the suggested action from the Stage Action Playbook (if configured for the current pipeline stage). Display on the deal/listing detail page and in the notification.
- [ ] "Mark as actioned" button: when the agent takes the suggested action, update `last_action_date` and dismiss the reminder.
- [ ] Reminder Override per stage: if a Stage Action Playbook entry has `reminder_override = true`, use the stage-specific interval instead of the potential tier interval.

#### 4.2.6 Notification System

- [ ] In-app notification center: notification bell in the dashboard header with unread count badge.
- [ ] Notification dropdown: list of recent notifications, click to navigate to the relevant entity.
- [ ] Mark as read (individual and mark all as read).
- [ ] Notification types supported: Action Reminder, Stage Change, Mention, Listing Status Change, Exclusive Agreement Expiry.
- [ ] Real-time delivery: new notifications appear instantly via Supabase Realtime subscription.
- [ ] Email notification dispatch: for notification types where the user has enabled email delivery (based on Potential Config `reminder_type`). Sent via Resend.
- [ ] LINE Notify dispatch: for notification types where the user has enabled LINE delivery.
- [ ] LINE Notify setup wizard: in Settings > Integrations, guide the user through connecting their LINE Notify token.
- [ ] Notification Preferences page: per-user settings for which notification types are enabled, and which channels (in-app, email, LINE) for each.

#### 4.2.7 Smart Matching (Basic)

- [ ] When a listing is created or updated, check for buyer contacts whose requirements match (zone, budget range, property type, bedrooms, size range).
- [ ] Store matches in `listing_contact_matches` with a match score and matched fields.
- [ ] Linked Deal Counter on listing detail page (built as placeholder in Phase 1) now populates with real data.
- [ ] Smart Match notification: when a new match is found, notify the assigned agent.

#### 4.2.8 Cross-Module Links

- [ ] From a listing detail page: see all deals associated with this listing.
- [ ] From a contact detail page: see all deals for this contact (both buy-side and sell-side).
- [ ] From a deal detail page: click through to the linked listing and linked contact.
- [ ] Pipeline Stage Count on listing detail page (built as placeholder in Phase 1) now populates with real deal stage data.

### 4.3 Validation Checklist

After Phase 2 is complete, manually verify:

- [ ] Can create a new contact with all fields including buyer requirements.
- [ ] Duplicate detection triggers when creating a contact with an existing phone number.
- [ ] Completeness score updates as fields are filled in.
- [ ] Can create a new deal from the CRM page (auto-creates contact if needed).
- [ ] Deal auto-name generates correctly.
- [ ] CRM table shows Buyer and Seller tabs with correct deal filtering.
- [ ] Can group deals by Pipeline Stage and see correct grouping.
- [ ] Can change a deal's pipeline stage and see the change logged in the timeline.
- [ ] Closing a deal as "Lost" requires a Closed Lost Reason.
- [ ] Comments work on deals: can write, @mention, and tag a listing.
- [ ] Activity feed on deals shows all events.
- [ ] Action Reminders trigger: set a contact to Potential A (7-day interval), set `last_action_date` to 8 days ago, run the reminder check, and verify a notification appears.
- [ ] Suggested Action shows on the notification when a playbook entry exists for the current stage.
- [ ] Notification bell shows unread count and notifications appear in real-time.
- [ ] Email notification sends for a reminder (when email delivery is enabled).
- [ ] LINE Notify sends for a reminder (when LINE delivery is enabled and token is configured).
- [ ] Smart matching: create a buyer with requirements that match an existing listing. Verify the match appears on the listing detail page.
- [ ] From a listing, can navigate to related deals. From a deal, can navigate to the listing and contact.
- [ ] RLS verified: Co-Worker sees only deals assigned to them. Listing Support role has no CRM access.

---

## 5. Phase 3 — Website Builder

> **Goal:** Build the public-facing website that syncs with the listing dashboard, and the drag-and-drop builder that lets agents customize it. After this phase, agents have a live website showing their listings, an about page, a blog, and a contact form that feeds leads into the CRM.

### 5.1 Dependencies

- Phase 0 (complete): Auth, schema, workspace branding.
- Phase 1 (complete): Listings data with photos, Featured flag, Website Visible toggle.
- Phase 2 (recommended but not blocking): CRM for auto-creating contacts and deals from form submissions. If Phase 2 is not complete, form submissions are stored but not auto-converted to deals.

### 5.2 Deliverables

#### 5.2.1 Public Website Rendering (SSR)

All public pages are server-side rendered for SEO and performance. The public website follows different design rules than the dashboard — see `DESIGN_SYSTEM.md` Section 11 (Public Website) for the warmer, more spacious treatment: 16px body text, `max-w-6xl` content width, `rounded-2xl` cards, `shadow-lg`, and scroll-triggered animations.

- [ ] **Homepage:** Hero section (customizable image and text), featured listings grid (pulled from listings where `featured_flag = true` and `website_visible = true`), about summary section, call-to-action section.
- [ ] **Listing Search page:** Filterable grid of all website-visible listings. Filters: zone, price range (min/max), bedrooms, property type, listing type (sell/rent). Results update on filter change.
- [ ] **Map-based search:** Google Maps view on the listing search page showing listing locations as pins. Click a pin to see listing summary. Toggle between grid view and map view.
- [ ] **Listing Detail page:** Photo gallery (swipeable), all property details, pricing, floor plan (if uploaded), Google Maps embed for location, inquiry form, LINE inquiry button.
- [ ] **About Us / Team page:** Agency description, team member cards (pulled from workspace users with profile photos), service areas, credentials.
- [ ] **Blog index page:** Grid of published blog posts with cover images, titles, dates, and categories.
- [ ] **Blog post page:** Full blog post content (rich text), cover image, author, publish date, category.
- [ ] **Contact page:** Contact form + LINE inquiry button + agency address/phone/email.

#### 5.2.2 Website Builder (Dashboard Side)

- [ ] Website Builder page in the dashboard.
- [ ] **Page management:** List of pages (Homepage, Listing Search, Listing Detail, About, Blog, Contact, Custom). Toggle published/unpublished.
- [ ] **Section management per page:** List of sections on each page. Add new sections from a template library. Remove sections.
- [ ] **Drag-and-drop section reordering:** Rearrange sections on a page using `@dnd-kit`.
- [ ] **Section editing:** Click a section to edit its content. Each section type has a configuration panel:
  - Hero: image, headline, subheadline, CTA button text and link.
  - Featured Listings: auto-populated, no config needed (or optional: max count).
  - Listing Grid: auto-populated from website-visible listings.
  - About: rich text content, team photos toggle.
  - Team: auto-populated from workspace users.
  - Testimonials: add/edit/remove testimonial cards (name, text, photo).
  - Stats: configurable number counters (e.g., "500+ Units Sold").
  - CTA: headline, description, button text and link.
  - Blog Feed: auto-populated from recent published posts.
  - Contact Form: toggle which fields to show, success message text.
  - Custom HTML: raw HTML input for advanced users.
- [ ] **Live preview:** Side-by-side or toggle between edit and preview mode.
- [ ] **Branding inheritance:** Website automatically uses workspace logo, primary color, and fonts from workspace settings.

#### 5.2.3 Blog Management

- [ ] Blog management page in the dashboard: list of all posts.
- [ ] Create/edit blog post: title, slug (auto-generated from title, editable), rich text editor, cover image upload, category, tags, meta title, meta description.
- [ ] Publish/unpublish toggle.
- [ ] Blog post preview before publishing.

#### 5.2.4 Listing Sync

- [ ] Listings with `website_visible = true` automatically appear on the public website.
- [ ] Listings with `featured_flag = true` appear on the homepage featured grid.
- [ ] Changes in the dashboard (price update, new photos, status change to Sold/Inactive) reflect on the website on next page load (SSR) or via ISR (Incremental Static Regeneration) for performance.
- [ ] When a listing status changes to Sold, Expired, or Withdrawn, it is automatically removed from the public website (or displayed with a "Sold" overlay, depending on workspace preference).

#### 5.2.5 Lead Capture

- [ ] Contact/inquiry forms on the listing detail page and contact page.
- [ ] Form fields: name, phone, email (optional), LINE ID (optional), message.
- [ ] **PDPA consent checkbox:** "I consent to the collection and use of my personal data as described in the Privacy Policy." Required to submit.
- [ ] Form submission stored in `form_submissions` table with timestamp, source page, and source listing (if from a listing detail page).
- [ ] **Auto-create Contact + Deal** (if Phase 2 is complete): form submission optionally triggers creation of a Contact and a Deal in the first pipeline stage. Configurable per workspace (Settings > Website > "Auto-create lead from form submission" toggle).
- [ ] Notification to the assigned agent (or workspace owner) when a new form is submitted.
- [ ] LINE inquiry button: opens LINE chat with the workspace's LINE Official Account (or displays the LINE ID for manual add).

#### 5.2.6 SEO & Domain

- [ ] SEO settings per page: meta title, meta description, OG image.
- [ ] Auto-generated SEO for listing detail pages: title = listing name + zone, description = auto-generated from listing details.
- [ ] `sitemap.xml` auto-generated from published pages and active listings.
- [ ] `robots.txt` configuration.
- [ ] Custom domain support: workspace can configure a custom domain that points to their website. Vercel handles SSL.
- [ ] Default subdomain: `[workspace-slug].echo.co.th`.

#### 5.2.7 Privacy Policy Page

- [ ] Auto-generated privacy policy page template covering PDPA requirements. Workspace can customize the content.
- [ ] Linked from the consent checkbox on all forms.

### 5.3 Validation Checklist

After Phase 3 is complete, manually verify:

- [ ] Public homepage loads with featured listings, hero section, and correct branding.
- [ ] Listing search page shows all website-visible listings.
- [ ] Can filter listings by zone, price range, bedrooms, and type.
- [ ] Map view shows listing pins at correct locations. Clicking a pin shows listing info.
- [ ] Listing detail page shows all details, photo gallery, inquiry form, and LINE button.
- [ ] About page shows team members from the workspace.
- [ ] Blog index shows published posts. Blog post page renders rich text content.
- [ ] Contact form submits successfully and creates a form_submission record.
- [ ] PDPA consent checkbox is required — form cannot submit without it.
- [ ] (If Phase 2 complete) Form submission auto-creates a Contact and Deal.
- [ ] Notification sent to agent on new form submission.
- [ ] In the dashboard website builder: can add, remove, and reorder sections.
- [ ] Can edit section content and see changes reflected on the public website.
- [ ] Toggling a listing's Website Visible flag adds/removes it from the public site.
- [ ] Toggling Featured flag adds/removes it from the homepage.
- [ ] Changing listing status to Sold removes or overlays the listing on the public site.
- [ ] SEO meta tags render correctly (check with browser dev tools).
- [ ] Privacy policy page is accessible and linked from forms.

---

## 6. Phase 4 — AI

> **Goal:** Add all AI-powered features — the RAG chatbot, data input autofill, marketing reports, listing comparison reports, and the agent assistant. After this phase, agents can ask questions about their data, auto-fill listings from raw text, generate professional reports, and receive proactive suggestions.

### 6.1 Dependencies

- Phase 0 (complete): Schema, auth.
- Phase 1 (complete): Listing data for AI to query and report on.
- Phase 2 (complete): Deal and contact data for the chatbot and agent assistant to analyze.

### 6.2 Deliverables

#### 6.2.1 AI Infrastructure

- [ ] Claude API client setup (`@anthropic-ai/sdk`).
- [ ] AI configuration in workspace settings: API key management (or use platform-level key with per-workspace usage tracking).
- [ ] `pgvector` embeddings pipeline:
  - When a listing is created or updated, generate an embedding and store it in a vector column.
  - When a contact's requirements are updated, generate an embedding for the requirements.
  - Embedding generation runs asynchronously (Edge Function or background job) to avoid blocking the UI.
- [ ] AI chat interface page in the dashboard: full-width chat UI with message history, input field, and response rendering. See `DESIGN_SYSTEM.md` Section 12 (Reference Screenshots) for chat UI reference (ChatGPT-style clean message bubbles, streaming response, input bar at bottom).
- [ ] `ai_query_logs` table logging: every AI interaction is logged with query text, response text, data sources referenced, and query type.
- [ ] Token usage tracking per workspace (for future billing/plan tier enforcement).

#### 6.2.2 RAG Chatbot

- [ ] User types a natural language question.
- [ ] System flow:
  1. Embed the user's query.
  2. Perform vector similarity search in `pgvector` to find relevant listings, contacts, deals, and projects.
  3. Also run structured database queries for quantitative questions (counts, averages, aggregations) using Prisma.
  4. Inject relevant context into a Claude prompt with system instructions about the workspace's data model.
  5. Return the answer with source references (e.g., "Based on 12 active listings in Sukhumvit zone...").
- [ ] Support for common query types:
  - Counting: "How many active listings do I have?"
  - Filtering: "Show me all 2-bedroom condos under 5M in Thonglor."
  - Aggregation: "What's the average price per sqm for Ideo Q Siam?"
  - CRM queries: "Which deals are in the Negotiation stage?"
  - Overdue queries: "Which leads haven't been contacted in 30 days?"
  - Comparison: "Compare my listing prices to the project average."
- [ ] Chat history per session (stored in memory or database for multi-turn conversations).
- [ ] "Ask about this listing" shortcut: from any listing detail page, open AI chat pre-loaded with that listing's context.

#### 6.2.3 Data Input Autofill

- [ ] Autofill tool accessible from the AI chat interface and from the "Create New Listing" form.
- [ ] User flow:
  1. Agent copies raw listing text (from LINE message, Facebook post, portal listing, or any source).
  2. Pastes it into the Autofill input area.
  3. Clicks "Autofill."
  4. System sends the raw text to Claude with a structured prompt instructing it to extract and map fields to the listing schema.
  5. Claude returns a JSON object with extracted fields: property type, bedrooms, bathrooms, size, floor, price, zone, building name, unit condition, etc.
  6. Frontend pre-fills the "Create New Listing" form with the extracted data.
  7. Agent reviews each field, corrects any errors, and saves.
- [ ] Handles Thai and English text.
- [ ] Handles partial data gracefully — unfilled fields are left empty, not guessed.
- [ ] Confidence indicator: optional visual cue showing which fields the AI is confident about vs. uncertain.

#### 6.2.4 Marketing Report Generator

- [ ] Report builder UI: agent selects a listing, then chooses which fields/stats to include in the report.
- [ ] Configurable report sections:
  - Listing details (photos, specs, pricing)
  - Days on market
  - Price history chart
  - Inquiry/activity summary (from deal pipeline data)
  - Comparable listings (same project or zone, similar size/type)
  - Market context (average price per sqm for the project/zone)
- [ ] Claude generates narrative commentary for selected sections (e.g., "This unit is priced 5% below the project average, making it competitive for the current market.").
- [ ] PDF rendering via `@react-pdf/renderer` with professional layout, workspace branding (logo, colors).
- [ ] Report saved to `ai_reports` table and stored as PDF in Supabase Storage (`reports` bucket).
- [ ] Deliver via email (Resend) or LINE Notify directly from the report preview page.
- [ ] Report delivery logged: who it was sent to, via which channel, and when.

#### 6.2.5 Listing Comparison Report

- [ ] Agent selects 2–5 listings to compare.
- [ ] Side-by-side comparison table: price, size, price per sqm, bedrooms, floor, view, building, parking, maintenance fee, distance to station.
- [ ] Claude generates a brief comparative analysis highlighting strengths and trade-offs of each option.
- [ ] PDF output with professional layout and workspace branding.
- [ ] Deliver via email or LINE Notify.
- [ ] Saved to `ai_reports` table.

#### 6.2.6 AI Agent Assistant

- [ ] Scheduled analysis: a daily or weekly background job that analyzes the workspace's data.
- [ ] Analysis checks:
  - Listings with no activity in X+ days (configurable threshold).
  - Deals stuck in a pipeline stage beyond the expected duration.
  - High-inquiry listings with low showing conversion.
  - Upcoming exclusive agreement expirations.
  - Contacts with overdue follow-ups.
  - Listings with prices significantly above/below comparable units.
- [ ] Claude generates prioritized, actionable suggestions in natural language (e.g., "3 listings have had no inquiries in 21 days. Consider refreshing photos or adjusting price. Top priority: Listing X at Ideo Q Siam — priced 15% above project average.").
- [ ] Suggestions surfaced in two places:
  - A "Suggestions" card on the dashboard home page.
  - Available in the AI chat (agent can ask "What should I focus on today?").
- [ ] Suggestions stored in the database with timestamps. Agents can dismiss or act on them.

### 6.3 Validation Checklist

After Phase 4 is complete, manually verify:

- [ ] AI chat loads and accepts natural language queries.
- [ ] Chatbot correctly answers: "How many active listings do I have?" (returns accurate count from seed data).
- [ ] Chatbot correctly answers: "Show me condos under 5M in Sukhumvit" (returns relevant listings).
- [ ] Chatbot handles CRM queries: "Which deals are in Showing stage?" (returns correct deals).
- [ ] Chat history maintains context across multiple turns.
- [ ] Data Input Autofill: paste a raw Thai listing description, click Autofill, and verify fields are correctly extracted and pre-filled.
- [ ] Autofill handles incomplete data without crashing (unfilled fields stay empty).
- [ ] Marketing Report: select a listing, configure sections, generate report, and verify the PDF looks professional with correct data.
- [ ] Can deliver the report via email and verify it arrives.
- [ ] Can deliver the report via LINE Notify and verify it arrives.
- [ ] Listing Comparison: select 3 listings, generate comparison, and verify the PDF has accurate side-by-side data.
- [ ] Agent Assistant: run the analysis job manually and verify suggestions appear on the dashboard.
- [ ] Suggestions are actionable and reference real listings/deals from seed data.
- [ ] AI query log captures all interactions.

---

## 7. Phase 5 — Dashboard, Polish & Launch Readiness

> **Goal:** Build the analytics dashboard, add data management tools (import/export), complete remaining integrations, add onboarding and help features, harden security and PDPA compliance, add automated tests, and optimize performance. After this phase, ECHO is ready for real users.

### 7.1 Dependencies

- All previous phases complete.

### 7.2 Deliverables

#### 7.2.1 Dashboard & Analytics

Dashboard design to be finalized based on available data and user feedback. The following is a starting framework:

- [ ] **Dashboard home page:** Overview of key metrics with date range selector.
- [ ] **Listings Report:**
  - Total active listings (by status breakdown).
  - New listings added (this week/month).
  - Average days on market.
  - Listings by zone, property type, and potential tier.
  - Sold/rented vs. expired/withdrawn ratio.
  - Price trend chart (average asking price over time).
- [ ] **Deals Report:**
  - Active deals by pipeline stage (funnel visualization).
  - Conversion rate per stage (how many advance vs. drop off).
  - Average time in each stage.
  - Total estimated deal value (pipeline value).
  - Commission forecast (estimated commission from active deals).
  - Deals by source (which lead sources produce the most deals).
  - Closed Won vs. Closed Lost with reason breakdown.
- [ ] **Marketing Report (Dashboard):**
  - Form submissions over time (from website).
  - Submissions by source page (which listing pages generate the most inquiries).
  - Website traffic metrics (if analytics integration is added, or placeholder).
- [ ] **Action & Performance Report:**
  - Actions completed vs. overdue per agent.
  - Average response time to new leads.
  - Follow-up compliance rate (% of reminders acted on within interval).
  - Deals per agent.
  - Listings per agent.
- [ ] All reports filterable by date range, agent, zone, and deal type.
- [ ] Charts: use `recharts` or `chart.js` for visualizations.

#### 7.2.2 Data Import / Export

- [ ] **Import from Excel/CSV:**
  - Import listings from a structured Excel/CSV file. Column mapping UI: user maps their columns to ECHO fields.
  - Import contacts from Excel/CSV with same mapping UI.
  - Validation step before import: show preview of data, flag errors (missing required fields, invalid formats), and let user fix before confirming.
  - Duplicate handling on import: flag potential duplicate contacts.
- [ ] **Export to Excel/CSV:**
  - Export current listing table view (with active filters applied) to Excel/CSV.
  - Export current CRM view to Excel/CSV.
  - Export contacts to Excel/CSV.
- [ ] **Export to PDF:**
  - Export individual listing detail as a one-page PDF summary (for sharing with clients outside of the AI-generated reports).

#### 7.2.3 Global Search

- [ ] Implement the global search (Cmd+K command palette) built as a shell in Phase 0.
- [ ] Search across: listings (by name, project, zone), contacts (by name, phone, nickname), deals (by name, contact), projects (by name).
- [ ] Results grouped by entity type with quick-navigate to detail pages.
- [ ] Recent searches remembered.

#### 7.2.4 LINE Official Account Integration

- [ ] Beyond LINE Notify (one-way), integrate with LINE Messaging API for two-way communication.
- [ ] Webhook endpoint to receive incoming LINE messages.
- [ ] Message history linked to contact records (store in comments or a separate messages table).
- [ ] Reply to LINE messages from within ECHO (via the contact detail page or deal detail page).

#### 7.2.5 Custom Fields & Tags

- [ ] Custom Fields management page in Settings.
- [ ] Create custom fields for Listings, Contacts, and Deals: field name, type (text, number, date, dropdown, multi-select, boolean, URL), dropdown options, required flag, display order.
- [ ] Custom fields appear in the respective table views and detail pages.
- [ ] Custom fields included in filters and exports.
- [ ] Tag management page in Settings: create, rename, color-code, delete tags.
- [ ] Tags usable across listings, contacts, and deals.
- [ ] Tag filter support in all table views.

#### 7.2.6 Onboarding & Help

- [ ] Interactive onboarding tour for new users: guided walkthrough of the dashboard, listing creation, CRM basics, and website builder. Implemented with a lightweight tour library (e.g., `driver.js` or `react-joyride`).
- [ ] In-app help center: searchable knowledge base or link to external docs.
- [ ] Changelog / update announcements: modal or page showing recent product updates.
- [ ] Feedback button: floating button to submit feedback (stored in database or sent to a support channel).

#### 7.2.7 PDPA Hardening

- [ ] **Data Subject Request function:** Admin can search for a contact by name/phone/email and trigger a full data export (all data related to that person across all tables) as a downloadable file.
- [ ] **Right to Deletion function:** Admin can trigger hard deletion of a contact and all associated data (deals, comments, form submissions, matches). Confirmation required. Audit log entry created.
- [ ] **Consent log:** Track when and how consent was given (form submissions with consent checkbox). Queryable for compliance audits.
- [ ] **Data retention settings:** Configurable per workspace — auto-archive records older than X months/years. No auto-delete without explicit admin action.
- [ ] **Privacy policy template** updated with all data processing details specific to ECHO.

#### 7.2.8 Security Hardening

- [ ] Two-Factor Authentication (2FA) setup page using TOTP (authenticator app). *(Deferred from Phase 0)*
- [ ] 2FA verification step during login flow. *(Deferred from Phase 0)*
- [ ] Rate limiting on all auth endpoints (login, signup, password reset).
- [ ] Rate limiting on AI endpoints (to prevent abuse and control costs).
- [ ] IP restriction option in workspace settings (allow access only from specified IPs).
- [ ] Login activity log: record all login attempts (success/failure) with IP address and timestamp. Viewable in Settings.
- [ ] CORS configuration: restrict to application domain only.
- [ ] Audit log viewer in Settings: searchable log of all data changes across the workspace.
- [ ] Security review: verify all RLS policies, input validation, and file upload restrictions.

#### 7.2.9 Performance Optimization

- [ ] Database query optimization: add indexes identified during real usage, optimize slow queries.
- [ ] Image optimization: ensure all listing photos use Next.js Image component with WebP conversion and lazy loading.
- [ ] Bundle analysis: identify and reduce large JavaScript bundles.
- [ ] Lighthouse audit on public website pages: target 90+ scores for Performance, Accessibility, Best Practices, and SEO.
- [ ] Loading states: ensure all data-heavy pages have proper skeleton loaders.
- [ ] Error boundaries: graceful error handling on all pages (no white screens).

#### 7.2.10 Automated Testing

- [ ] **Unit tests (Vitest):** Cover critical business logic:
  - Smart matching score calculation.
  - Days on market calculation.
  - Deal auto-naming.
  - Duplicate contact detection.
  - Price history logging.
  - Reminder interval calculations.
- [ ] **E2E tests (Playwright):** Cover critical user flows:
  - Sign up → create workspace → create listing → publish to website.
  - Create contact → create deal → move through pipeline → close deal.
  - Website form submission → contact and deal auto-creation.
  - AI chatbot: basic query → receive answer.
- [ ] Tests integrated into CI pipeline (run on every PR).

#### 7.2.11 Mobile Responsiveness Audit

- [ ] Audit all dashboard pages on mobile breakpoints.
- [ ] Ensure listing table is usable on tablet (horizontal scroll with sticky columns).
- [ ] CRM table usable on tablet.
- [ ] All forms usable on mobile.
- [ ] Public website fully responsive (should already be, but verify).

### 7.3 Validation Checklist

After Phase 5 is complete, manually verify:

- [ ] Dashboard loads with accurate metrics from seed data.
- [ ] All four report categories show correct data with charts.
- [ ] Can import a CSV of 50 listings, map columns, and verify data appears correctly.
- [ ] Can export the listing table with filters applied and verify the Excel file is correct.
- [ ] Global search returns relevant results across all entities.
- [ ] Custom fields appear in tables and detail pages.
- [ ] Tags can be created, assigned, and filtered.
- [ ] Onboarding tour triggers for a new user and walks through key steps.
- [ ] PDPA data subject export: request export for a contact and verify all related data is included.
- [ ] PDPA deletion: delete a contact and verify all related data is removed.
- [ ] Rate limiting works: rapid login attempts are throttled.
- [ ] Login activity log shows recent login attempts.
- [ ] All automated tests pass.
- [ ] Lighthouse scores are 90+ on public website pages.
- [ ] Dashboard is usable on tablet. Public website is fully responsive on mobile.

---

## 8. Dependency Map

```
Phase 0 ─── Foundation
  │
  ├──→ Phase 1 ─── Listing Management
  │      │
  │      ├──→ Phase 2 ─── CRM
  │      │      │
  │      │      ├──→ Phase 4 ─── AI
  │      │      │      │
  │      ├──→ Phase 3 ─── Website Builder
  │      │      │
  │      │      │──→ Phase 5 ─── Dashboard, Polish & Launch
  │      │      │         ▲
  │      │      │         │
  │      └──────┴─────────┘
  │
  └── (All phases depend on Phase 0)
```

**Strict dependencies:**
- Phase 1 requires Phase 0
- Phase 2 requires Phase 0 + Phase 1 (comments system)
- Phase 3 requires Phase 0 + Phase 1 (listing data and photos)
- Phase 4 requires Phase 0 + Phase 1 + Phase 2 (needs listing + CRM data)
- Phase 5 requires all previous phases

**Parallel possibility:**
- Phase 3 (Website Builder) and Phase 2 (CRM) could be built in parallel if the comments system is extracted as a shared module early in Phase 1. However, the auto-create Contact + Deal from website forms depends on Phase 2 being complete.

---

## 9. Seed Data Strategy

Seed data is created in Phase 0 and expanded in each subsequent phase. It uses realistic Thai real estate data to make development and testing meaningful.

### 9.1 Phase 0 Seed Data

| Entity | Count | Details |
|---|---|---|
| Workspaces | 2 | "BKK Realty" (primary testing workspace) and "Siam Properties" (for multi-workspace testing) |
| Users | 5 | 1 Owner, 1 Admin, 2 Co-Workers, 1 Listing Support across the primary workspace |
| Zones | 15 | Sukhumvit, Silom-Sathorn, Ratchadaphisek, Ari-Phahonyothin, Thonglor-Ekkamai, Rama 9, Bangna, Ladprao, On Nut, Phra Khanong, Asoke, Chidlom, Riverside, Phaya Thai, Bang Sue |
| Pipeline Stages (Buyer) | 6 | Inquiry → Requirement → Unit Sent → Showing → Negotiation → Closed |
| Pipeline Stages (Seller) | 5 | Listing Received → Pricing → Active → Offer Received → Closed |
| Potential Tiers | 4 per module | A (Hot, 7 days), B (Warm, 14 days), C (Cool, 30 days), D (Cold, 60 days) |

### 9.2 Phase 1 Additions

| Entity | Count | Details |
|---|---|---|
| Projects | 10 | Real Bangkok condos: Ideo Q Siam, The Line Sukhumvit 101, Ashton Asoke, Noble Ploenchit, Life Asoke-Rama 9, Rhythm Ekkamai, The Base Sukhumvit 77, Oka Haus, Park Origin Phromphong, Whizdom 101 |
| Listings | 50 | Spread across projects. Mix of sell/rent. Various statuses, potential tiers, price ranges (2M–30M THB sell, 15K–100K THB rent). Some with photos, some without (to test missing photo flag). Some featured, some focused. |
| Contacts (Sellers) | 20 | Thai names with nicknames. Linked to listings as sellers. |

### 9.3 Phase 2 Additions

| Entity | Count | Details |
|---|---|---|
| Contacts (Buyers) | 30 | Mix of Thai and foreign names. Various budgets, preferred zones, property types. Some with complete requirements, some incomplete (to test completeness score). |
| Deals | 40 | Mix of buy-side and sell-side. Various pipeline stages. Some active, some closed won, some closed lost with reasons. Spread across different agents. |
| Comments | 20 | Sample comments on various listings and deals, including @mentions. |
| Activity Log entries | 100+ | Auto-generated from deal and listing operations. |
| Notifications | 15 | Mix of read and unread. Various types. |

### 9.4 Phase 3 Additions

| Entity | Count | Details |
|---|---|---|
| Website Pages | 6 | Homepage, Listing Search, About, Blog, Contact (all published). One draft custom page. |
| Website Sections | 15 | Homepage: Hero, Featured Listings, About, CTA. About: Team, Stats. Contact: Contact Form. |
| Blog Posts | 5 | Sample Thai real estate market posts. 3 published, 2 drafts. |
| Form Submissions | 10 | Sample inquiries from various listing pages. |

### 9.5 Phase 4 Additions

| Entity | Count | Details |
|---|---|---|
| Embeddings | All listings + buyer contacts | Generated during pgvector pipeline setup. |
| AI Reports | 3 | 1 marketing report, 1 comparison report, 1 draft. |
| AI Query Logs | 10 | Sample queries and responses for testing chat history. |
| Listing-Contact Matches | 20 | Auto-generated from smart matching based on seed buyer requirements vs. seed listings. |

---

## 10. Risk & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **Supabase RLS complexity** | High — broken RLS = data leaks between workspaces | Medium | Write RLS policies in Phase 0 and test with multiple accounts before proceeding. Create a dedicated RLS test script. |
| **AI code generation inconsistency** | Medium — Antigravity generates code that doesn't follow conventions | High | Feed `TECH_STACK.md` conventions into every prompt. Review generated code against conventions before accepting. |
| **Scope creep per phase** | Medium — phases balloon and never finish | High | Treat each phase's deliverable list as frozen once started. New ideas go into a backlog for Phase 5 or future iterations. |
| **Supabase vendor dependency** | Low — concerned about lock-in | Low | All data is standard PostgreSQL. Prisma ORM abstracts the query layer. Migration to self-hosted PostgreSQL is straightforward. |
| **AI API costs** | Medium — Claude API costs grow with usage | Medium | Implement token usage tracking from Phase 4. Cache common queries. Use lighter models for routine tasks. Set per-workspace usage limits. |
| **Thai language handling** | Medium — AI features need to handle Thai text well | Medium | Test all AI features (especially Autofill and RAG) with Thai-language inputs during Phase 4 validation. Claude handles Thai well, but edge cases may exist. |
| **Website builder performance** | Medium — SSR pages need to be fast | Low | Use ISR (Incremental Static Regeneration) for listing pages. Optimize images with Next.js Image. Run Lighthouse audits in Phase 5. |
| **PDPA compliance gaps** | High — non-compliance carries legal risk | Low | PDPA requirements are explicit deliverables in Phase 3 (consent) and Phase 5 (data subject rights, deletion, audit). Review with a legal advisor before launch. |
| **Multi-tenancy bugs** | High — workspace data appearing in wrong workspace | Medium | Every database query must filter by `workspace_id`. RLS is the safety net. Test with two workspaces throughout all phases. |
| **Real-time performance at scale** | Medium — Supabase Realtime may struggle with many concurrent users | Low (initial) | Acceptable for early launch. Monitor connection counts. If needed, selectively subscribe to channels rather than full tables. |

---

*This document should be updated as phases progress. Completed items should be checked off. New discoveries or scope changes should be documented inline with a note and date.*
