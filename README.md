# 10th Standard LMS — Phase 1 Scaffold

Board selector → subject syllabus → topic (notes + video + quiz), backed by
Postgres/Prisma. One subject (SSC Mathematics Part 1) is fully seeded end-to-end
as a working demo; all other subjects exist as empty shells ready for content.

## Setup

```bash
npm install

# 1. Copy env template and fill in real values
cp .env.example .env
# DATABASE_URL: free Postgres from neon.tech or supabase.com (~1 min to get a connection string)
# NEXTAUTH_SECRET: run `openssl rand -base64 32` and paste the output

# 2. Push schema + generate client
npx prisma db push
npm run prisma:generate

# 3. Seed demo content
npm run seed

# 4. Run
npm run dev
```

Visit `http://localhost:3000` → **Sign up** (pick SSC or CBSE) → go to
**SSC → Mathematics Part 1 (Algebra) → Linear Equations in Two Variables** →
mark it complete and take the quiz → check **Dashboard** to see progress and
score saved against your account.

## What's built

**Phase 1 — Content structure**
- [x] Board selector (SSC / CBSE) landing page
- [x] Subject grid per board, chapter-wise syllabus checklist
- [x] Topic page: markdown notes, video embed slot, interactive quiz
- [x] Prisma schema for the full content hierarchy
- [x] Seed script pattern — copy the Maths Part 1 block to add real content per chapter

**Phase 2 — Auth & progress tracking**
- [x] Email/password auth (NextAuth, credentials provider, bcrypt-hashed passwords)
- [x] Signup collects board (SSC/CBSE) preference
- [x] "Mark as complete" per topic, persisted to `Progress`
- [x] Quiz scores persisted to `QuizAttempt` when logged in (works anonymously too, just not saved)
- [x] Dashboard: per-subject completion bar, 5 most recent quiz attempts

## Not yet built (Phase 3+, per the architecture doc)
- [ ] Google OAuth (schema already supports it via the `Account` model — just add the provider in `lib/auth.ts`)
- [ ] Admin CMS for publishing content without editing seed.ts
- [ ] Weak-topic flags / quiz score trends on the dashboard
- [ ] Content for remaining subjects/chapters (this is the bulk of the real work)

## Adding a new topic
Open `prisma/seed.ts`, copy the `chapter1` / `topic1` / `quiz1` block, change the
slugs, title, `notesMd`, and questions, then re-run `npm run seed` — it's
idempotent (upsert-based), safe to re-run anytime.
