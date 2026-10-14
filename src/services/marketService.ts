import { getMarketIndices } from '@/data/mockIndices'
import type { Market, MarketIndex } from '@/types/stock'

export const marketService = {
  getIndices(market: Market | 'All' = 'All'): MarketIndex[] {
    const indices = getMarketIndices()
    if (market === 'All') return indices
    return indices.filter((index) => index.market === market)
  },
}
