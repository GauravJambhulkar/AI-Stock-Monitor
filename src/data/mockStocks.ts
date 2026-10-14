import type { HistoricalPrice, Stock, StockQuote } from '@/types/stock'
import { macd, relativeStrengthIndex, simpleMovingAverage } from '@/utils/calculations'
import { createSeededRandom, hashStringToSeed } from '@/utils/random'

export const STOCK_UNIVERSE: Stock[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', market: 'India', sector: 'Energy', currency: 'INR' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', market: 'India', sector: 'IT Services', currency: 'INR' },
  { symbol: 'INFY', name: 'Infosys Ltd', market: 'India', sector: 'IT Services', currency: 'INR' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', market: 'India', sector: 'Banking', currency: 'INR' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', market: 'India', sector: 'Banking', currency: 'INR' },
  { symbol: 'ITC', name: 'ITC Ltd', market: 'India', sector: 'Consumer Goods', currency: 'INR' },
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'US', sector: 'Technology', currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'US', sector: 'Technology', currency: 'USD' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', market: 'US', sector: 'Semiconductors', currency: 'USD' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'US', sector: 'Technology', currency: 'USD' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'US', sector: 'Consumer Discretionary', currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla Inc.', market: 'US', sector: 'Automotive', currency: 'USD' },
]

const BASE_PRICES: Record<string, number> = {
  RELIANCE: 2950,
  TCS: 4120,
  INFY: 1850,
  HDFCBANK: 1680,
  ICICIBANK: 1240,
  ITC: 465,
  AAPL: 227,
  MSFT: 418,
  NVDA: 132,
  GOOGL: 176,
  AMZN: 198,
  TSLA: 248,
}

const TRADING_DAYS = 260

/** Generates a deterministic daily OHLC-ish history using a seeded random walk. */
function generateHistory(symbol: string): HistoricalPrice[] {
  const random = createSeededRandom(hashStringToSeed(symbol))
  const basePrice = BASE_PRICES[symbol] ?? 100
  const raw: { date: string; price: number; volume: number }[] = []
  let price = basePrice * 0.82
  const today = new Date()

  for (let i = TRADING_DAYS; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const drift = 0.0006
    const volatility = (random() - 0.49) * 0.018
    price = Math.max(price * (1 + drift + volatility), 1)
    const volume = Math.round(1_500_000 + random() * 8_000_000)
    raw.push({ date: date.toISOString().slice(0, 10), price, volume })
  }

  // Scale the whole series so it ends exactly at the configured base price,
  // while preserving the shape and relative day-to-day moves of the walk.
  const scale = basePrice / raw[raw.length - 1].price
  return raw.map((point) => ({
    ...point,
    price: Math.round(point.price * scale * 100) / 100,
  }))
}

const historyCache = new Map<string, HistoricalPrice[]>()

export function getStockHistory(symbol: string): HistoricalPrice[] {
  if (!historyCache.has(symbol)) {
    historyCache.set(symbol, generateHistory(symbol))
  }
  return historyCache.get(symbol) as HistoricalPrice[]
}

export function getStock(symbol: string): Stock | undefined {
  return STOCK_UNIVERSE.find((stock) => stock.symbol === symbol)
}

const quoteCache = new Map<string, StockQuote>()

export function getStockQuote(symbol: string): StockQuote {
  if (quoteCache.has(symbol)) return quoteCache.get(symbol) as StockQuote
  const history = getStockHistory(symbol)
  const prices = history.map((h) => h.price)
  const latest = history[history.length - 1]
  const previous = history[history.length - 2] ?? latest
  const changeAbsolute = Math.round((latest.price - previous.price) * 100) / 100
  const changePercent = Math.round((changeAbsolute / previous.price) * 10000) / 100

  const quote: StockQuote = {
    symbol,
    price: latest.price,
    changeAbsolute,
    changePercent,
    volume: latest.volume,
    dayHigh: Math.round(latest.price * 1.012 * 100) / 100,
    dayLow: Math.round(latest.price * 0.988 * 100) / 100,
    lastUpdated: new Date().toISOString(),
    indicators: {
      rsi14: Math.round(relativeStrengthIndex(prices) * 10) / 10,
      sma20: Math.round(simpleMovingAverage(prices, 20) * 100) / 100,
      sma50: Math.round(simpleMovingAverage(prices, 50) * 100) / 100,
      macd: Math.round(macd(prices).macd * 100) / 100,
      macdSignal: Math.round(macd(prices).signal * 100) / 100,
      macdHistogram: Math.round(macd(prices).histogram * 100) / 100,
    },
    history,
  }
  quoteCache.set(symbol, quote)
  return quote
}

export function getAllQuotes(): StockQuote[] {
  return STOCK_UNIVERSE.map((stock) => getStockQuote(stock.symbol))
}

export function searchStocks(query: string): Stock[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return STOCK_UNIVERSE
  return STOCK_UNIVERSE.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(normalized) ||
      stock.name.toLowerCase().includes(normalized),
  )
}
