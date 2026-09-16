# Nol ke Nikah (Next.js)

Perencana pernikahan mobile-first untuk pasangan Indonesia yang bingung mulai dari mana.

## Stack
- Next.js 14 (App Router)
- Prisma + MySQL/PostgreSQL
- NextAuth (Credentials)
- Tailwind CSS

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Copy `.env.example` ke `.env` lalu isi `DATABASE_URL` dan `NEXTAUTH_SECRET`.

3. Generate Prisma client & jalankan migrasi awal
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. Jalankan dev server
   ```bash
   npm run dev
   ```

## Struktur Folder

```
app/
  api/auth/[...nextauth]/   -> NextAuth route handler
  onboarding/                -> Onboarding Wizard
  dashboard/                 -> Dashboard/Beranda
  roadmap/                   -> Roadmap/Timeline tugas per fase
  budget/                    -> Budget & Vendor Hub
lib/
  auth.ts                    -> Konfigurasi NextAuth
  prisma.ts                  -> Prisma client singleton
prisma/
  schema.prisma               -> Skema database (User, WeddingPlan, RoadmapTask, BudgetItem, Vendor, Document, CollaboratorInvite)
```

## Deploy
Rencana deploy ke home server OMV via Cloudflare Tunnel — ikuti pola yang sama dengan project adminapps-t3.
