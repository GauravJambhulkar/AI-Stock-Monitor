import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Market } from '@/types/stock'

export type MarketFilter = Market | 'All'

interface MarketContextValue {
  market: MarketFilter
  setMarket: (market: MarketFilter) => void
}

const MarketContext = createContext<MarketContextValue | undefined>(undefined)

export function MarketProvider({ children }: { children: ReactNode }) {
  const [market, setMarket] = useState<MarketFilter>('All')
  return <MarketContext.Provider value={{ market, setMarket }}>{children}</MarketContext.Provider>
}

export function useMarket(): MarketContextValue {
  const ctx = useContext(MarketContext)
  if (!ctx) throw new Error('useMarket must be used within a MarketProvider')
  return ctx
}
