export interface PortfolioHolding {
  id: string
  symbol: string
  quantity: number
  buyPrice: number
}

export interface PortfolioHoldingView extends PortfolioHolding {
  currentPrice: number
  investedValue: number
  currentValue: number
  gainLoss: number
  gainLossPercent: number
  sector: string
}

export interface WatchlistItem {
  symbol: string
  addedAt: string
}
