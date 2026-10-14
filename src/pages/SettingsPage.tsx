import { useState } from 'react'
import { Info, Moon, Sun } from 'lucide-react'
import { useMarket } from '@/context/MarketContext'
import { useTheme } from '@/context/ThemeContext'
import type { ChartRange } from '@/services/stockService'

const STORAGE_KEYS = {
  chartRange: 'stockpulse.settings.chartRange',
  watchlistSort: 'stockpulse.settings.watchlistSort',
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { market, setMarket } = useMarket()
  const [chartRange, setChartRange] = useState<ChartRange>(
    () => (localStorage.getItem(STORAGE_KEYS.chartRange) as ChartRange) || '1M',
  )
  const [watchlistSort, setWatchlistSort] = useState(
    () => localStorage.getItem(STORAGE_KEYS.watchlistSort) || 'change',
  )

  const updateChartRange = (value: ChartRange) => {
    setChartRange(value)
    localStorage.setItem(STORAGE_KEYS.chartRange, value)
  }

  const updateWatchlistSort = (value: string) => {
    setWatchlistSort(value)
    localStorage.setItem(STORAGE_KEYS.watchlistSort, value)
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <section className="rounded-xl border border-border-subtle bg-surface-1 p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-200">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-200">Theme Preference</p>
            <p className="text-xs text-gray-500">Dark theme is recommended for extended monitoring sessions.</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-gray-200 hover:bg-surface-3"
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border-subtle bg-surface-1 p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-200">Market & Chart Preferences</h2>
        <div className="flex flex-col gap-4">
          <label className="flex items-center justify-between text-sm text-gray-300">
            Default Market
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value as typeof market)}
              className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-100 focus:border-accent focus:outline-none"
            >
              <option value="All">All Markets</option>
              <option value="India">India</option>
              <option value="US">US</option>
            </select>
          </label>
          <label className="flex items-center justify-between text-sm text-gray-300">
            Preferred Chart Range
            <select
              value={chartRange}
              onChange={(e) => updateChartRange(e.target.value as ChartRange)}
              className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-100 focus:border-accent focus:outline-none"
            >
              <option value="1D">1D</option>
              <option value="1W">1W</option>
              <option value="1M">1M</option>
              <option value="3M">3M</option>
              <option value="1Y">1Y</option>
            </select>
          </label>
          <label className="flex items-center justify-between text-sm text-gray-300">
            Default Watchlist Sort
            <select
              value={watchlistSort}
              onChange={(e) => updateWatchlistSort(e.target.value)}
              className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-100 focus:border-accent focus:outline-none"
            >
              <option value="change">Daily Change</option>
              <option value="price">Price</option>
              <option value="rsi">RSI</option>
              <option value="signal">Signal</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border-subtle bg-surface-1 p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-200">Data Source Status</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Provider</span>
          <span className="text-gray-200">Demo Data (Simulated)</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-gray-400">Connection</span>
          <span className="flex items-center gap-1.5 text-warn">
            <span className="h-1.5 w-1.5 rounded-full bg-warn" /> Simulated, not live
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-border-subtle bg-surface-1 p-5">
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 text-accent" />
          <div>
            <h2 className="text-sm font-semibold text-gray-200">About StockPulse AI</h2>
            <p className="mt-1 text-sm text-gray-400">
              StockPulse AI is a frontend prototype for a stock market monitoring dashboard. All prices, indices,
              indicators, signals and AI responses in this build are generated from deterministic mock data and do
              not represent live market data or financial advice. The application is designed to later integrate
              with a free stock market data API, an ASP.NET Core Web API, SQL Server, and a GenAI service.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
