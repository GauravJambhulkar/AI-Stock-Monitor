import { Bell, ChevronRight, Menu, Moon, Sun, UserCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SearchInput } from '@/components/common/SearchInput'
import { useMarket } from '@/context/MarketContext'
import { useTheme } from '@/context/ThemeContext'
import { searchStocks } from '@/data/mockStocks'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/watchlist': 'Watchlist',
  '/signals': 'Market Signals',
  '/explorer': 'Stock Explorer',
  '/ai-analyst': 'AI Stock Analyst',
  '/portfolio': 'Portfolio',
  '/alerts': 'Alerts',
  '/settings': 'Settings',
}

interface TopbarProps {
  onOpenSidebar: () => void
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { market, setMarket } = useMarket()
  const { theme, toggleTheme } = useTheme()
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)

  const title = PAGE_TITLES[location.pathname] ?? 'StockPulse AI'
  const results = query.trim() ? searchStocks(query).slice(0, 6) : []

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border-subtle bg-surface-1/90 px-4 py-3 backdrop-blur lg:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-gray-400 hover:bg-surface-2 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <div className="hidden min-w-[140px] items-center gap-1 text-sm text-gray-500 sm:flex">
        <span>StockPulse AI</span>
        <ChevronRight size={14} />
        <span className="font-medium text-gray-100">{title}</span>
      </div>

      <div className="relative flex-1 max-w-md">
        <SearchInput
          value={query}
          onChange={(value) => {
            setQuery(value)
            setShowResults(true)
          }}
          placeholder="Search symbol or company..."
        />
        {showResults && results.length > 0 && (
          <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-border-subtle bg-surface-2 shadow-xl">
            {results.map((stock) => (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => {
                  navigate(`/explorer?symbol=${stock.symbol}`)
                  setQuery('')
                  setShowResults(false)
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-3"
              >
                <span className="font-medium text-gray-100">{stock.symbol}</span>
                <span className="text-gray-500">{stock.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <select
        value={market}
        onChange={(event) => setMarket(event.target.value as typeof market)}
        aria-label="Market selector"
        className="hidden rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 focus:border-accent focus:outline-none sm:block"
      >
        <option value="All">All Markets</option>
        <option value="India">India</option>
        <option value="US">US</option>
      </select>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="rounded-lg p-2 text-gray-400 hover:bg-surface-2 hover:text-gray-100"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <button
        type="button"
        aria-label="Notifications"
        className="relative rounded-lg p-2 text-gray-400 hover:bg-surface-2 hover:text-gray-100"
      >
        <Bell size={18} />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-bear" />
      </button>

      <button type="button" aria-label="Profile menu" className="rounded-full text-gray-300 hover:text-gray-100">
        <UserCircle2 size={28} />
      </button>
    </header>
  )
}
