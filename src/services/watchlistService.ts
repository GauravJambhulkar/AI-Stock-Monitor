import type { WatchlistItem } from '@/types/portfolio'

const STORAGE_KEY = 'stockpulse.watchlist'

const DEFAULT_WATCHLIST = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'AAPL', 'MSFT', 'NVDA']

function readWatchlist(): WatchlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as WatchlistItem[]
  } catch {
    // fall through to defaults
  }
  const now = new Date().toISOString()
  return DEFAULT_WATCHLIST.map((symbol) => ({ symbol, addedAt: now }))
}

function writeWatchlist(items: WatchlistItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const watchlistService = {
  getWatchlist(): WatchlistItem[] {
    return readWatchlist()
  },

  addSymbol(symbol: string): WatchlistItem[] {
    const items = readWatchlist()
    if (items.some((item) => item.symbol === symbol)) return items
    const next = [...items, { symbol, addedAt: new Date().toISOString() }]
    writeWatchlist(next)
    return next
  },

  removeSymbol(symbol: string): WatchlistItem[] {
    const next = readWatchlist().filter((item) => item.symbol !== symbol)
    writeWatchlist(next)
    return next
  },

  isWatched(symbol: string): boolean {
    return readWatchlist().some((item) => item.symbol === symbol)
  },
}
