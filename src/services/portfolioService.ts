import { INITIAL_HOLDINGS } from '@/data/mockPortfolio'
import { getStock, getStockQuote } from '@/data/mockStocks'
import type { PortfolioHolding, PortfolioHoldingView } from '@/types/portfolio'

const STORAGE_KEY = 'stockpulse.portfolio.holdings'

function readHoldings(): PortfolioHolding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_HOLDINGS
    return JSON.parse(raw) as PortfolioHolding[]
  } catch {
    return INITIAL_HOLDINGS
  }
}

function writeHoldings(holdings: PortfolioHolding[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings))
}

export const portfolioService = {
  getHoldings(): PortfolioHolding[] {
    return readHoldings()
  },

  getHoldingViews(): PortfolioHoldingView[] {
    return readHoldings().map((holding) => {
      const quote = getStockQuote(holding.symbol)
      const investedValue = holding.quantity * holding.buyPrice
      const currentValue = holding.quantity * quote.price
      const gainLoss = currentValue - investedValue
      return {
        ...holding,
        currentPrice: quote.price,
        investedValue,
        currentValue,
        gainLoss,
        gainLossPercent: investedValue === 0 ? 0 : (gainLoss / investedValue) * 100,
        sector: getStock(holding.symbol)?.sector ?? 'Unknown',
      }
    })
  },

  getSummary() {
    const views = portfolioService.getHoldingViews()
    const investedValue = views.reduce((acc, v) => acc + v.investedValue, 0)
    const currentValue = views.reduce((acc, v) => acc + v.currentValue, 0)
    const gainLoss = currentValue - investedValue
    return {
      investedValue,
      currentValue,
      gainLoss,
      gainLossPercent: investedValue === 0 ? 0 : (gainLoss / investedValue) * 100,
    }
  },

  addHolding(holding: Omit<PortfolioHolding, 'id'>): PortfolioHolding[] {
    const holdings = readHoldings()
    const next = [...holdings, { ...holding, id: `h-${Date.now()}` }]
    writeHoldings(next)
    return next
  },

  removeHolding(id: string): PortfolioHolding[] {
    const next = readHoldings().filter((h) => h.id !== id)
    writeHoldings(next)
    return next
  },
}
