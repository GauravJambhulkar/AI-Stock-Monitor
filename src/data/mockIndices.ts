import type { MarketIndex } from '@/types/stock'
import { createSeededRandom, hashStringToSeed } from '@/utils/random'

const INDEX_DEFINITIONS: Array<Pick<MarketIndex, 'symbol' | 'name' | 'market'> & { base: number }> = [
  { symbol: 'NIFTY50', name: 'NIFTY 50', market: 'India', base: 24850 },
  { symbol: 'SENSEX', name: 'SENSEX', market: 'India', base: 81550 },
  { symbol: 'NASDAQ', name: 'NASDAQ Composite', market: 'US', base: 18300 },
  { symbol: 'SPX', name: 'S&P 500', market: 'US', base: 5620 },
]

export function getMarketIndices(): MarketIndex[] {
  const now = new Date().toISOString()
  return INDEX_DEFINITIONS.map((def) => {
    const random = createSeededRandom(hashStringToSeed(def.symbol + new Date().toDateString()))
    const changePercent = Math.round((random() - 0.45) * 4 * 100) / 100
    const value = Math.round(def.base * (1 + changePercent / 100) * 100) / 100
    return {
      symbol: def.symbol,
      name: def.name,
      market: def.market,
      value,
      changePercent,
      lastUpdated: now,
    }
  })
}
