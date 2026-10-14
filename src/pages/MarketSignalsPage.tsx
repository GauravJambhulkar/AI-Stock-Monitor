import { useMemo, useState } from 'react'
import { Activity, Radar, TrendingDown, TrendingUp } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { MetricCard } from '@/components/common/MetricCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { signalService } from '@/services/signalService'
import type { TechnicalSignalType } from '@/types/stock'

const CATEGORY_OPTIONS: Array<{ value: TechnicalSignalType | 'all'; label: string }> = [
  { value: 'all', label: 'All Categories' },
  { value: 'rsi_oversold', label: 'RSI Oversold' },
  { value: 'rsi_overbought', label: 'RSI Overbought' },
  { value: 'sma_bullish_crossover', label: 'SMA Bullish Crossover' },
  { value: 'sma_bearish_crossover', label: 'SMA Bearish Crossover' },
  { value: 'macd_bullish_crossover', label: 'MACD Bullish Crossover' },
  { value: 'macd_bearish_crossover', label: 'MACD Bearish Crossover' },
  { value: 'volume_spike', label: 'Volume Spike' },
  { value: 'bearish_momentum', label: 'Bearish Momentum' },
]

export function MarketSignalsPage() {
  const [market, setMarket] = useState<'All' | 'India' | 'US'>('All')
  const [symbol, setSymbol] = useState('')
  const [category, setCategory] = useState<TechnicalSignalType | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minConfidence, setMinConfidence] = useState(0)

  const signals = useMemo(
    () =>
      signalService.getSignalsFiltered({
        market,
        symbol,
        category,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        minConfidence,
      }),
    [market, symbol, category, dateFrom, dateTo, minConfidence],
  )

  const summary = signalService.getSummary(signals)

  return (
    <div className="flex flex-col gap-5">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active Signals" value={String(summary.total)} icon={Radar} trend="flat" />
        <MetricCard label="Bullish Signals" value={String(summary.bullish)} icon={TrendingUp} trend="up" />
        <MetricCard label="Bearish Signals" value={String(summary.bearish)} icon={TrendingDown} trend="down" />
        <MetricCard label="Neutral Conditions" value={String(summary.neutral)} icon={Activity} trend="flat" />
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-border-subtle bg-surface-1 p-4">
        <select
          value={market}
          onChange={(e) => setMarket(e.target.value as typeof market)}
          className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 focus:border-accent focus:outline-none"
        >
          <option value="All">All Markets</option>
          <option value="India">India</option>
          <option value="US">US</option>
        </select>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Symbol (e.g. TCS)"
          className="w-40 rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-accent focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TechnicalSignalType | 'all')}
          className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 focus:border-accent focus:outline-none"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="From date"
          className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 focus:border-accent focus:outline-none"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="To date"
          className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 focus:border-accent focus:outline-none"
        />
        <label className="flex items-center gap-2 text-sm text-gray-400">
          Min confidence
          <input
            type="range"
            min={0}
            max={100}
            value={minConfidence}
            onChange={(e) => setMinConfidence(Number(e.target.value))}
          />
          <span className="w-9 text-gray-200">{minConfidence}%</span>
        </label>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-100">Signal History</h2>
        {signals.length === 0 ? (
          <EmptyState
            title="No signals match these filters"
            description="Try widening the market, date range, or confidence filters."
            icon={Radar}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {signals.map((signal) => (
              <div
                key={signal.id}
                className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-1 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-100">{signal.symbol}</span>
                    <StatusBadge direction={signal.direction} label={signal.label} />
                  </div>
                  <p className="mt-1 text-sm text-gray-400">{signal.description}</p>
                </div>
                <div className="flex flex-col items-start gap-0.5 text-xs text-gray-500 sm:items-end">
                  <span>{new Date(signal.timestamp).toLocaleString()}</span>
                  <span>Indicator: {signal.indicatorValue}</span>
                  <span>Confidence: {signal.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-gray-500">
        Overbought and oversold conditions are observed technical states, not automatic buy or sell recommendations.
      </p>
    </div>
  )
}
