# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Sofia Dashboard

Seasonal rewards dashboard for the Sofia browser extension — a Web3 protocol that tracks browsing intents and rewards users with Gold tokens.

## Tech Stack

- **Framework**: React 18 + Vite 6
- **Language**: JavaScript (JSX, no TypeScript)
- **Styling**: Plain CSS (no preprocessor, no CSS-in-JS)
- **Background**: WebGL shader via `ogl` library (Grainient component)
- **Fonts**: Gotu (display) + Montserrat (body) — loaded from Google Fonts in `index.html`

## Commands

```bash
pnpm dev         # Start dev server (Vite)
pnpm build       # Production build → dist/
pnpm preview     # Preview production build
```

No test runner, linter, or formatter is configured.

## Project Structure

```
src/
├── main.jsx              # React root
├── App.jsx               # Layout orchestrator + Grainient background
├── App.css               # Root layout, z-index layers
├── index.css             # Global reset, CSS variables, design tokens
├── data.js               # All mock data (stats, leaderboard, trending, rewards)
└── components/
    ├── Navbar.jsx/css     # Header with logo + season title
    ├── Hero.jsx/css       # Countdown timer + CTA button
    ├── StatsRibbon.jsx/css# 5 animated stat counters (scroll-triggered)
    ├── Leaderboard.jsx/css# Sortable user ranking table
    ├── TrendingPages.jsx/css # Intent-tagged trending cards grid
    ├── HowRewards.jsx/css # Reward explanation cards
    ├── FooterCTA.jsx/css  # Footer
    ├── Grainient.jsx/css  # WebGL animated gradient background (ogl)
```

## Architecture

- **Single-page app**, no routing
- **No state management library** — local `useState`/`useEffect` only
- **Data source**: `src/data.js` exports all mock data (no API)
- **Z-index layers**: Background (0) → Content (1) → Navbar (100)
- **Component pattern**: Each component = `.jsx` + colocated `.css` file

## Design System

### Brand Identity

Reference: `.claude/brandkit.md` for full brand guidelines.

- **Aesthetic**: Dark glassmorphism with warm earthy tones
- **Primary color**: `#C7866C` (warm clay/argile)
- **Background**: Dark (`#0a0a0a`) with WebGL animated gradient
- **Glass effect**: `rgba(0,0,0,0.14)` + `backdrop-filter: blur(50px)`

### CSS Variables

All design tokens live in `src/index.css` as `:root` custom properties:
- `--color-primary`, `--color-secondary`, `--color-accent-olive`
- Intent colors: `--color-intent-work` (blue), `--color-intent-learning` (green), `--color-intent-fun` (amber), `--color-intent-inspiration` (purple)
- `--color-gold`, `--color-golden` for rewards
- Spacing scale: `--space-xs` (4px) to `--space-6xl` (56px)
- Font sizes: `--font-size-xs` (10px) to `--font-size-countdown` (48px)
- Shadows, border-radius, transitions

### CSS Conventions

- **BEM naming**: `.component__element--modifier` (e.g. `.leaderboard__row--highlighted`)
- **No utility classes** — all styles are component-scoped
- **Responsive breakpoints**: 768px (tablet), 480px (mobile)
- **Animations**: CSS `@keyframes` preferred; `requestAnimationFrame` for number counters

## Key Implementation Details

- **Countdown timer** targets `SEASON_END` in `data.js` — updates every second via `setInterval`
- **StatsRibbon counters** use `IntersectionObserver` to trigger once on scroll, then animate with `requestAnimationFrame` + `easeOutExpo` easing
- **Leaderboard sorting** cycles through 4 fields: streak, certs, gold, pioneer
- **Grainient** is a full-screen fixed WebGL canvas behind all content — color props control the shader; keep colors dark to not overwhelm the UI
- **TrendingPages** cards use `data-intent` attribute for CSS-driven intent-colored hover glows

## Assets

- `public/logo.png` — Sofia logo
- `public/goldcoin.png` — Gold token icon
- `public/badges/` — pioneer.png, explorer.png, contributor.png, trust.png
- `.claude/` — brandkit.md, mockup.png, badge source PNGs
