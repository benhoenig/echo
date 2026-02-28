# ECHO — Product Specification

**Your success, amplified.**

> A real estate brokerage management platform built for the Thai market. ECHO gives agents and teams the tools to manage listings, nurture client relationships, build their online presence, and leverage AI — all from a single workspace.

---

## Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Data Model Overview](#2-data-model-overview)
3. [Global Functions & Features](#3-global-functions--features)
4. [Module: Listing Management Platform](#4-module-listing-management-platform)
5. [Module: CRM](#5-module-crm)
6. [Module: Website Builder](#6-module-website-builder)
7. [Module: AI](#7-module-ai)
8. [Module: Dashboard](#8-module-dashboard)
9. [Module: Co-Agent Matching Community (Coming Soon)](#9-module-co-agent-matching-community-coming-soon)
10. [Database Schema](#10-database-schema)

---

## 1. Core Concepts

ECHO is built around five core pillars. Each is a distinct module within the platform.

### 1.1 Listing Management Platform

Create, organize, and publish property listings from a single dashboard. Every listing syncs instantly and automatically to the agent's website — the way it appears, the order it's shown, and the details displayed are all controlled from one place. What agents manage in the backend is exactly what their clients see on the front end.

### 1.2 CRM

Manage every contact, deal, and relationship in one place. Track conversations, automate follow-ups, and move deals through a fully customizable pipeline that works exactly the way agents already do. Build separate pipeline stages for the buyer journey and the seller journey — rename them, reorder them, add or remove stages anytime — so teams never have to abandon the process that already works for them.

**Key data model note:** ECHO uses a unified Contact + Deal model. A **Contact** represents a person (buyer, seller, referrer, or any combination). A **Deal** represents a journey — the progression of that contact through a pipeline toward a transaction. What agents commonly call a "Lead" is simply a Deal in its early pipeline stages. The UI may display early-stage Deals as "Leads" for familiarity, but the underlying data model is unified. One Contact can have multiple simultaneous Deals (e.g., selling one property while buying another).

### 1.3 Drag & Drop Website Builder

Build a professional real estate website without writing a single line of code. Choose a layout, arrange sections, and launch a site that looks like it cost ten times more to build — with live listings always reflecting exactly what's in the dashboard.

### 1.4 AI

Ask anything about the business and get answers instantly. Leads, listings, pricing history, and client data — all accessible through a conversation. Generate professional reports for buyers and sellers automatically, then deliver them directly via email or LINE Notify. Auto-fill listing data from raw text. Get intelligent suggestions on what to prioritize next. Like having a personal analyst who knows the entire business, works around the clock, and communicates with clients for you.

### 1.5 Co-Agent Matching Community (Coming Soon)

A community layer where agents can discover and co-deal with other agents. Details to be designed in a future phase. Not included in the initial build.

---

## 2. Data Model Overview

This section explains the core entities, their roles, and how they relate to each other. Refer to the full [Database Schema](#10-database-schema) for field-level detail.

### Entity Relationship Summary

```
Workspace
├── Users (team members with roles)
├── Contacts (people: buyers, sellers, referrers)
│   └── Deals (each deal = one journey through a pipeline)
│       ├── linked to a Listing (optional, mainly for sell-side)
│       ├── linked to a Pipeline Stage
│       └── has Comments & Activity Feed
├── Listings (properties being marketed)
│   ├── linked to a Project (for in-project properties)
│   ├── linked to a Seller Contact
│   ├── has Comments & Activity Feed
│   └── has Media (photos, files)
├── Projects (condominium/development database)
├── Pipeline Stages (customizable per buyer/seller flow)
├── Potential Configs (tier settings: A/B/C/D)
├── Stage Action Playbooks (suggested actions per stage)
├── Saved Filters
├── Custom Fields & Tags
├── Website Pages & Sections
├── AI Reports & Query Logs
└── Notifications
```

### Key Relationships

| Relationship | Description |
|---|---|
| Contact → Deals | One Contact can have many Deals. A seller might have 3 listings each with its own sell-side Deal. A buyer might be pursuing 2 properties simultaneously. |
| Deal → Listing | A Deal may reference a specific Listing (especially sell-side). Buy-side Deals may not link to a single Listing until later stages. |
| Deal → Pipeline Stage | Every Deal sits in exactly one Pipeline Stage at a time. Stage history is tracked over time. |
| Listing → Project | In-project listings look up shared data (zone, BTS/MRT, Google Maps link, property type) from the Project table to avoid redundant entry. |
| Listing → Seller Contact | Every listing links to a seller via the Contact table. |
| Contact → Contact (Referral) | A Contact can reference another Contact as their referrer. |
| Listing ↔ Contact (Smart Match) | Buyer Contacts with requirements (budget, zone, size, etc.) are matched against Listings. Matches are stored in a dedicated junction table with match score. |

### The "Lead" Concept — Explained

There is no separate Lead entity. Here is how common "lead" scenarios map to the data model:

| Scenario | What happens in ECHO |
|---|---|
| Someone inquires via LINE about a condo | Create a **Contact** + create a **Deal** (auto-placed in the first pipeline stage). |
| An unqualified contact — just captured a name and number | Create a **Contact** only. No Deal yet. Contact Status = "Unqualified" or "New." |
| A lead progresses from inquiry to showing to negotiation | The **Deal** moves through pipeline stages. Each stage change is tracked with a timestamp. |
| A lead goes cold | The **Deal** status is set to "On Hold" or "Closed Lost" with a reason. The Contact remains for future reactivation. |
| A past client comes back to buy another property | A new **Deal** is created for the same **Contact**. Full history of previous Deals remains accessible. |

---

## 3. Global Functions & Features

These features apply across the entire platform, not to any single module.

### 3.1 Authentication & Access

- User authentication (email + password)
- Social login (Google)
- Two-factor authentication (2FA)
- Session management
- Team collaboration with role-based access: Owner, Admin, Co-Worker, Listing Support

### 3.2 Workspace & Account Management

- Workspace settings (name, branding, preferences)
- Multi-workspace support (one user can belong to or switch between workspaces)
- Workspace branding (logo, primary color — inherited by the website builder)
- Business profile

### 3.3 Notification System

- In-app notification center
- Email notifications
- LINE Notify integration
- Notification preference settings (per user: which notification types, which channels)

### 3.4 Search & Navigation

- Global search across listings, contacts, deals, and projects

### 3.5 Data Management

- Import from Excel/CSV
- Export to Excel/CSV
- Export to PDF
- Data backup
- Archived records (soft delete pattern used across all major entities)
- Audit log (tracks changes across all entities — who changed what, when, old value vs. new value)

### 3.6 Customization & Configuration

- Custom fields management (agents can add their own fields to Listings, Contacts, and Deals)
- Custom tags management (centralized tag system reusable across modules)
- Column configuration memory (table column order, visibility, and width remembered per user)
- Dark mode
- Language settings

### 3.7 File & Media Management

- Centralized media library (all photos and files in one browsable location)
- Watermark generation on photos
- Storage usage dashboard

### 3.8 Integration & API

- LINE Notify setup wizard
- LINE Official Account integration
- Email integration
- Webhook support
- API access
- Property portal integration — e.g., Ddproperty, Livinginsider (Coming Soon)

### 3.9 Mobile Experience

- Mobile-responsive web app

### 3.10 Onboarding & Support

- Interactive onboarding tours
- In-app help center
- Changelog and update announcements
- Feedback button

### 3.11 Security & Compliance

- Data encryption (at rest and in transit)
- PDPA compliance
- IP restriction (optional workspace-level setting)
- Login activity log

---

## 4. Module: Listing Management Platform

The central workspace for managing property listings. Presented as a table/spreadsheet view with inline editing.

### 4.1 Core Table Features

- **Inline editing** — Edit listing fields directly in the table without opening a detail view.
- **Customizable columns and rows** — Show, hide, resize, and reorder columns. Configuration is remembered per user.
- **Group by** — Group listings by Potential Tier, Status, or Project.
- **Filter / Saved Filter** — Filter by any field or combination. Save frequently used filters. Share filters with the team.
- **Potential Tier selection** — Assign A, B, C, or D tier to each listing. Tiers are configurable per workspace (label, color, reminder interval) via the Potential Config system.

### 4.2 Quick-Create Shortcuts

- Create a new Seller Contact directly from the listing table (without navigating to CRM).
- Create a new Project directly from the listing table (without navigating to the Project module).

### 4.3 Listing Visibility & Flagging

- **Website Visible toggle** — Active/Inactive. Controls whether the listing appears on the agent's public website.
- **Featured Listing flag** — Marks listings for prominent display on the website homepage.
- **Focus Listing flag** — Internal flag for the agent's personal prioritization. Not visible to clients.
- **Exclusive Listing flag** — Indicates an exclusive agreement is in place. Links to the Exclusive Agreement record.
- **Missing Details / Photo flag** — Automatic indicator when a listing has incomplete data or no photos uploaded.

### 4.4 Status & Timeline Tracking

- **Listing Status** — Configurable statuses (e.g., New, Active, Reserved, Sold, Expired, Withdrawn). Status changes trigger a confirmation dialog before saving.
- **Listing Status Timeline** — Tracks every status change with timestamps. Shows how long a listing spent in each status (e.g., 45 days from Active to Sold).
- **Days on Market** — Auto-calculated from the date the listing was set to Active.
- **Price History Tracking** — Every change to Asking Price or Rental Price is logged with timestamp, old value, and new value.

### 4.5 Reminders & Suggested Actions

- **Action Reminder** — Configurable per Potential Tier. Example: Tier A listings trigger a reminder every 7 days, Tier B every 30 days. Reminder intervals are set in workspace settings.
- **Suggested Action** — Configurable per Pipeline Stage. When a follow-up interval is reached, the system suggests a specific action (e.g., "Call seller for price review"). Actions are defined in the Stage Action Playbook.

> **Note:** The Action Reminder and Suggested Action systems are shared engines used by both the Listing module and the CRM module. They are configured once in workspace settings and serve both modules via the Potential Config and Stage Action Playbook tables.

### 4.6 Media Management

- **Bulk photo upload** — Drag and drop multiple photos at once.
- **Drag and drop photo ordering** — Reorder photos by dragging them. First photo becomes the cover image.

### 4.7 Collaboration & Comments

Each listing has a detail/comment page (similar to a Notion page) with the following capabilities:

- **Comments** — Team members can leave comments on any listing.
- **@Mention** — Mention another user in a comment. The mentioned user receives a notification and can see listing data according to their role-based access level.
- **Tag a Buyer Contact** — Link a buyer contact to the listing within a comment for context.
- **Add Pipeline Stage note** — Record pipeline-stage-related updates directly in the listing's comment section, creating a cross-module reference.
- **Activity Feed** — A chronological log of everything that has happened on this listing: status changes, field edits, comments, pipeline events, and more.

### 4.8 Cross-Module Insights

- **Linked Deal Counter** — Displays the number of active buy-side Deals where the buyer's requirements match this listing's attributes. Clicking shows the matched buyers.
- **Pipeline Stage Count** — Shows a summary of buyer-side activity related to this listing. Example: "3 Units Sent, 2 Showings, 1 Negotiation." Tracked from Deal pipeline stage data.

### 4.9 Automation & Efficiency

- **Auto-generated Listing Copy** — Generate marketing copy from a template using listing fields (property type, size, price, zone, features, etc.).
- **Auto-fill from Project Database** — When a listing is associated with a known Project, shared fields (zone, BTS/MRT, Google Maps link, property type, etc.) are automatically populated.

### 4.10 Reporting & Lifecycle

- **Listing Performance Report** — Per-listing analytics (days on market, price changes, inquiry count, pipeline activity).
- **Archive instead of delete** — Listings are never hard-deleted. Archive moves them out of active view while preserving all history and data.

### 4.11 Team Access

- Role-based access: Owner, Admin, Co-Worker, Listing Support. (Specific read/write/delete permissions and data visibility limits, such as restricting access to agreements, will be fully defined and enforced in a later phase once all modules are complete.)

---

## 5. Module: CRM

The CRM manages all people (Contacts) and their journeys (Deals). It is presented as a table view with tabs to switch between Buyer and Seller pipelines.

### 5.1 Core Data Model

- **Contact** = a person. Can be a Buyer, Seller, Both, or Referrer. Permanent record reusable across transactions.
- **Deal** = a journey. Tracks one contact's progression through a pipeline toward a transaction. One contact can have multiple simultaneous or sequential Deals.
- **Adding a new "Lead"** = Creating a Contact + Creating a Deal in the first pipeline stage. Both records are created together in one action.

### 5.2 Core Table Features

- Switch between **Buyer** and **Seller** tabs to manage each pipeline separately.
- Customizable columns and rows.
- Group by Potential Tier, Deal Status, or Pipeline Stage.
- Filter / Saved Filter with sharing support.
- Potential Tier selection (A, B, C, D) — configurable per workspace.

### 5.3 Contact Details

- Full contact information: name, nickname, phone (primary/secondary), LINE ID, email, nationality, ID card/passport (optional).
- Contact Source tracking: LINE, Website, Referral, Facebook, Walk-in, Cold Call.
- Referral chain: "Referred By" links to another Contact.
- Assigned agent.
- **Contact Details Completeness Score** — Visual indicator of how complete a contact's profile is. Encourages agents to capture all relevant data.

### 5.4 Buyer Requirements (on Deal, not Contact)

Buyer requirements live on the **Deal** record, not on the Contact. A single contact can have multiple simultaneous buy-side deals, each with different requirements (e.g., one deal for a condo investment, another for a family home). Dedicated fields for capturing buyer requirements — not free-text guesswork:

- Budget (min/max)
- Preferred zones (multi-select, linked to Zone table)
- Preferred property type (multi-select)
- Preferred bedrooms, size range (sqm), floor range
- Preferred facilities (multi-select)
- Pet owner (boolean)
- EV car owner (boolean)
- Parking slots needed
- Pain points (free text)
- Special requirements (free text)
- Timeline (Immediate, 1–3 months, 3–6 months, 6+ months)
- Purpose of purchase (Own use, Investment, Both)
- Financing method (Cash, Mortgage, Mixed)
- Pre-approved amount and expiry date

### 5.5 Pipeline & Deal Management

- **Customizable Pipeline Stages** — Fully editable per workspace, separately for Buyer and Seller pipelines. Rename, reorder, add, or remove stages anytime.
- **Pipeline Stage History & Timeline** — Every stage change is logged with a timestamp. Shows how long a deal spent in each stage.
- **Deal Value Tracking** — Estimated deal value, commission rate, estimated commission.
- **Closed Lost Reason** — Required field when a deal is marked as Closed Lost. Enables analysis of why deals fail.

### 5.6 Reminders & Suggested Actions

- **Action Reminder** — Same shared system as Listings. Configurable per Potential Tier.
- **Suggested Action** — Same shared system as Listings. Configurable per Pipeline Stage via the Stage Action Playbook.

### 5.7 Collaboration & Comments

Each Deal has a detail/comment page with the same capabilities as Listings:

- Comments with rich text.
- @Mention other users (with role-based visibility).
- Tag a Listing within a comment for context.
- Activity Feed — chronological log of all deal events.

### 5.8 Data Quality & Automation

- **Duplicate Contact Detection** — Triggers when creating a new contact if a matching phone number, email, or name + phone combination already exists. Prompts the agent to merge or proceed.
- **Deal auto-naming** — Deals are auto-named using a convention (e.g., "Somchai — Ideo Q Siam — Sell") but can be manually overridden.

### 5.9 Team Access

- Role-based access: Owner, Admin, Co-Worker, Listing Support. Same permission model as Listings.

---

## 6. Module: Website Builder

A drag-and-drop website builder that lets agents launch a professional real estate website. The website automatically syncs with the Listing Management Platform — what's active in the dashboard appears live on the site.

### 6.1 Pages

| Page | Description |
|---|---|
| **Homepage** | Hero section, featured listings grid, about summary, call-to-action. Featured listings are pulled automatically from listings flagged as "Featured" in the dashboard. |
| **Listing Search** | Filterable listing grid. Visitors can filter by zone, price range, bedrooms, property type, and listing type (sell/rent). Includes a map-based search view. |
| **Listing Detail** | Individual listing page with photo gallery, property details, pricing, floor plan, location map, and an inquiry form or LINE button. |
| **About Us / Team** | Agency or agent profile, team member bios, credentials, service areas. |
| **Blog** | Content pages for SEO, market updates, and client education. Supports rich text, images, and categories. |
| **Contact** | Contact form and/or LINE inquiry button. Form submissions are captured and optionally auto-create a Contact + Deal in the CRM. |

### 6.2 Builder Features

- **Drag-and-drop section arrangement** — Rearrange sections within any page without code.
- **Pre-built section templates** — Hero banners, listing grids, testimonials, stats counters, team cards, call-to-action blocks, etc.
- **Branding inheritance** — Logo, primary color, and fonts are pulled from workspace settings for consistent branding.
- **Custom domain support** — Agents can connect their own domain name.
- **SEO settings** — Meta titles, descriptions, and Open Graph images per page.
- **Responsive design** — All pages are mobile-optimized by default.

### 6.3 Listing Sync

- Listings with "Website Visible = Active" automatically appear on the website.
- Featured flag determines which listings appear in the homepage featured grid.
- Listing order on the website reflects the order or sort configured in the dashboard.
- Changes in the dashboard (price update, status change, new photos) are reflected on the website in real time.

### 6.4 Lead Capture

- Inquiry forms on listing detail and contact pages.
- Form submissions captured in a **Form Submission Table** with timestamp, source page, and visitor details.
- Optional auto-creation of a Contact + Deal from a form submission.
- LINE inquiry button — opens a LINE chat with the agent or LINE Official Account.

---

## 7. Module: AI

AI capabilities embedded throughout the platform, accessible primarily via a conversational chat interface.

### 7.1 RAG Chatbot

A conversational AI assistant with full access to the agent's workspace data — listings, contacts, deals, projects, pipeline history, and pricing data.

**Example queries an agent might ask:**
- "How many active listings do I have in the Sukhumvit zone?"
- "Which deals haven't been followed up in 30 days?"
- "What's the average asking price per sqm for Ideo Q Siam?"
- "Show me all buyer contacts looking for 2-bedroom condos under 5M in Thonglor."
- "What's the commission forecast for this quarter based on active deals?"

The chatbot queries workspace data using retrieval-augmented generation (RAG) and returns answers with source references (e.g., which listings or contacts the data came from).

### 7.2 Marketing Report Generator

Generate professional marketing reports for sellers, ready to send via email or LINE.

- **Configurable fields and stats** — Agents select which data points to include in the report (e.g., listing views, inquiry count, days on market, price comparison, comparable listings).
- Output as PDF.
- Deliver directly via email or LINE Notify from within the platform.

### 7.3 Listing Comparison Report

Generate side-by-side comparison reports for buyers.

- Compare selected listings on key attributes: price, size, floor, view, facilities, distance to station, maintenance fees.
- Output as PDF.
- Deliver via email or LINE Notify.

### 7.4 Data Input Autofill

Eliminate manual data entry for new listings.

- Agent copies the entire raw listing description from an original post (e.g., from a seller's LINE message, a Facebook post, or a portal listing).
- Pastes it into the AI chat section.
- Clicks the **Autofill** tool.
- AI parses the unstructured text and maps it to the corresponding listing fields (property type, size, bedrooms, price, zone, floor, etc.).
- Agent reviews the mapped data and confirms or adjusts before saving.

### 7.5 AI Agent Assistant

Proactive intelligence that suggests what the agent should focus on next.

- Analyzes current records across listings and deals.
- Suggests prioritized actions such as:
  - "You have 5 listings with no activity in 14+ days — consider refreshing photos or adjusting price."
  - "3 buyer deals are stuck in the Showing stage for over 2 weeks — follow up to move forward or close."
  - "Listing X has high inquiry volume but no showings — the price-to-interest ratio suggests it's well-priced. Prioritize converting inquiries to appointments."
- Suggestions are surfaced in the dashboard and/or the AI chat interface.
- Designed to help agents become more productive by focusing on what matters most.

---

## 8. Module: Dashboard

The analytics and reporting hub. Dashboard design will be finalized in a future iteration to ensure it is effective, user-friendly, and maximally useful.

### 8.1 Planned Report Categories

| Report | Description |
|---|---|
| **Listings Report** | Aggregate metrics about the listing portfolio. Metrics TBD. |
| **Marketing Report** | Performance of marketing efforts across listings. Metrics TBD. |
| **Deals Report** | Pipeline health, deal progression, and revenue metrics. Metrics TBD. |
| **Action & Performance Report** | Agent productivity and follow-up compliance. Metrics TBD. |

### 8.2 Design Principles

- All report data will be derived from existing tables (Listings, Deals, Contacts, Pipeline Stages, Activity Logs, etc.).
- Dashboard will be designed for at-a-glance insight — key numbers, trend charts, and actionable highlights.
- Filterable by date range, agent, zone, and other relevant dimensions.
- Detailed dashboard specifications will be added prior to the implementation phase for this module.

---

## 9. Module: Co-Agent Matching Community (Coming Soon)

A future community feature enabling agents to discover and collaborate with other agents for co-deal opportunities.

- **Status:** Concept stage. Not included in initial build phases.
- **Rough vision:** A community layer where agents can list properties they need a buyer for (or buyers they need a property for) and match with other agents in the ECHO ecosystem.
- Full feature specification and schema will be developed when this module enters planning.

---

## 10. Database Schema

> **Enum casing convention:** All enum values in the Prisma schema and Supabase database use **UPPER_CASE** (e.g., `OWNER`, `ADMIN`, `CO_WORKER`, `LISTING_SUPPORT`, `BUYER`, `SELLER`, `PENDING`). Frontend code must match this casing when inserting or filtering.

### 10.1 Workspace Table

| Field | Type | Notes |
|---|---|---|
| Workspace ID | PK | |
| Workspace Name | String | Agency or agent name |
| Plan Tier | Enum | Free, Solo, Team, Agency |
| Industry | String | Real Estate (for future multi-vertical expansion) |
| Logo URL | String | |
| Primary Color | String | Hex code, inherited by website builder |
| LINE Notify Token | String | For LINE integration |
| Created At | Timestamp | |
| Subscription Status | Enum | |
| Subscription Renewed At | Timestamp | |

### 10.2 User Table

| Field | Type | Notes |
|---|---|---|
| User ID | PK | |
| Workspace ID | FK → Workspace | |
| First Name | String | |
| Last Name | String | |
| Email | String | |
| Phone | String | |
| LINE ID | String | |
| Role | Enum | Owner, Admin, Co-Worker, Listing Support |
| Profile Photo URL | String | |
| Is Active | Boolean | |
| Last Login At | Timestamp | |
| Created At | Timestamp | |

### 10.3 Contact Table

| Field | Type | Notes |
|---|---|---|
| Contact ID | PK | |
| Workspace ID | FK → Workspace | |
| Contact Type | Multi-value | Buyer, Seller, Both, Referrer |
| First Name | String | |
| Last Name | String | |
| Nickname | String | Important for the Thai market |
| Phone (Primary) | String | |
| Phone (Secondary) | String | |
| LINE ID | String | |
| Email | String | |
| Nationality | String | |
| ID Card / Passport No. | String | Optional — for serious buyers/sellers |
| Contact Source | Enum | LINE, Website, Referral, Facebook, Walk-in, Cold Call |
| Referred By | FK → Contact | Who introduced this person |
| Assigned To | FK → User | |
| Potential Tier | Enum | A, B, C, D |
| Contact Status | Enum | Active, On Hold, Closed Won, Closed Lost, Unqualified, Reactivate |
| Tags | Multi-value | Linked to Tag table |
| Notes | Text | General notes |
| Last Contacted At | Timestamp | |
| Last Action Date | Timestamp | |
| Action Reminder Interval | Number | Days — per contact level |
| Reactivate On | Date | For leads marked for future follow-up |
| Archived | Boolean | |
| Created At | Timestamp | |
| Created By | FK → User | |
| Last Updated At | Timestamp | |
| Last Updated By | FK → User | |

### 10.4 Listing Table

| Field | Type | Notes |
|---|---|---|
| Listing ID | PK | |
| Workspace ID | FK → Workspace | |
| Listing Name | String | |
| Project ID | FK → Project | Nullable — only for in-project listings |
| Project Name | String | Lookup from Project if linked |
| In-Project | Boolean | In-project vs. standalone |
| Property Type | Enum | House, Condo, Townhouse, Land, etc. Lookup from Project if in-project |
| Listing Type | Enum | Sell, Rent, Sell & Rent |
| Listing Grade | Enum | A, B, C, D (potential tier for the listing itself) |
| Listing Status | Enum | New, Active, Reserved, Sold, Expired, Withdrawn |
| Exclusive Agreement | Boolean | |
| Seller Contact ID | FK → Contact | |
| Seller Phone | String | Lookup from Contact |
| Seller LINE | String | Lookup from Contact |
| Street / Soi | String | |
| Zone | String | Lookup from Project if in-project |
| BTS | String | Lookup from Project if in-project |
| MRT | String | Lookup from Project if in-project |
| Unit No. | String | |
| Bedrooms | Number | |
| Bathrooms | Number | |
| Size (Rai) | Number | |
| Size (Ngan) | Number | |
| Size (Wa) | Number | |
| Size (Sqm) | Number | |
| Floor | Number | If property type = condo |
| Stories | Number | If property type = house |
| Building | String | |
| View | String | |
| Direction | String | |
| Parking Slots | Number | |
| Maid's Room | Boolean | |
| Unit Condition | String | |
| Asking Price | Number | |
| Price Remark | Text | |
| Rental Price | Number | |
| Rental Remark | Text | |
| Matching Tags | Multi-value | Linked to Tag table |
| Google Maps Link | String | Lookup from Project if in-project |
| Agreement File URL | String | |
| Unit Photos | Array | URLs |
| Media Files URL | Array | URLs |
| Ddproperty URL | String | |
| Livinginsider URL | String | |
| Propertyhub URL | String | |
| Facebook Group URL | String | |
| Facebook Page URL | String | |
| TikTok URL | String | |
| Instagram URL | String | |
| YouTube URL | String | |
| Marketing Report | String | URL or reference |
| Commission Rate | Number | Percentage |
| Featured Flag | Boolean | Show on website homepage |
| Focus Flag | Boolean | Internal priority flag |
| Website Visible | Boolean | Active = shown on website |
| Days on Market | Number | Auto-calculated |
| Asking Price History | JSON | Array of {price, date, changed_by} |
| Listing Status Changed At | Timestamp | |
| Last Action Date | Timestamp | |
| Archived | Boolean | |
| Created By | FK → User | |
| Created At | Timestamp | |
| Last Updated By | FK → User | |
| Last Updated At | Timestamp | |

### 10.5 Listing Update Table (Change Log)

| Field | Type | Notes |
|---|---|---|
| Listing Update ID | PK | |
| Listing ID | FK → Listing | |
| Status | String | Status at time of update |
| Field Changed | String | Which field was edited |
| Old Value | Text | |
| New Value | Text | |
| Updated At | Timestamp | |
| Updated By | FK → User | |

### 10.6 Project Table (Condominium / Development)

| Field | Type | Notes |
|---|---|---|
| Project ID | PK | |
| Workspace ID | FK → Workspace | |
| Project Name (Thai) | String | |
| Project Name (English) | String | |
| Property Type | Enum | |
| Zone | String | FK → Zone |
| BTS | String | |
| MRT | String | |
| Matching Tags | Multi-value | |
| Developer | String | |
| Year Built | Number | |
| Number of Buildings | Number | |
| Number of Floors | Number | |
| Number of Units | Number | |
| Parking Slot Ratio | String | |
| Parking Slot Trade Allow | Boolean | Can purchase additional parking |
| Facilities | Multi-value | |
| Maintenance Fee | Number | |
| Maintenance Fee Payment Terms | String | |
| Maintenance Fee Collection Ratio | String | |
| Juristic Company | String | |
| Avg Sale Price / Sqm | Number | |
| Avg Rental Price / Sqm | Number | |
| Unit Types | Multi-value | |
| Floor to Ceiling Height | Number | |
| Max Units per Floor | Number | |
| Project Segment | String | |
| Comparable Projects | Multi-value | Same-grade comparison |
| Best View | String | |
| Best Direction | String | |
| Best Unit Position | String | |
| Household Nationality & Ratio | Text | |
| Nearest Station Type | String | BTS or MRT |
| Nearest Station Distance | String | |
| Nearest Station Transport | String | Recommended transportation |
| Target Customer Group | Text | |
| Strengths | Text | |
| Weaknesses | Text | |
| Google Maps Link | String | |
| Created At | Timestamp | |
| Created By | FK → User | |
| Last Updated At | Timestamp | |
| Last Updated By | FK → User | |

### 10.7 Zone Table

| Field | Type | Notes |
|---|---|---|
| Zone ID | PK | |
| Zone Name (English) | String | |
| Zone Name (Thai) | String | |

### 10.8 Deal Table

| Field | Type | Notes |
|---|---|---|
| Deal ID | PK | |
| Workspace ID | FK → Workspace | |
| Deal Name | String | Auto-generated or manual (e.g., "Somchai — Ideo Q Siam — Sell") |
| Deal Type | Enum | Buy-side, Sell-side |
| Buyer Contact ID | FK → Contact | |
| Seller Contact ID | FK → Contact | |
| Listing ID | FK → Listing | Optional — especially for buy-side deals in early stages |
| Pipeline Stage ID | FK → Pipeline Stage | |
| Deal Status | Enum | Active, On Hold, Closed Won, Closed Lost |
| Closed Lost Reason | String | Required when status = Closed Lost |
| Lead Source | Enum | LINE, Website, Referral, Facebook, Walk-in, Cold Call — source of this specific deal |
| Estimated Deal Value | Number | |
| Commission Rate | Number | |
| Estimated Commission | Number | |
| Notes | Text | |
| Assigned To | FK → User | |
| Last Action Date | Timestamp | |
| Archived | Boolean | |
| Created At | Timestamp | |
| Created By | FK → User | |
| Last Updated At | Timestamp | |
| Last Updated By | FK → User | |

#### Buyer Requirements (on buy-side Deals)

| Field | Type | Notes |
|---|---|---|
| Budget Min | Number | |
| Budget Max | Number | |
| Preferred Zones | Multi-value | FK → Zone |
| Preferred Property Type | Multi-value | |
| Preferred Bedrooms | Number | Minimum |
| Preferred Size Min | Number | sqm |
| Preferred Size Max | Number | sqm |
| Preferred Floor Min | Number | |
| Preferred Floor Max | Number | |
| Preferred Facilities | Multi-value | |
| Pet | Boolean | Has pets |
| EV Car | Boolean | Has EV |
| Parking Slots Needed | Number | |
| Pain Points | Text | Qualitative notes |
| Special Requirements | Text | |
| Timeline | Enum | Immediate, 1–3 months, 3–6 months, 6+ months |
| Purpose of Purchase | Enum | Own use, Investment, Both |
| Financing Method | Enum | Cash, Mortgage, Mixed |
| Pre-approved Amount | Number | If mortgage buyer |
| Pre-approval Expiry Date | Date | |

### 10.9 Pipeline Stage Table

| Field | Type | Notes |
|---|---|---|
| Pipeline Stage ID | PK | |
| Workspace ID | FK → Workspace | |
| Pipeline Stage Name | String | |
| Pipeline Type | Enum | Buyer, Seller |
| Stage Order | Number | Display sequence |
| Stage Color | String | Hex code |
| Stage Description | Text | |
| Is Default | Boolean | |
| Is Active | Boolean | |
| Created By | FK → User | |
| Created At | Timestamp | |
| Updated At | Timestamp | |

### 10.10 Pipeline Stage History Table (New)

| Field | Type | Notes |
|---|---|---|
| History ID | PK | |
| Deal ID | FK → Deal | |
| From Stage ID | FK → Pipeline Stage | Nullable for first stage |
| To Stage ID | FK → Pipeline Stage | |
| Changed By | FK → User | |
| Changed At | Timestamp | |
| Time in Previous Stage | Number | Duration in days |

### 10.11 Comment Table

| Field | Type | Notes |
|---|---|---|
| Comment ID | PK | |
| Entity Type | Enum | Listing, Deal |
| Entity ID | String | ID of the listing or deal |
| Author User ID | FK → User | |
| Content | Rich Text | |
| Mentions | Array | User IDs mentioned |
| Tagged Listing ID | FK → Listing | Optional — if a listing was tagged |
| Tagged Contact ID | FK → Contact | Optional — if a contact was tagged |
| Created At | Timestamp | |
| Edited At | Timestamp | |
| Is Deleted | Boolean | Soft delete |

### 10.12 Activity Log Table (New)

| Field | Type | Notes |
|---|---|---|
| Activity ID | PK | |
| Workspace ID | FK → Workspace | |
| Entity Type | Enum | Listing, Deal, Contact |
| Entity ID | String | |
| Action Type | Enum | Created, Updated, Status Changed, Stage Changed, Comment Added, Mention, Photo Uploaded, etc. |
| Actor User ID | FK → User | |
| Description | Text | Human-readable description |
| Metadata | JSON | Additional context (e.g., old/new values) |
| Created At | Timestamp | |

### 10.13 Notification Table

| Field | Type | Notes |
|---|---|---|
| Notification ID | PK | |
| Workspace ID | FK → Workspace | |
| User ID | FK → User | Who receives this |
| Type | Enum | Action Reminder, Listing Expiry, Stage Change, Mention, Smart Match |
| Entity Type | Enum | Listing, Deal, Contact |
| Entity ID | String | |
| Message | Text | |
| Is Read | Boolean | |
| Created At | Timestamp | |
| Read At | Timestamp | |

### 10.14 Potential Config Table

| Field | Type | Notes |
|---|---|---|
| Potential ID | PK | |
| Workspace ID | FK → Workspace | |
| Module | Enum | Listings, Buyer CRM, Seller CRM |
| Potential Label | String | A, B, C, D (or custom) |
| Potential Name | String | Hot, Warm, Cold, etc. (optional display name) |
| Color | String | Hex code |
| Reminder Interval | Number | Days |
| Reminder Type | Enum | Notification only, Notification + LINE, Notification + Email |
| Description | Text | What this tier means |
| Order | Number | Display sequence |
| Is Active | Boolean | |
| Created At | Timestamp | |
| Created By | FK → User | |
| Last Updated At | Timestamp | |
| Last Updated By | FK → User | |

### 10.15 Stage Action Playbook Table

| Field | Type | Notes |
|---|---|---|
| Playbook ID | PK | |
| Workspace ID | FK → Workspace | |
| Pipeline Type | Enum | Buyer, Seller |
| Pipeline Stage ID | FK → Pipeline Stage | |
| Action Type | Enum | Call, LINE Message, Email, Site Visit, Send Report, Send Listing, Schedule Viewing, Send Contract, Internal Note, Custom |
| Action Label | String | Agent's custom name for this action |
| Action Description | Text | Detailed instruction |
| Action Template | Text | Optional pre-filled message template |
| Reminder Override | Boolean | Override potential tier interval with stage-specific interval |
| Override Interval Days | Number | If override = true |
| Order | Number | Sequence if multiple actions per stage |
| Is Required | Boolean | Must complete before moving to next stage |
| Is Active | Boolean | |
| Created At | Timestamp | |
| Created By | FK → User | |
| Last Updated At | Timestamp | |
| Last Updated By | FK → User | |

### 10.16 Saved Filter Table

| Field | Type | Notes |
|---|---|---|
| Filter ID | PK | |
| Workspace ID | FK → Workspace | |
| User ID | FK → User | Creator |
| Module | Enum | Listings, CRM |
| Filter Name | String | |
| Filter Config | JSON | All filter parameters |
| Is Shared | Boolean | Visible to whole team or just creator |
| Created At | Timestamp | |

### 10.17 Exclusive Agreement Table

| Field | Type | Notes |
|---|---|---|
| Agreement ID | PK | |
| Listing ID | FK → Listing | |
| Seller Contact ID | FK → Contact | |
| Assigned Agent ID | FK → User | |
| Start Date | Date | |
| End Date | Date | |
| Commission Rate | Number | Agreed percentage |
| Commission Type | Enum | Percentage, Fixed Fee |
| Fixed Fee Amount | Number | If commission type = Fixed Fee |
| Agreement Status | Enum | Active, Expired, Renewed, Cancelled |
| Renewal Count | Number | |
| Previous Agreement ID | FK → Exclusive Agreement | Self-referencing for renewals |
| Agreement File URL | String | Signed document |
| Notes | Text | Special terms |
| Reminder Days Before | Number | Days before expiry to trigger reminder |
| Created At | Timestamp | |
| Created By | FK → User | |
| Last Updated At | Timestamp | |
| Last Updated By | FK → User | |

### 10.18 Listing-Contact Match Table (New)

| Field | Type | Notes |
|---|---|---|
| Match ID | PK | |
| Listing ID | FK → Listing | |
| Deal ID | FK → Deal | Buy-side deal (buyer requirements are on Deal) |
| Match Score | Number | Percentage or points-based score |
| Matched Fields | JSON | Which requirement fields matched (zone, budget, size, etc.) |
| Match Status | Enum | New, Sent, Viewed, Interested, Not Interested |
| Matched At | Timestamp | |
| Last Updated At | Timestamp | |

### 10.19 Media Table (New)

| Field | Type | Notes |
|---|---|---|
| Media ID | PK | |
| Workspace ID | FK → Workspace | |
| File URL | String | |
| File Name | String | |
| File Type | Enum | Image, Document, Video |
| File Size | Number | Bytes |
| Entity Type | Enum | Listing, Contact, Project, Website, General |
| Entity ID | String | Optional — linked entity |
| Display Order | Number | For ordered galleries |
| Watermarked URL | String | Auto-generated watermarked version |
| Uploaded By | FK → User | |
| Uploaded At | Timestamp | |

### 10.20 Custom Field Definition Table (New)

| Field | Type | Notes |
|---|---|---|
| Field ID | PK | |
| Workspace ID | FK → Workspace | |
| Module | Enum | Listings, Contacts, Deals |
| Field Name | String | |
| Field Type | Enum | Text, Number, Date, Dropdown, Multi-select, Boolean, URL |
| Dropdown Options | JSON | If field type = Dropdown or Multi-select |
| Is Required | Boolean | |
| Display Order | Number | |
| Is Active | Boolean | |
| Created At | Timestamp | |
| Created By | FK → User | |

### 10.21 Custom Field Value Table (New)

| Field | Type | Notes |
|---|---|---|
| Value ID | PK | |
| Field ID | FK → Custom Field Definition | |
| Entity Type | Enum | Listing, Contact, Deal |
| Entity ID | String | |
| Value | Text | Stored as text, parsed by field type |
| Updated At | Timestamp | |
| Updated By | FK → User | |

### 10.22 Tag Table (New)

| Field | Type | Notes |
|---|---|---|
| Tag ID | PK | |
| Workspace ID | FK → Workspace | |
| Tag Name | String | |
| Tag Color | String | Hex code |
| Created At | Timestamp | |
| Created By | FK → User | |

### 10.23 Audit Log Table (New)

| Field | Type | Notes |
|---|---|---|
| Log ID | PK | |
| Workspace ID | FK → Workspace | |
| Entity Type | Enum | Listing, Contact, Deal, Project, Pipeline Stage, User, Workspace, etc. |
| Entity ID | String | |
| Action | Enum | Create, Update, Delete, Archive, Restore, Login, Export |
| Field Changed | String | Nullable — for updates |
| Old Value | Text | |
| New Value | Text | |
| Actor User ID | FK → User | |
| IP Address | String | |
| Timestamp | Timestamp | |

### 10.24 Website Page Table (New)

| Field | Type | Notes |
|---|---|---|
| Page ID | PK | |
| Workspace ID | FK → Workspace | |
| Page Type | Enum | Homepage, Listing Search, Listing Detail, About, Blog, Contact, Custom |
| Page Title | String | |
| Slug | String | URL path |
| Meta Title | String | SEO |
| Meta Description | Text | SEO |
| OG Image URL | String | SEO / social sharing |
| Is Published | Boolean | |
| Display Order | Number | For navigation |
| Created At | Timestamp | |
| Updated At | Timestamp | |

### 10.25 Website Section Table (New)

| Field | Type | Notes |
|---|---|---|
| Section ID | PK | |
| Page ID | FK → Website Page | |
| Section Type | Enum | Hero, Listing Grid, Featured Listings, About, Team, Testimonials, Stats, CTA, Blog Feed, Contact Form, Custom HTML |
| Content Config | JSON | All section-specific settings (text, images, layout, filters, etc.) |
| Display Order | Number | Position on the page |
| Is Visible | Boolean | |
| Created At | Timestamp | |
| Updated At | Timestamp | |

### 10.26 Form Submission Table (New)

| Field | Type | Notes |
|---|---|---|
| Submission ID | PK | |
| Workspace ID | FK → Workspace | |
| Source Page ID | FK → Website Page | Which page the form was on |
| Source Listing ID | FK → Listing | Nullable — if submitted from a listing detail page |
| Name | String | |
| Phone | String | |
| Email | String | |
| LINE ID | String | |
| Message | Text | |
| Auto-Created Contact ID | FK → Contact | If auto-creation is enabled |
| Auto-Created Deal ID | FK → Deal | If auto-creation is enabled |
| Submitted At | Timestamp | |

### 10.27 Blog Post Table (New)

| Field | Type | Notes |
|---|---|---|
| Post ID | PK | |
| Workspace ID | FK → Workspace | |
| Title | String | |
| Slug | String | URL path |
| Content | Rich Text | |
| Cover Image URL | String | |
| Category | String | |
| Tags | Multi-value | |
| Meta Title | String | SEO |
| Meta Description | Text | SEO |
| Is Published | Boolean | |
| Published At | Timestamp | |
| Author User ID | FK → User | |
| Created At | Timestamp | |
| Updated At | Timestamp | |

### 10.28 AI Report Table (New)

| Field | Type | Notes |
|---|---|---|
| Report ID | PK | |
| Workspace ID | FK → Workspace | |
| Report Type | Enum | Marketing Report, Listing Comparison |
| Report Name | String | |
| Generated By | FK → User | |
| Config | JSON | Fields/stats selected, listings included, etc. |
| Output PDF URL | String | |
| Delivered Via | Enum | None, Email, LINE, Both |
| Delivered To | String | Recipient email or LINE ID |
| Delivered At | Timestamp | |
| Created At | Timestamp | |

### 10.29 AI Query Log Table (New)

| Field | Type | Notes |
|---|---|---|
| Query ID | PK | |
| Workspace ID | FK → Workspace | |
| User ID | FK → User | |
| Query Text | Text | The question asked |
| Response Text | Text | The AI's answer |
| Data Sources Referenced | JSON | Which entities/records were queried |
| Query Type | Enum | Conversational, Report Generation, Autofill, Agent Assistant |
| Created At | Timestamp | |

### 10.30 Workspace Invitation Table (New)

| Field | Type | Notes |
|---|---|---|
| Invitation ID | PK | |
| Workspace ID | FK → Workspace | |
| Email | String | Invited user's email |
| Role | Enum (UserRole) | ADMIN, CO_WORKER, LISTING_SUPPORT |
| Status | Enum (InvitationStatus) | PENDING, ACCEPTED, REVOKED |
| Invited At | Timestamp | Auto-set on creation |

---

*End of specification. This document will be expanded with Dashboard metrics, Co-Agent Community features, and implementation phases in subsequent iterations.*
