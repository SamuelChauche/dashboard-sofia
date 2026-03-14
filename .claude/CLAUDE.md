# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Sofia Dashboard

Behavioral reputation dashboard for the Sofia browser extension — a Web3 protocol that tracks browsing intents, connects social platforms via OAuth, and builds a verifiable reputation profile on-chain.

## Tech Stack

- **Framework**: React 18 + Vite 6
- **Language**: TypeScript (strict: false)
- **Styling**: Plain CSS (no preprocessor, no CSS-in-JS)
- **Background**: WebGL shader via `ogl` library (Grainient component)
- **Fonts**: Gotu (display) + Montserrat (body) — loaded from Google Fonts in `index.html`
- **GraphQL**: `@0xsofia/dashboard-graphql` generated hooks (codegen from `.graphql` files)
- **Blockchain**: `viem` for RPC calls, Intuition protocol on Base
- **Data fetching**: React Query v5

## Commands

```bash
pnpm dev         # Start dev server (Vite)
pnpm build       # Production build → dist/
pnpm preview     # Preview production build

# GraphQL codegen (after editing .graphql files)
cd packages/graphql && pnpm codegen
```

No test runner, linter, or formatter is configured.

## Project Structure

```
src/
├── main.tsx                    # React root
├── App.tsx                     # Layout orchestrator + Grainient background
├── App.css                     # Root layout, z-index layers
├── config.ts                   # Season configuration
├── data.ts                     # Static data
├── config/
│   ├── platformCatalog.ts      # 100+ platform defs (name, icon, OAuth config, signals)
│   ├── taxonomy.ts             # Domain → category → niche hierarchy (370+ niches)
│   └── signalMatrix.ts         # Signal weights per domain/platform
├── components/
│   ├── profile/                # Profile-specific components (11 files)
│   ├── styles/                 # Colocated CSS files (17 files)
│   ├── Navbar.tsx              # Header
│   ├── Hero.tsx                # Countdown + CTA
│   ├── StatsRibbon.tsx         # Animated stat counters
│   ├── Leaderboard.tsx         # Sortable ranking table
│   ├── PersonalStats.tsx       # User stats + share
│   ├── TrendingPages.tsx       # Trending cards
│   ├── HowRewards.tsx          # Reward explanation
│   ├── FooterCTA.tsx           # Footer
│   └── Grainient.tsx           # WebGL gradient background
├── pages/
│   ├── DashboardPage.tsx       # Main landing (leaderboard, trending)
│   ├── ProfilePage.tsx         # Profile with internal navigation
│   └── OAuthCallbackPage.tsx   # OAuth redirect handler
├── hooks/                      # 10 hooks (thin facades over services)
├── services/                   # 5 services (profileService, oauthService, rpcClient, etc.)
├── types/                      # 3 type files (index, profile, reputation)
└── utils/
    └── sofiaDetect.ts          # Extension detection + certify URL helper
```

## Architecture

### Data Flow

```
Services (services/)           — Data fetching, transformation, business logic
    ↓
Custom Hooks (hooks/)          — Thin orchestration, React state
    ↓
Pages (pages/)                 — Route-level orchestration
    ↓
Components (components/)       — Presentation only
```

**Never call services directly from components** — always through hooks.

### ProfilePage Navigation

ProfilePage uses internal `view` state instead of tabs:

```
overview → interests → niches → platforms → scores
    ↑          |          |          |          |
    └──────────┴──────────┴──────────┴──────────┘
                    (← Back)
```

Views: `'overview' | 'interests' | 'niches' | 'platforms' | 'scores'`

### GraphQL Pattern

Uses `@0xsofia/dashboard-graphql` generated hooks with fetcher pattern:

```typescript
import { useGetUserPositionsQuery } from "@0xsofia/dashboard-graphql"

// In a service or hook:
const data = await useGetUserPositionsQuery.fetcher({ accountId: address })()
```

**Important**: Generated types have an extra `term` level: `vault.term.triple` / `vault.term.atom` (not `vault.triple`).

### Reputation System

- **Domains**: 8 top-level interests (Tech & Dev, Gaming, Music & Audio, etc.)
- **Categories**: ~50 groupings within domains
- **Niches**: 370+ specific topics users can select
- **Platforms**: 100+ connectable platforms (OAuth or manual)
- **Scoring**: Signal-weighted scores per domain based on connected platform data
- **Signal Matrix**: Maps platform signals to domain relevance weights

### Sofia Extension Integration

- Detection: `document.documentElement.dataset.sofiaExtension === 'true'`
- Certify flow: `?sofia_certify=true` URL param triggers banner in extension content script
- If Sofia not installed: redirects to Chrome Web Store

## Design System

### Brand Identity

Reference: `.claude/brandkit.md` for full brand guidelines.

- **Aesthetic**: Dark glassmorphism with warm earthy tones
- **Primary color**: `#C7866C` (warm clay/argile)
- **Background**: Dark (`#0a0a0a`) with WebGL animated gradient
- **Glass effect**: `rgba(0,0,0,0.14)` + `backdrop-filter: blur(50px)`

### CSS Variables

All design tokens in `src/index.css` as `:root` custom properties:
- `--color-primary`, `--color-secondary`, `--color-accent-olive`
- Intent colors: `--color-intent-work`, `--color-intent-learning`, `--color-intent-fun`, `--color-intent-inspiration`
- `--color-gold`, `--color-golden` for rewards
- Spacing: `--space-xs` (4px) to `--space-6xl` (56px)
- Font sizes: `--font-size-xs` (10px) to `--font-size-countdown` (48px)

### CSS Conventions

- **BEM naming**: `.component__element--modifier` (e.g. `.overview-tab__section-title`)
- **No utility classes** — all styles are component-scoped
- **Responsive breakpoints**: 768px (tablet), 480px (mobile)
- **Animations**: CSS `@keyframes` preferred; `requestAnimationFrame` for counters

## Key Implementation Details

- **Countdown timer** targets `SEASON_END` in `config.ts` — updates every second
- **StatsRibbon counters** use `IntersectionObserver` + `requestAnimationFrame` + `easeOutExpo`
- **Leaderboard sorting** cycles through: streak, certs, gold, pioneer
- **Grainient** is a full-screen fixed WebGL canvas — keep colors dark
- **Share Profile** posts to `sofia-og.vercel.app/api/share` for OG image generation
- **Domain accordion** in OverviewTab expands to show categories + toggleable niches

## Assets

- `public/logo.png` — Sofia logo
- `public/goldcoin.png` — Gold token icon
- `public/badges/` — pioneer.png, explorer.png, contributor.png, trust.png
- `.claude/` — brandkit.md, mockup.png, badge source PNGs

## Gotchas

- GraphQL indexer stores addresses in EIP-55 checksummed format — use `_ilike` for address filters
- `atoms` type has no `id` field — use `term_id`
- React Query v5: `isFetching` for any request, `isLoading` for first load only
- Generated types: `vault.term.triple` not `vault.triple`
