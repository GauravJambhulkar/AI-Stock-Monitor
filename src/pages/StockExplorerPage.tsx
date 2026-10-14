import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Star, X } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { SearchInput } from '@/components/common/SearchInput'
import { StatusBadge } from '@/components/common/StatusBadge'
import { StockPriceChart } from '@/components/charts/StockPriceChart'
import { useToast } from '@/context/ToastContext'
import { signalService } from '@/services/signalService'
import { stockService, type ChartRange } from '@/services/stockService'
import { watchlistService } from '@/services/watchlistService'
import { formatNumber, formatPercent } from '@/utils/formatters'
import type { Market } from '@/types/stock'

type SortKey = 'symbol' | 'price' | 'change'

export function StockExplorerPage() {
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [market, setMarket] = useState<Market | 'All'>('All')
  const [sector, setSector] = useState('All')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minChange, setMinChange] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('symbol')
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState<ChartRange>('1M')

  const selectedSymbol = searchParams.get('symbol')

  const allStocks = stockService.listStocks()
  const sectors = useMemo(() => ['All', ...new Set(allStocks.map((s) => s.sector))], [allStocks])

  const results = useMemo(() => {
    let stocks = stockService.search(query)
    if (market !== 'All') stocks = stocks.filter((s) => s.market === market)
    if (sector !== 'All') stocks = stocks.filter((s) => s.sector === sector)

    let rows = stocks.map((stock) => ({ stock, quote: stockService.getQuote(stock.symbol) }))

    if (minPrice) rows = rows.filter((r) => r.quote.price >= Number(minPrice))
    if (maxPrice) rows = rows.filter((r) => r.quote.price <= Number(maxPrice))
    if (minChange) rows = rows.filter((r) => r.quote.changePercent >= Number(minChange))

    return rows.sort((a, b) => {
      if (sortKey === 'price') return b.quote.price - a.quote.price
      if (sortKey === 'change') return b.quote.changePercent - a.quote.changePercent
      return a.stock.symbol.localeCompare(b.stock.symbol)
    })
  }, [query, market, sector, minPrice, maxPrice, minChange, sortKey])

  const detail = selectedSymbol
    ? { stock: stockService.getStock(selectedSymbol), quote: stockService.getQuote(selectedSymbol) }
    : null

  const openDetail = (symbol: string) => {
    setLoading(true)
    setSearchParams({ symbol })
    setTimeout(() => setLoading(false), 350)
  }

  const closeDetail = () => {
    searchParams.delete('symbol')
    setSearchParams(searchParams)
  }

  const handleAddToWatchlist = (symbol: string) => {
    watchlistService.addSymbol(symbol)
    showToast(`${symbol} added to watchlist`)
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-border-subtle bg-surface-1 p-4">
        <SearchInput value={query} onChange={setQuery} placeholder="Search ticker or company..." className="w-full sm:w-64" />
        <select
          value={market}
          onChange={(e) => setMarket(e.target.value as Market | 'All')}
          className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 focus:border-accent focus:outline-none"
        >
          <option value="All">All Markets</option>
          <option value="India">India</option>
          <option value="US">US</option>
        </select>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 focus:border-accent focus:outline-none"
        >
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min price"
          type="number"
          className="w-28 rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-accent focus:outline-none"
        />
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max price"
          type="number"
          className="w-28 rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-accent focus:outline-none"
        />
        <input
          value={minChange}
          onChange={(e) => setMinChange(e.target.value)}
          placeholder="Min % change"
          type="number"
          className="w-32 rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-accent focus:outline-none"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 focus:border-accent focus:outline-none"
        >
          <option value="symbol">Sort by Symbol</option>
          <option value="price">Sort by Price</option>
          <option value="change">Sort by Change</option>
        </select>
      </section>

      {results.length === 0 ? (
        <EmptyState title="No stocks match your filters" description="Try adjusting search, sector or price filters." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-2 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Symbol</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Change</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map(({ stock, quote }) => (
                <tr key={stock.symbol} className="border-b border-border-subtle/60 bg-surface-1 last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-semibold text-gray-100">{stock.symbol}</td>
                  <td className="px-4 py-3 text-gray-400">{stock.name}</td>
                  <td className="px-4 py-3 text-gray-400">{stock.sector}</td>
                  <td className="px-4 py-3 text-right text-gray-100">{formatNumber(quote.price)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${quote.changePercent >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {formatPercent(quote.changePercent)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => openDetail(stock.symbol)} className="text-xs text-accent hover:underline">
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSymbol && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/60">
          <div className="h-full w-full max-w-xl overflow-y-auto border-l border-border-subtle bg-surface-1 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-100">{selectedSymbol} Details</h2>
              <button type="button" onClick={closeDetail} aria-label="Close details" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-2">
                <X size={18} />
              </button>
            </div>

            {loading && <LoadingState label="Loading stock details..." />}

            {!loading && detail?.quote && (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm text-gray-500">{detail.stock?.name}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-gray-50">{formatNumber(detail.quote.price)}</span>
                    <span className={`text-sm font-medium ${detail.quote.changePercent >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {formatPercent(detail.quote.changePercent)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 rounded-lg border border-border-subtle bg-surface-2 p-1 self-start">
                  {(['1D', '1W', '1M', '3M', '1Y'] as ChartRange[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRange(r)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${range === r ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-100'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <StockPriceChart
                  data={stockService.getHistoryForRange(selectedSymbol, range)}
                  positive={detail.quote.changePercent >= 0}
                />

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <StatRow label="Day High" value={formatNumber(detail.quote.dayHigh)} />
                  <StatRow label="Day Low" value={formatNumber(detail.quote.dayLow)} />
                  <StatRow label="Volume" value={formatNumber(detail.quote.volume, 0)} />
                  <StatRow label="RSI (14)" value={detail.quote.indicators.rsi14.toFixed(1)} />
                  <StatRow label="SMA 20 / 50" value={`${formatNumber(detail.quote.indicators.sma20)} / ${formatNumber(detail.quote.indicators.sma50)}`} />
                  <StatRow label="MACD / Signal" value={`${detail.quote.indicators.macd} / ${detail.quote.indicators.macdSignal}`} />
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-200">Technical Signal Summary</h3>
                  <div className="flex flex-col gap-2">
                    {signalService.getSignalsForSymbol(selectedSymbol).map((signal) => (
                      <div key={signal.id} className="rounded-lg border border-border-subtle bg-surface-2 p-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge direction={signal.direction} label={signal.label} />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">{signal.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddToWatchlist(selectedSymbol)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                >
                  <Star size={15} /> Add to Watchlist
                </button>
              </div>
            )}

            {!loading && !detail?.quote && (
              <EmptyState title="Could not load this stock" description="Please try another symbol." />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-2 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-100">{value}</p>
    </div>
  )
}
