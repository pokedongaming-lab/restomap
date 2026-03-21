# RestoMap

Restaurant Location Intelligence Platform — temukan lokasi terbaik untuk restoran barumu.

## Struktur

```
restomap/
├── apps/
│   ├── api/        → Fastify REST API (port 3001)
│   ├── web/        → Next.js web app (port 3000)
│   └── mobile/     → React Native / Expo app
└── packages/
    ├── common/     → Shared TypeScript types
    └── scoring/    → LocationScoringEngine (tested)
```

## Prerequisites

- Node.js 20+
- pnpm 9+ → `npm install -g pnpm`
- Docker Desktop (untuk PostgreSQL + Redis)

## Setup (5 langkah)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Copy environment variables
```bash
cp .env.example .env
```

### 3. Jalankan database & Redis
```bash
docker-compose up -d
```

### 4. Jalankan database migration
```bash
pnpm db:migrate
```

### 5. Jalankan semua apps
```bash
pnpm dev
```

Setelah itu:
- Web → http://localhost:3000
- API → http://localhost:3001
- API health check → http://localhost:3001/healthz

## Commands

```bash
pnpm dev          # Jalankan semua apps secara paralel
pnpm build        # Build semua apps
pnpm test         # Jalankan semua tests
pnpm typecheck    # TypeScript check semua packages
pnpm lint         # Lint semua packages
pnpm db:migrate   # Jalankan database migrations
pnpm db:studio    # Buka Prisma Studio (GUI database)
```

## Test

```bash
# Semua tests
pnpm test

# Hanya scoring engine
pnpm --filter @restomap/scoring test

# Watch mode
pnpm --filter @restomap/scoring test:watch
```

## API Endpoints

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | /healthz | Health check |
| POST | /auth/register | Register user baru |
| POST | /auth/login | Login |
| GET | /auth/me | Data user saat ini |
| POST | /scoring/calculate | Hitung skor lokasi |

## GitHub Issues

Semua pekerjaan ditrack di GitHub Issues dengan label:
- `afk` → bisa langsung dikerjakan
- `hitl` → butuh keputusan manusia dulu

Mulai dari issue **#7 Project scaffold** sudah selesai dengan repo ini!
Issue berikutnya yang bisa dikerjakan paralel: **#8 Auth** dan **#9 Peta**.
