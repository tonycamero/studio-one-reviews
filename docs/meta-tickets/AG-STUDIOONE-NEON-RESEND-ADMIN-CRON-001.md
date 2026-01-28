# META-TICKET v2 — AG EXECUTION

**ID:** AG-STUDIOONE-NEON-RESEND-ADMIN-CRON-001  
**Repo:** https://github.com/tonycamero/studio-one-reviews (currently empty)  
**Title:** Studio One Café — QR Giveaway + Optional Review + NeonDB + Resend + GM Control Panel + Weekly Reminder  
**Owner:** Tony Camero  
**Agent:** Antigravity (AG)  
**Status:** APPROVED FOR EXECUTION  
**Priority:** HIGH  
**Mode:** Deterministic MVP. One deployable app. No scope creep.

---

## 0) PRIME DIRECTIVE

Initialize this empty repo into a production-deployable web app that provides:
1) Public QR landing page: Giveaway email capture + optional Google review link (TOS-safe)
2) Neon Postgres persistence
3) GM/Admin control panel: pick winner + send winner email (Resend)
4) Weekly reminder email to GM: Monday 8:00am America/Los_Angeles (DST-safe)

---

## 1) HARD PROHIBITIONS (NON-NEGOTIABLE)

### Google Reviews compliance (MUST HOLD)
- ❌ No mention of rewards tied to leaving a review
- ❌ No verification of review completion
- ❌ No conditional logic based on review clicks
- ❌ No tracking/logging of review button clicks (no DB write, no analytics event)
- ✅ Review CTA must be visually separated and explicitly “Optional. Not required for giveaway entry.”

### Product scope limits
- ❌ No full RBAC / user management
- ❌ No CRM integrations
- ❌ No bulk emailing entrants
- ❌ No automated winner selection algorithm (GM picks manually)
- ❌ No dashboards beyond “entries list + choose winner + send email”
- ❌ No payments, no file uploads, no “rules builder”

---

## 2) STACK (DEFAULT — KEEP SIMPLE)

- Framework: **Next.js (App Router)**
- DB: **Neon Postgres** (`postgresql://neondb_owner:npg_1qX5jNKoOriw@ep-damp-bush-afc5mb1s-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`)
- DB access: **Drizzle** (preferred)
- Email: **Resend**
- Hosting: **Netlify** (using Netlify Scheduled Functions for cron)

Repo is empty, so AG must scaffold from scratch.

---

## 3) REQUIRED DELIVERABLES

1) Public page `/` (mobile-first)
2) Admin panel `/admin` with password login + session cookie
3) DB schema + migrations (SQL or ORM migrations committed)
4) Resend integration:
   - winner email (to winner)
   - weekly reminder email (to GM)
5) Scheduled reminder mechanism (Netlify Scheduled Functions)
6) README: env vars, Neon setup, Resend setup, Netlify deploy steps, QR URL format, weekly ops checklist

---

## 4) ROUTES / SURFACES (MINIMAL)

### Public
- `GET /` — Giveaway + Optional Review link

### Admin
- `GET /admin` — login or panel
- `POST /api/admin/login`
- `POST /api/admin/logout` (or GET; choose simplest)
- `GET /api/admin/entries?range=this_week`
- `POST /api/admin/winner/select`
- `POST /api/admin/winner/send`

### Cron
- `GET /api/cron/weekly-reminder` (secured)

No other pages/endpoints.

---

## 5) DATA MODEL (NEON POSTGRES)

### 5.1 `giveaway_entries`
- id uuid pk default gen_random_uuid()
- email text not null
- first_name text null
- source text null
- campaign text null
- consent_version text not null default 'v1'
- created_at timestamptz not null default now()

### 5.2 `giveaway_winners`
- id uuid pk default gen_random_uuid()
- entry_id uuid not null references giveaway_entries(id)
- week_start_date date not null   (computed in America/Los_Angeles, stored as date)
- selected_at timestamptz not null default now()
- winner_email_sent_at timestamptz null

Constraints:
- unique(week_start_date)   // one winner per week

### 5.3 `ops_reminders`
- id uuid pk default gen_random_uuid()
- week_start_date date not null
- reminder_sent_at timestamptz not null default now()

Constraints:
- unique(week_start_date)   // idempotency for reminders

---

## 6) PUBLIC PAGE REQUIREMENTS (IMPLEMENT EXACTLY)

Two clearly separated sections:

### Section A — Giveaway Entry (PRIMARY)
- Email (required)
- First name (optional)
- Checkbox required: “I agree to Giveaway Rules & Privacy Policy”
- Submit -> inline success state (no redirect)

Insert payload:
- email
- first_name
- source from query param `source` (optional)
- campaign from query param `campaign` (optional)
- consent_version = 'v1'

