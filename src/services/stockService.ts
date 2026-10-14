import { getAllQuotes, getStock, getStockHistory, getStockQuote, searchStocks, STOCK_UNIVERSE } from '@/data/mockStocks'
import type { HistoricalPrice, Stock, StockQuote } from '@/types/stock'

export type ChartRange = '1D' | '1W' | '1M' | '3M' | '1Y'

const RANGE_TO_DAYS: Record<ChartRange, number> = {
  '1D': 2,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 260,
}

/**
 * Centralized read layer for stock reference data and simulated quotes.
 * This is the seam to swap for real ASP.NET Core / market-data API calls.
 */
export const stockService = {
  listStocks(): Stock[] {
    return STOCK_UNIVERSE
  },

  search(query: string): Stock[] {
    return searchStocks(query)
  },

  getStock(symbol: string): Stock | undefined {
    return getStock(symbol)
  },

  getQuote(symbol: string): StockQuote {
    return getStockQuote(symbol)
  },

  getQuotes(symbols?: string[]): StockQuote[] {
    const all = getAllQuotes()
    if (!symbols) return all
    return all.filter((quote) => symbols.includes(quote.symbol))
  },

  getHistoryForRange(symbol: string, range: ChartRange): HistoricalPrice[] {
    const history = getStockHistory(symbol)
    const days = RANGE_TO_DAYS[range]
    return history.slice(-days)
  },
}
