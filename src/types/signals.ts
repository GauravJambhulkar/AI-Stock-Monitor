import type { Market, TechnicalSignalType } from './stock'

export interface SignalFilter {
  market: Market | 'All'
  symbol: string
  category: TechnicalSignalType | 'all'
  dateFrom: string | null
  dateTo: string | null
  minConfidence: number
}
