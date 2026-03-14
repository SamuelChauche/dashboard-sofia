![Sofia Dashboard](public/banner.png)

# Sofia Dashboard

Behavioral reputation dashboard for the **Sofia** browser extension — a Web3 protocol that tracks browsing intents, connects social platforms via OAuth, and builds a verifiable reputation profile on-chain.

## Tech Stack

- **React 18** + **Vite 6**
- **TypeScript**
- **Plain CSS** (glassmorphism design, dark theme, BEM naming)
- **WebGL** animated gradient background (ogl)
- **viem** for blockchain interactions
- **@0xsofia/dashboard-graphql** for generated GraphQL hooks (Intuition indexer)
- **React Query v5** for data fetching

## Getting Started

```bash
# Install dependencies
pnpm install

# GraphQL codegen (after editing .graphql files)
cd packages/graphql && pnpm codegen

# Start dev server
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── main.tsx                    # React root
├── App.tsx                     # Layout orchestrator + Grainient background
├── config.ts                   # Season configuration
├── data.ts                     # Mock/static data
├── config/
│   ├── platformCatalog.ts      # 100+ platform definitions (name, icon, OAuth, signals)
│   ├── taxonomy.ts             # Domain → category → niche hierarchy (370+ niches)
│   └── signalMatrix.ts         # Signal weights per domain/platform
├── components/
│   ├── Navbar.tsx              # Header with logo + season title
│   ├── Hero.tsx                # Countdown timer + CTA
│   ├── StatsRibbon.tsx         # Animated stat counters (scroll-triggered)
│   ├── Leaderboard.tsx         # Sortable user ranking table
│   ├── PersonalStats.tsx       # User stats card with share button
│   ├── TrendingPages.tsx       # Intent-tagged trending cards grid
│   ├── HowRewards.tsx          # Reward explanation cards
│   ├── FooterCTA.tsx           # Footer
│   ├── Grainient.tsx           # WebGL animated gradient background
│   ├── profile/                # Profile components (see below)
│   └── styles/                 # Colocated CSS files
├── pages/
│   ├── DashboardPage.tsx       # Main landing (leaderboard, trending, stats)
│   ├── ProfilePage.tsx         # Profile view with internal navigation
│   └── OAuthCallbackPage.tsx   # OAuth redirect handler
├── hooks/
│   ├── useUserProfile.ts       # User positions + certifications
│   ├── useReputationScores.ts  # Domain/niche scoring engine
│   ├── useDomainSelection.ts   # Domain & niche selection state
│   ├── usePlatformConnections.ts # OAuth platform connections
│   ├── useShareProfile.ts      # Share profile (sofia-og OG images)
│   ├── useEnsNames.ts          # ENS name resolution
│   ├── useSeasonPool.ts        # Beta Season pool data
│   ├── useTrending.ts          # Trending certifications
│   ├── useUserStats.ts         # User statistics
│   └── useAlphaTesters.ts      # Alpha tester management
├── services/
│   ├── profileService.ts       # Profile data fetching + transformation
│   ├── oauthService.ts         # OAuth flow management
│   ├── eventFetcher.ts         # On-chain event streaming
│   ├── rpcClient.ts            # RPC client wrapper
│   └── rpcQueue.ts             # RPC request queuing
├── types/
│   ├── index.ts                # Shared types
│   ├── profile.ts              # Profile interfaces
│   └── reputation.ts           # Reputation/scoring types
└── utils/
    └── sofiaDetect.ts          # Sofia extension detection + certify URL helper
```

### Profile Components

```
components/profile/
├── ProfileHeader.tsx           # Avatar, ENS name, stats, Share button
├── OverviewTab.tsx             # Main view: radar, interests accordion, platforms
├── DomainSelector.tsx          # Interest (domain) selection grid
├── NicheSelector.tsx           # Niche selection within a domain
├── PlatformGrid.tsx            # Connected platforms grid
├── PlatformCard.tsx            # Platform card (Connect + Certify CTAs)
├── ScoreView.tsx               # Full reputation scores view
├── ScoreRadar.tsx              # Radar chart (SVG) for domain scores
├── ScoreDomainCard.tsx         # Individual domain score card
├── ShareProfileModal.tsx       # Share modal with OG image preview
└── ProfileTabs.tsx             # Tab navigation (legacy, being removed)
```

## Architecture

- **Pages**: `DashboardPage` (public leaderboard) and `ProfilePage` (wallet-connected)
- **ProfilePage navigation**: Internal `view` state (`overview` → `interests` → `niches` → `platforms` → `scores`) with back navigation
- **Data flow**: Services → Hooks → Components (no direct service calls from components)
- **GraphQL**: Generated hooks from `@0xsofia/dashboard-graphql`, fetcher pattern: `useGetXxxQuery.fetcher(vars)()`
- **Styling**: BEM naming (`.component__element--modifier`), glassmorphism, CSS variables in `index.css`
- **Sofia integration**: Extension detection via DOM attribute, `?sofia_certify=true` URL param triggers in-extension certification

## Key Features

- **Behavioral Reputation**: Score calculated from connected platform signals across 8 domains
- **Interest Selection**: Domain → category → niche taxonomy (370+ niches)
- **Platform OAuth**: Connect GitHub, Reddit, Last.fm, Chess.com, Strava, etc.
- **Share Profile**: Public profile link with OG image via sofia-og
- **Season Leaderboard**: Ranked by streak, certifications, gold, discovery badges
- **Sofia Extension Bridge**: Certify button opens Sofia side panel for on-chain certification

## License

Private — All rights reserved.
