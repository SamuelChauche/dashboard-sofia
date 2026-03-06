![Sofia Dashboard](public/banner.png)

# Sofia Dashboard

Seasonal rewards dashboard for the **Sofia** browser extension — a Web3 protocol that tracks browsing intents and rewards users with Gold tokens.

## Tech Stack

- **React 18** + **Vite 6**
- **TypeScript**
- **Plain CSS** (glassmorphism design, dark theme)
- **WebGL** animated gradient background (ogl)
- **viem** for blockchain interactions

## Getting Started

```bash
# Install dependencies
pnpm install

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
├── main.tsx                # React root
├── App.tsx                 # Layout orchestrator + Grainient background
├── data.ts                 # Mock data (stats, leaderboard, trending, rewards)
├── config.ts               # Season configuration
├── components/
│   ├── Navbar.tsx           # Header with logo + season title
│   ├── Hero.tsx             # Countdown timer + CTA button
│   ├── StatsRibbon.tsx      # Animated stat counters (scroll-triggered)
│   ├── Leaderboard.tsx      # Sortable user ranking table
│   ├── TrendingPages.tsx    # Intent-tagged trending cards grid
│   ├── HowRewards.tsx       # Reward explanation cards
│   ├── FooterCTA.tsx        # Footer
│   ├── Grainient.tsx        # WebGL animated gradient background
│   └── styles/              # Colocated CSS files
├── hooks/                   # Custom React hooks (blockchain data)
├── services/                # RPC client, event fetcher, GraphQL
├── graphql/                 # GraphQL queries
└── types/                   # Shared TypeScript types
```

## License

Private — All rights reserved.
