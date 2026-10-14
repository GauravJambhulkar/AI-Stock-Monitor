export type Market = 'India' | 'US'

export type SignalDirection = 'bullish' | 'bearish' | 'neutral'

export interface Stock {
  symbol: string
  name: string
  market: Market
  sector: string
  currency: string
}

export interface MarketIndex {
  symbol: string
  name: string
  market: Market
  value: number
  changePercent: number
  lastUpdated: string
}

export interface HistoricalPrice {
  date: string
  price: number
  volume: number
}

export interface TechnicalIndicators {
  rsi14: number
  sma20: number
  sma50: number
  macd: number
  macdSignal: number
  macdHistogram: number
}

export interface StockQuote {
  symbol: string
  price: number
  changePercent: number
  changeAbsolute: number
  volume: number
  dayHigh: number
  dayLow: number
  lastUpdated: string
  indicators: TechnicalIndicators
  history: HistoricalPrice[]
}

export type TechnicalSignalType =
  | 'sma_bullish_crossover'
  | 'sma_bearish_crossover'
  | 'macd_bullish_crossover'
  | 'macd_bearish_crossover'
  | 'rsi_oversold'
  | 'rsi_overbought'
  | 'volume_spike'
  | 'bearish_momentum'

export interface TechnicalSignal {
  id: string
  symbol: string
  type: TechnicalSignalType
  direction: SignalDirection
  label: string
  description: string
  indicatorValue: number
  confidence: number
  timestamp: string
}
