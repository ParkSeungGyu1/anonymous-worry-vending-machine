# replit.md

## Overview

This is an **Anonymous Worry Vending Machine** (익명 고민 자판기) — a Korean-language web application where users can anonymously submit their worries and receive warm, encouraging messages ("cheers") from other users. The concept is styled like a vending machine: you "insert" a worry and "receive" comfort in return.

The app is a full-stack TypeScript project with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **Styling**: Tailwind CSS v4 (using `@tailwindcss/vite` plugin) with custom warm/cozy color theme (cream, coral, mint)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Animations**: Framer Motion for page transitions and interactions
- **Fonts**: Google Fonts — Gaegu (handwriting), Hi Melody (handwriting), Fredoka (rounded sans-serif)
- **Build Tool**: Vite
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Pages
- `/` — Home page with vending machine visual, onboarding flow, random worry button
- `/write` — Submit a new anonymous worry
- `/read/:id` — View a specific worry and its cheers, submit new cheers
- `/search` — Browse and search all worries

### Backend
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript (executed via `tsx` in dev)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Build**: esbuild bundles server for production into `dist/index.cjs`

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/worries` | List all worries (newest first) |
| GET | `/api/worries/random` | Get a random worry |
| GET | `/api/worries/:id` | Get a specific worry |
| POST | `/api/worries` | Create a new worry (body: `{ content, nickname }`) |
| GET | `/api/worries/:id/cheers` | Get cheers for a worry |
| POST | `/api/cheers` | Create a cheer (body: `{ worryId, content }`) |

### Database
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with `node-postgres` driver
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Generated via `drizzle-kit` into `./migrations/`
- **Schema Push**: `npm run db:push` applies schema directly

### Database Schema
Two tables:
- **worries**: `id` (serial PK), `content` (text), `nickname` (text), `created_at` (timestamp)
- **cheers**: `id` (serial PK), `worry_id` (FK → worries.id), `content` (text), `created_at` (timestamp)

Validation schemas are generated using `drizzle-zod` and exported from `shared/schema.ts`.

### Shared Code
The `shared/` directory contains the database schema and Zod validation schemas, used by both frontend and backend. Types (`Worry`, `InsertWorry`, `Cheer`, `InsertCheer`) are inferred from the schema.

### Dev vs Production
- **Development**: Vite dev server runs as middleware on the Express server with HMR. Started via `npm run dev`.
- **Production**: Client is built with Vite to `dist/public/`, server is bundled with esbuild to `dist/index.cjs`. Static files served by Express. Started via `npm run start`.

### Storage Layer
- `server/storage.ts` defines an `IStorage` interface and a `DatabaseStorage` implementation
- The storage pattern allows for potential future swapping of storage backends
- Random worry selection currently loads all worries and picks randomly in-memory

## External Dependencies

### Required Services
- **PostgreSQL**: Required. Connection via `DATABASE_URL` environment variable. Used for all data persistence.

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit**: Database ORM and migration tooling
- **express**: HTTP server framework (v5)
- **@tanstack/react-query**: Server state management on the client
- **framer-motion**: Animation library for UI interactions
- **zod** + **drizzle-zod**: Runtime validation of API inputs
- **wouter**: Client-side routing
- **shadcn/ui** components (Radix UI primitives): Pre-built accessible UI components
- **connect-pg-simple**: PostgreSQL session store (available but not currently used for auth)

### Google Fonts (CDN)
- Gaegu, Hi Melody, Fredoka — loaded via Google Fonts CDN in `index.html`

### Replit-specific
- `@replit/vite-plugin-runtime-error-modal`: Dev error overlay
- `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner`: Dev-only Replit integration plugins
- Custom `vite-plugin-meta-images`: Updates OpenGraph meta tags with deployment URL