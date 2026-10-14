import type { ActivityEvent } from '@/types/alerts'

const RAW_EVENTS: Array<Pick<ActivityEvent, 'type' | 'message'> & { hoursAgo: number }> = [
  { type: 'signal_generated', message: 'Bullish MACD crossover detected for NVDA', hoursAgo: 1.5 },
  { type: 'alert_triggered', message: 'Price alert triggered: AAPL crossed above $225', hoursAgo: 3 },
  { type: 'watchlist_added', message: 'HDFCBANK added to watchlist', hoursAgo: 6 },
  { type: 'portfolio_updated', message: 'Portfolio holding updated: TCS quantity changed to 10', hoursAgo: 10 },
  { type: 'signal_generated', message: 'RSI oversold condition observed for INFY', hoursAgo: 18 },
  { type: 'alert_triggered', message: 'Daily change alert triggered: TSLA moved -3.2%', hoursAgo: 26 },
]

export function getActivityFeed(): ActivityEvent[] {
  return RAW_EVENTS.map((event, index) => ({
    id: `activity-${index}`,
    type: event.type,
    message: event.message,
    timestamp: new Date(Date.now() - event.hoursAgo * 60 * 60 * 1000).toISOString(),
  }))
}
