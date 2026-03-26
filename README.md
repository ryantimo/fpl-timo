# FPL Timo — Fantasy Premier League League Analyzer

A professional, real-time FPL league dashboard built with Next.js 14, TypeScript, and Recharts. Track your private league's live standings, captain trends, ownership stats, fixture forecasts, and more — all in one place.

**Live:** [fpl-timo.vercel.app](https://fpl-timo.vercel.app)

---

## Features

| Tab | What it shows |
|-----|--------------|
| **Standings** | Live GW points, total scores, rank changes, top-3 medals |
| **Rankings** | Line chart of the last 5 GWs with 5-GW projected trajectory |
| **Captains** | Who captained who, points earned, donut breakdown |
| **Ownership** | Most/least owned players across all league squads, per position |
| **Differentials** | Low-owned high-scorers — players that can shift the league table |
| **Transfers** | GW transfer ins/outs with net point impact per manager |
| **Forecast** | Fixture ticker (FDR-colored), 3-GW squad projections, transfer targets |

### Forecast tab highlights
- **Fixture Ticker** — all 20 PL teams × next 5 GWs, color-coded by FDR (green → red). Double gameweeks flagged.
- **Squad Projections** — uses `ep_next` for GW+1, form × fixture difficulty for GW+2/3. Captain ×2 applied. Ranks every manager by 3GW projected total.
- **Transfer Targets** — high `ep_next` players owned by fewer than 30% of your league. Differential opportunities at a glance.

---

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS — custom dark theme (`#07070f` background, `#00ff85` green accent)
- **Charts:** [Recharts](https://recharts.org/) — LineChart, BarChart, PieChart, ScatterChart
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment:** [Vercel](https://vercel.com/)
- **Data:** [FPL public API](https://fantasy.premierleague.com/api)

---

## Project Structure

```
fpl-timo/
├── app/
│   ├── api/fpl/route.ts     # Server-side FPL API proxy
│   ├── globals.css          # Dark theme, shared component styles
│   ├── layout.tsx           # Root layout (Inter font)
│   └── page.tsx             # Main client page (tab state, GW selector)
├── components/
│   ├── Sidebar.tsx          # Fixed left nav
│   └── tabs/
│       ├── StandingsTab.tsx
│       ├── RankingsTab.tsx
│       ├── CaptainsTab.tsx
│       ├── OwnershipTab.tsx
│       ├── DifferentialsTab.tsx
│       ├── TransfersTab.tsx
│       └── ForecastTab.tsx
├── lib/
│   └── fpl.ts               # All FPL API calls + data processing
└── .env.example
```

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/ryantimo/fpl-timo.git
cd fpl-timo
npm install
```

### 2. Set your league ID

```bash
cp .env.example .env.local
# Edit .env.local and set your FPL league ID:
# LEAGUE_ID=1519916
```

Find your league ID in the FPL app: go to your league page — the number in the URL is your ID.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ryantimo/fpl-timo)

1. Click **Deploy with Vercel** above
2. Set the environment variable `LEAGUE_ID` to your FPL league ID
3. Deploy — done

Or via CLI:

```bash
npm i -g vercel
vercel --prod
# Set LEAGUE_ID in the Vercel dashboard under Project → Settings → Environment Variables
```

---

## Data & Caching

All FPL data is fetched server-side via the Next.js API route (`/api/fpl`), which proxies the FPL public API to avoid CORS issues. Responses are revalidated every **5 minutes** (`next: { revalidate: 300 }`). You can manually refresh at any time using the Refresh button in the top bar.

Requests to the FPL API are staggered by 80ms per team to avoid rate limiting.

---

## Screenshots

> Standings, Rankings, and Forecast tabs showing live league data.

*(Add your own screenshots here)*

---

## License

MIT
