import { Eye, Star, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/common/StatusBadge'
import { getStock } from '@/data/mockStocks'
import { formatCompactNumber, formatNumber, formatPercent } from '@/utils/formatters'
import type { StockQuote } from '@/types/stock'

export type StockTableAction = 'view' | 'add' | 'remove'

interface StockTableProps {
  quotes: StockQuote[]
  actions?: StockTableAction[]
  onAction?: (action: StockTableAction, symbol: string) => void
}

function signalDirectionFor(quote: StockQuote): 'bullish' | 'bearish' | 'neutral' {
  if (quote.indicators.sma20 > quote.indicators.sma50 && quote.indicators.macd > quote.indicators.macdSignal) {
    return 'bullish'
  }
  if (quote.indicators.sma20 < quote.indicators.sma50 && quote.indicators.macd < quote.indicators.macdSignal) {
    return 'bearish'
  }
  return 'neutral'
}

export function StockTable({ quotes, actions = ['view'], onAction }: StockTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border-subtle bg-surface-2 text-xs uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3 text-right">Last Price</th>
            <th className="px-4 py-3 text-right">Daily Change</th>
            <th className="px-4 py-3 text-right">Volume</th>
            <th className="px-4 py-3 text-right">RSI</th>
            <th className="px-4 py-3">Signal</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => {
            const stock = getStock(quote.symbol)
            const positive = quote.changePercent >= 0
            return (
              <tr key={quote.symbol} className="border-b border-border-subtle/60 bg-surface-1 last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3 font-semibold text-gray-100">{quote.symbol}</td>
                <td className="px-4 py-3 text-gray-400">{stock?.name ?? '—'}</td>
                <td className="px-4 py-3 text-right text-gray-100">{formatNumber(quote.price)}</td>
                <td className={`px-4 py-3 text-right font-medium ${positive ? 'text-bull' : 'text-bear'}`}>
                  {formatPercent(quote.changePercent)}
                </td>
                <td className="px-4 py-3 text-right text-gray-400">{formatCompactNumber(quote.volume)}</td>
                <td className="px-4 py-3 text-right text-gray-400">{quote.indicators.rsi14.toFixed(1)}</td>
                <td className="px-4 py-3">
                  <StatusBadge direction={signalDirectionFor(quote)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {actions.includes('view') && (
                      <Link
                        to={`/explorer?symbol=${quote.symbol}`}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-3 hover:text-gray-100"
                        aria-label={`View ${quote.symbol} details`}
                      >
                        <Eye size={15} />
                      </Link>
                    )}
                    {actions.includes('add') && (
                      <button
                        type="button"
                        onClick={() => onAction?.('add', quote.symbol)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-3 hover:text-accent"
                        aria-label={`Add ${quote.symbol} to watchlist`}
                      >
                        <Star size={15} />
                      </button>
                    )}
                    {actions.includes('remove') && (
                      <button
                        type="button"
                        onClick={() => onAction?.('remove', quote.symbol)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-3 hover:text-bear"
                        aria-label={`Remove ${quote.symbol} from watchlist`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
