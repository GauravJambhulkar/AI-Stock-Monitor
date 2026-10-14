import { getTechnicalSignals } from '@/data/mockSignals'
import type { SignalFilter } from '@/types/signals'
import { getStock } from '@/data/mockStocks'
import type { TechnicalSignal } from '@/types/stock'

/**
 * Signal evaluation is isolated behind this service so the mock rule-based
 * implementation can later be swapped for real indicator calculations
 * served by the ASP.NET Core backend without changing consuming pages.
 */
export const signalService = {
  getAllSignals(): TechnicalSignal[] {
    return getTechnicalSignals()
  },

  getSignalsFiltered(filter: Partial<SignalFilter>): TechnicalSignal[] {
    let signals = getTechnicalSignals()

    if (filter.market && filter.market !== 'All') {
      signals = signals.filter((signal) => getStock(signal.symbol)?.market === filter.market)
    }
    if (filter.symbol) {
      const normalized = filter.symbol.trim().toUpperCase()
      signals = signals.filter((signal) => signal.symbol.includes(normalized))
    }
    if (filter.category && filter.category !== 'all') {
      signals = signals.filter((signal) => signal.type === filter.category)
    }
    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom).getTime()
      signals = signals.filter((signal) => new Date(signal.timestamp).getTime() >= from)
    }
    if (filter.dateTo) {
      const to = new Date(filter.dateTo).getTime()
      signals = signals.filter((signal) => new Date(signal.timestamp).getTime() <= to)
    }
    if (filter.minConfidence) {
      signals = signals.filter((signal) => signal.confidence >= filter.minConfidence!)
    }

    return signals
  },

  getSignalsForSymbol(symbol: string): TechnicalSignal[] {
    return getTechnicalSignals().filter((signal) => signal.symbol === symbol)
  },

  getSummary(signals: TechnicalSignal[] = getTechnicalSignals()) {
    return {
      total: signals.length,
      bullish: signals.filter((s) => s.direction === 'bullish').length,
      bearish: signals.filter((s) => s.direction === 'bearish').length,
      neutral: signals.filter((s) => s.direction === 'neutral').length,
    }
  },
}