### Section B — Google Review (SECONDARY, OPTIONAL)
- Button: “Leave a Google Review”
- Opens `REVIEW_URL` in new tab
- Required microcopy adjacent:
  **“Optional. Not required for giveaway entry.”**

If `REVIEW_URL` missing/empty:
- Button disabled OR hidden (pick simplest + safe)
- Must not break page

---

## 7) ADMIN PANEL REQUIREMENTS (IMPLEMENT EXACTLY)

### Auth (minimal)
- Single shared password from env: `ADMIN_PASSWORD`
- Session cookie signed with `ADMIN_SESSION_SECRET`
- No OAuth. No magic links. No user accounts.

### Panel features
- Entries table (this week by default; week is Monday→Sunday in America/Los_Angeles):
  - created_at, email, first_name, source, campaign
- “Select Winner”:
  - GM selects an entry row -> marks as winner for current `week_start_date`
  - enforce unique(week_start_date) (handle DB error gracefully)
- “Send Winner Email”:
  - sends to winner email via Resend
  - logs `winner_email_sent_at`
  - Email must NOT reference Google Reviews

No edit/delete. No exports.

---

## 8) EMAILS (RESEND)

### Winner Email (to winner)
- Subject: “Studio One Café — Weekly Giveaway Winner”
- Body: congrats + redemption instructions placeholder
- Must not mention reviews.

### Weekly Reminder (to GM)
- Subject: “Reminder: Pick this week’s giveaway winner”
- Body includes link to `/admin` (constructed from `APP_BASE_URL`)
- Goal: remind GM to pick winner + send email

---

## 9) SCHEDULING (MONDAY 8AM PACIFIC, DST-SAFE)

### Scheduling (Netlify Scheduled Functions)
Netlify cron schedules are UTC-based. Scheduled functions will trigger the logic.

### Approach (MANDATED)
- Use a Netlify Scheduled Function (e.g., `src/functions/weekly-reminder.ts` or similar).
- Schedule: `0 16 * * 1` (Monday 16:00 UTC = 8:00 AM PST). Note: This might need adjustment for PDT, or the function logic itself can check local time for strictness.
- In handler:
  1) verify it is Monday and within the correct hour window in `America/Los_Angeles`.
  2) compute `week_start_date` (local Monday date).
  3) check `ops_reminders` for that `week_start_date`.
  4) if missing -> send reminder email -> insert `ops_reminders`.

### Security
- Require `CRON_SECRET` (header or query param). Reject if missing/wrong.

---

## 10) ENV VARS (REQUIRED)

- `DATABASE_URL` (Neon)
- `REVIEW_URL` (Google “Ask for reviews” link)
- `RESEND_API_KEY`
- `EMAIL_FROM` (verified sender)
- `GM_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `APP_BASE_URL` (e.g., https://<prod-domain>)
- `CRON_SECRET`

---

## 11) FILE / FOLDER EXPECTATIONS (CREATE THESE)

- `package.json` (Next.js app)
- `src/app/page.tsx` (public landing)
- `src/app/admin/page.tsx` (admin UI)
- `src/app/api/...` route handlers for endpoints
- `src/lib/db.ts` (Neon DB init)
- `src/lib/email.ts` (Resend client + senders)
- `src/lib/auth.ts` (admin cookie/session helpers)
- `drizzle/` + migrations
- `netlify.toml` with build and functions config

---

## 12) ACCEPTANCE CRITERIA (MUST PASS)

Public:
- [ ] Works via QR scan on iOS + Android
- [ ] Giveaway entry works without clicking review
- [ ] Review button works without entering giveaway
- [ ] Insert creates DB row
- [ ] Review microcopy visible: “Optional. Not required for giveaway entry.”
- [ ] No review click tracking

Admin:
- [ ] Login gate works (wrong password rejected)
- [ ] Entries list loads
- [ ] Winner can be selected (one per week)
- [ ] Winner email can be sent via Resend and logged

Cron:
- [ ] Weekly reminder function configured
- [ ] Reminder only sends Monday 8am PT (DST-safe via code check)
- [ ] Idempotent per week via `ops_reminders`

Docs:
- [ ] README includes: Neon setup, Resend setup, Netlify cron config, env vars, QR URL format

---

## 13) AG OUTPUT FORMAT (MANDATORY)

AG must return:
1) Files created/modified (paths)
2) Migration files (or SQL) + brief instructions to apply
3) `netlify.toml` config
4) README content
5) Proof checklist:
   - DB insert proof
   - Admin entries view proof
   - Winner select proof
   - Winner email send proof
   - Cron endpoint manual invocation proof + idempotency

No extras. No refactors. No “nice-to-haves”.
