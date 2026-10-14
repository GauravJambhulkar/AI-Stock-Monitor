# StockPulse AI

A professional, modern, responsive **stock market monitoring dashboard** frontend prototype, built with React, TypeScript, Vite and Tailwind CSS.

> ⚠️ **All market data in this application is simulated / mock data.** Prices, indices, technical indicators, signals, alerts and AI assistant responses are generated deterministically from local mock modules. Nothing in this app is live market data or financial advice.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for tooling and dev server
- [Tailwind CSS v4](https://tailwindcss.com/) for styling (via `@tailwindcss/vite`)
- [React Router](https://reactrouter.com/) for client-side routing
- [Recharts](https://recharts.org/) for charts (price area chart, volume bars, allocation donut, sparklines)
- [lucide-react](https://lucide.dev/) for icons
- [date-fns](https://date-fns.org/) for date formatting
- React Context for theme, market filter and toast notifications; `localStorage` for watchlist, alerts and portfolio persistence

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Install dependencies

```bash
npm install
```

### Run the app in development mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Application Structure

```
src/
  app/            App shell (App.tsx) and router configuration (router.tsx)
  components/
    layout/       Sidebar, Topbar, AppLayout (persistent shell)
    common/       MetricCard, StatusBadge, StockTable, SearchInput, EmptyState, LoadingState
    charts/       StockPriceChart, VolumeChart, Sparkline, AllocationChart (Recharts)
  pages/          One component per route (Overview, Watchlist, Market Signals,
                  Stock Explorer, AI Stock Analyst, Portfolio, Alerts, Settings)
  services/       Centralized read/write API used by pages and components:
                  stockService, marketService, signalService, portfolioService,
                  alertService, watchlistService, aiAnalystService
  data/           Mock data generators (deterministic, seeded random) and raw fixtures
  context/        ThemeContext, MarketContext, ToastContext (React Context providers)
  types/          Shared TypeScript types for stocks, signals, portfolio and alerts
  utils/          Formatters, technical indicator calculations (SMA/RSI/MACD), seeded RNG
```

## Pages

| Route | Description |
| --- | --- |
| `/` | Overview dashboard: summary metrics, market indices, main stock chart, watchlist preview, signal summary, top movers, activity feed |
| `/watchlist` | Add/remove/search/filter/sort tracked stocks, persisted in `localStorage` |
| `/signals` | Technical signal monitoring with market/symbol/category/date/confidence filters |
| `/explorer` | Stock discovery with filters, sortable table and a stock detail drawer (chart, indicators, signals) |
| `/ai-analyst` | Mock AI chat assistant that explains simulated technical indicators for a selected stock |
| `/portfolio` | Hypothetical holdings, allocation donut chart, add/remove holdings modal |
| `/alerts` | Create/toggle/delete simulated price & indicator alerts, evaluated client-side while the tab is open |
| `/settings` | Theme, default market, chart range and watchlist sort preferences; data source status; about |

## Mock Data & Future API Integration

All data access goes through the `src/services/*` modules, which currently read from the deterministic generators in `src/data/*` (seeded random walks for price history, derived technical indicators, and rule-based mock signals). Components **never** read directly from `src/data`.

To integrate real data later:

1. **Market data**: Replace the implementation of `stockService` and `marketService` with calls to a free stock market API (quotes, historical OHLC, index values), keeping the same method signatures.
2. **Technical indicators / signals**: `signalService` is already isolated so rule-based mock signal generation can be swapped for real SMA/RSI/MACD calculations performed by an ASP.NET Core Web API backed by SQL Server.
3. **Portfolio & alerts**: `portfolioService` and `alertService` currently persist to `localStorage`; swap their read/write functions for authenticated API calls once a backend and user accounts exist.
4. **AI Stock Analyst**: `aiAnalystService.ask(prompt, symbol)` currently returns canned, template-based text. Replace its implementation with a call to an ASP.NET Core endpoint that proxies a GenAI/LLM service, keeping the same function signature so `AIAnalystPage` requires no changes.

## Notes on Simulated Data Labeling

Per the project requirements, the UI explicitly labels simulated/mock content wherever it could be mistaken for live data: market indices are tagged "DEMO / SIMULATED", portfolio and alert values are labeled "Simulated", the AI Analyst page shows a persistent "informational, not financial advice" notice, and the sidebar status card always shows the demo data provider and "Simulated" connection status.
