import { useMemo, useState } from 'react'
import { ArrowRight, Bell, Briefcase, DollarSign, TrendingDown, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricCard } from '@/components/common/MetricCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { StockTable } from '@/components/common/StockTable'
import { Sparkline } from '@/components/charts/Sparkline'
import { StockPriceChart } from '@/components/charts/StockPriceChart'
import { VolumeChart } from '@/components/charts/VolumeChart'
import { useMarket } from '@/context/MarketContext'
import { useToast } from '@/context/ToastContext'
import { getActivityFeed } from '@/data/mockActivity'
import { alertService } from '@/services/alertService'
import { marketService } from '@/services/marketService'
import { signalService } from '@/services/signalService'
import { stockService, type ChartRange } from '@/services/stockService'
import { watchlistService } from '@/services/watchlistService'
import { formatNumber, formatPercent } from '@/utils/formatters'

const RANGES: ChartRange[] = ['1D', '1W', '1M', '3M', '1Y']

export function OverviewPage() {
  const { market } = useMarket()
  const { showToast } = useToast()
  const [range, setRange] = useState<ChartRange>('1M')
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE')

  const watchlist = watchlistService.getWatchlist()
  const watchlistQuotes = stockService.getQuotes(watchlist.map((item) => item.symbol))
  const allQuotes = stockService.getQuotes()
  const indices = marketService.getIndices(market)
  const signals = signalService.getAllSignals()
  const signalSummary = signalService.getSummary(signals)
  const activity = getActivityFeed()
  const alerts = alertService.getAlerts()

  const selectedQuote = stockService.getQuote(selectedSymbol)
  const selectedStock = stockService.getStock(selectedSymbol)
  const chartHistory = stockService.getHistoryForRange(selectedSymbol, range)

  const totalValue = watchlistQuotes.reduce((acc, q) => acc + q.price, 0)
  const avgChange =
    watchlistQuotes.length === 0
      ? 0
      : watchlistQuotes.reduce((acc, q) => acc + q.changePercent, 0) / watchlistQuotes.length

  const movers = useMemo(() => {
    const sorted = [...allQuotes].sort((a, b) => b.changePercent - a.changePercent)
    return { gainers: sorted.slice(0, 4), losers: sorted.slice(-4).reverse() }
  }, [allQuotes])

  const handleAddToWatchlist = (_action: string, symbol: string) => {
    watchlistService.addSymbol(symbol)
    showToast(`${symbol} added to watchlist`)
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Watchlist Value"
          value={formatNumber(totalValue)}
          changeLabel="Simulated composite"
          trend="flat"
          icon={DollarSign}
        />
        <MetricCard
          label="Watchlist Daily Change"
          value={formatPercent(avgChange)}
          changeLabel="Avg. across watchlist"
          trend={avgChange >= 0 ? 'up' : 'down'}
          icon={avgChange >= 0 ? TrendingUp : TrendingDown}
        />
        <MetricCard
          label="Bullish Signals"
          value={String(signalSummary.bullish)}
          changeLabel={`${signalSummary.total} total signals`}
          trend="up"
          icon={TrendingUp}
        />
        <MetricCard
          label="Active Alerts"
          value={String(alerts.filter((a) => a.enabled).length)}
          changeLabel={`${alerts.length} configured`}
          trend="flat"
          icon={Bell}
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-100">Market Indices</h2>
          <span className="rounded-full border border-warn/40 bg-warn-soft px-2 py-0.5 text-xs font-medium text-amber-300">
            DEMO / SIMULATED
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {indices.map((index) => (
            <div key={index.symbol} className="rounded-xl border border-border-subtle bg-surface-1 p-4">
              <p className="text-sm text-gray-400">{index.name}</p>
              <p className="mt-1 text-xl font-semibold text-gray-50">{formatNumber(index.value)}</p>
              <p className={`mt-1 text-sm font-medium ${index.changePercent >= 0 ? 'text-bull' : 'text-bear'}`}>
                {formatPercent(index.changePercent)}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Updated {new Date(index.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border-subtle bg-surface-1 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <select
                value={selectedSymbol}
                onChange={(event) => setSelectedSymbol(event.target.value)}
                aria-label="Select stock"
                className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-1.5 text-sm font-semibold text-gray-100 focus:border-accent focus:outline-none"
              >
                {stockService.listStocks().map((stock) => (
                  <option key={stock.symbol} value={stock.symbol}>
                    {stock.symbol}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500">{selectedStock?.name}</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-50">{formatNumber(selectedQuote.price)}</span>
              <span className={`text-sm font-medium ${selectedQuote.changePercent >= 0 ? 'text-bull' : 'text-bear'}`}>
                {formatPercent(selectedQuote.changePercent)} ({formatNumber(selectedQuote.changeAbsolute)})
              </span>
            </div>
          </div>
          <div className="flex gap-1 rounded-lg border border-border-subtle bg-surface-2 p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  range === r ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <StockPriceChart data={chartHistory} positive={selectedQuote.changePercent >= 0} />
        <VolumeChart data={chartHistory} />
        <p className="mt-2 text-xs text-gray-500">Simulated historical data for demonstration purposes only.</p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-100">Watchlist Preview</h2>
          <Link to="/watchlist" className="flex items-center gap-1 text-sm text-accent hover:underline">
            Open full watchlist <ArrowRight size={14} />
          </Link>
        </div>
        <StockTable quotes={watchlistQuotes} actions={['view']} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-3 text-base font-semibold text-gray-100">Technical Signal Summary</h2>
          <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-1 p-3">
            {signals.slice(0, 5).map((signal) => (
              <div key={signal.id} className="rounded-lg border border-border-subtle/60 bg-surface-2 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-100">{signal.symbol}</span>
                    <StatusBadge direction={signal.direction} label={signal.label} />
                  </div>
                  <span className="text-xs text-gray-500">{new Date(signal.timestamp).toLocaleString()}</span>
                </div>
                <p className="mt-1.5 text-xs text-gray-400">{signal.description}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Indicator value: {signal.indicatorValue} &middot; Confidence: {signal.confidence}%
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-gray-100">Market Activity</h2>
          <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-1 p-3">
            {activity.map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-3 border-b border-border-subtle/50 py-2 last:border-0">
                <div className="flex items-start gap-2">
                  <Briefcase size={14} className="mt-0.5 text-gray-500" />
                  <p className="text-sm text-gray-300">{event.message}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-3 text-base font-semibold text-gray-100">Top Gainers</h2>
          <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-1 p-3">
            {movers.gainers.map((quote) => (
              <MoverRow key={quote.symbol} symbol={quote.symbol} price={quote.price} changePercent={quote.changePercent} onAdd={handleAddToWatchlist} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-base font-semibold text-gray-100">Top Losers</h2>
          <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-1 p-3">
            {movers.losers.map((quote) => (
              <MoverRow key={quote.symbol} symbol={quote.symbol} price={quote.price} changePercent={quote.changePercent} onAdd={handleAddToWatchlist} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function MoverRow({
  symbol,
  price,
  changePercent,
  onAdd,
}: {
  symbol: string
  price: number
  changePercent: number
  onAdd: (action: string, symbol: string) => void
}) {
  const history = stockService.getHistoryForRange(symbol, '1M').map((h) => h.price)
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-subtle/50 py-2 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-100">{symbol}</p>
        <p className="text-xs text-gray-500">{formatNumber(price)}</p>
      </div>
      <Sparkline data={history} positive={changePercent >= 0} />
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${changePercent >= 0 ? 'text-bull' : 'text-bear'}`}>
          {formatPercent(changePercent)}
        </span>
        <button
          type="button"
          onClick={() => onAdd('add', symbol)}
          className="text-xs text-accent hover:underline"
        >
          Watch
        </button>
      </div>
    </div>
  )
}
