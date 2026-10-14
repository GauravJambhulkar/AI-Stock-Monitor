import { useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchInput } from '@/components/common/SearchInput'
import { StockTable } from '@/components/common/StockTable'
import { useToast } from '@/context/ToastContext'
import { stockService } from '@/services/stockService'
import { watchlistService } from '@/services/watchlistService'

type SortKey = 'price' | 'change' | 'rsi' | 'signal'
type SignalFilterValue = 'all' | 'bullish' | 'bearish' | 'neutral'

function signalDirection(quote: ReturnType<typeof stockService.getQuote>): 'bullish' | 'bearish' | 'neutral' {
  if (quote.indicators.sma20 > quote.indicators.sma50 && quote.indicators.macd > quote.indicators.macdSignal) {
    return 'bullish'
  }
  if (quote.indicators.sma20 < quote.indicators.sma50 && quote.indicators.macd < quote.indicators.macdSignal) {
    return 'bearish'
  }
  return 'neutral'
}

export function WatchlistPage() {
  const { showToast } = useToast()
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('change')
  const [signalFilter, setSignalFilter] = useState<SignalFilterValue>('all')
  const [addSymbol, setAddSymbol] = useState('')

  const watchlist = watchlistService.getWatchlist()
  const quotes = stockService.getQuotes(watchlist.map((item) => item.symbol))

  const filtered = useMemo(() => {
    let list = quotes
    if (query.trim()) {
      const normalized = query.trim().toLowerCase()
      list = list.filter((quote) => {
        const stock = stockService.getStock(quote.symbol)
        return (
          quote.symbol.toLowerCase().includes(normalized) || stock?.name.toLowerCase().includes(normalized)
        )
      })
    }
    if (signalFilter !== 'all') {
      list = list.filter((quote) => signalDirection(quote) === signalFilter)
    }
    const sorted = [...list].sort((a, b) => {
      if (sortKey === 'price') return b.price - a.price
      if (sortKey === 'rsi') return b.indicators.rsi14 - a.indicators.rsi14
      if (sortKey === 'signal') return signalDirection(a).localeCompare(signalDirection(b))
      return b.changePercent - a.changePercent
    })
    return sorted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes, query, signalFilter, sortKey, version])

  const searchResults = addSymbol.trim() ? stockService.search(addSymbol).slice(0, 5) : []

  const handleAdd = (symbol: string) => {
    watchlistService.addSymbol(symbol)
    setAddSymbol('')
    setVersion((v) => v + 1)
    showToast(`${symbol} added to watchlist`)
  }

  const handleAction = (action: string, symbol: string) => {
    if (action === 'remove') {
      watchlistService.removeSymbol(symbol)
      setVersion((v) => v + 1)
      showToast(`${symbol} removed from watchlist`, 'info')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-100">Watchlist</h1>
          <p className="text-sm text-gray-500">{watchlist.length} stocks tracked. Data is simulated.</p>
        </div>
        <div className="relative w-full md:w-72">
          <SearchInput value={addSymbol} onChange={setAddSymbol} placeholder="Add symbol or company..." />
          {searchResults.length > 0 && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border-subtle bg-surface-2 shadow-xl">
              {searchResults.map((stock) => (
                <button
                  key={stock.symbol}
                  type="button"
                  onClick={() => handleAdd(stock.symbol)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-3"
                >
                  <span className="font-medium text-gray-100">{stock.symbol}</span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Star size={12} /> Add
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Filter watchlist..." className="w-full sm:w-64" />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 focus:border-accent focus:outline-none"
        >
          <option value="change">Sort by Daily Change</option>
          <option value="price">Sort by Price</option>
          <option value="rsi">Sort by RSI</option>
          <option value="signal">Sort by Signal</option>
        </select>
        <select
          value={signalFilter}
          onChange={(e) => setSignalFilter(e.target.value as SignalFilterValue)}
          className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 focus:border-accent focus:outline-none"
        >
          <option value="all">All Signals</option>
          <option value="bullish">Bullish</option>
          <option value="bearish">Bearish</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No stocks in your watchlist"
          description="Add stocks using the search box above to start tracking simulated prices and signals."
          icon={Star}
        />
      ) : (
        <StockTable quotes={filtered} actions={['view', 'remove']} onAction={handleAction} />
      )}
    </div>
  )
}
