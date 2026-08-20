# Learnify — Course Marketplace

A working Next.js implementation of the Learnify design — lavender/coral/sunshine
palette, Fredoka display type, rounded pill buttons and course cards, matching
the reference mockups.

## What's built
- [x] Landing page: hero, stat cards, course tabs (New/Recommended/Most popular)
      with pagination, CTA banner, subjects section — all live database data
- [x] `/courses` — full course grid with category filter
- [x] `/courses/[slug]` — course detail: instructor, reviews, working enrol button
- [x] `/subjects` and `/subjects/[slug]` — browse by category
- [x] Auth: email/password signup & login (NextAuth, bcrypt-hashed passwords)
- [x] `/dashboard` — enrolled courses with progress bars
- [x] 6 categories, 6 teachers, 12 seeded courses (matches the reference mockup content)

## Setup

```bash
npm install

cp .env.example .env
# DATABASE_URL: free Postgres from neon.tech or supabase.com
# NEXTAUTH_SECRET: run `openssl rand -base64 32` and paste the output

npx prisma db push
npm run prisma:generate
npm run seed

npm run dev
```

Visit `http://localhost:3000` → sign up → browse courses → enrol in one (free
or paid, no real payment is processed) → check `/dashboard`.

## Design tokens (already in tailwind.config.ts)
| Token | Hex | Use |
|---|---|---|
| `cream` | #F7F4EF | page card background |
| `ink` | #171717 | text, dark buttons |
| `lavender` | #B9A9F0 | outer page background, badges |
| `coral` | #F0603F | primary CTA |
| `sunshine` | #F3C548 | accent badges, CTA banner |

## Not yet built
- [ ] Course progress tracking (lessons/video content) — `Enrollment.progress`
      exists in the schema but nothing updates it yet
- [ ] Payment integration for paid courses (currently just marks as enrolled)
- [ ] Search/filter by level, price, duration
- [ ] Real course content pages (video/notes per course)
