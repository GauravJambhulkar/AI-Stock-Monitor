export type AlertCondition =
  | 'price_above'
  | 'price_below'
  | 'change_percent_above'
  | 'rsi_below'
  | 'rsi_above'

export interface AlertTriggerEvent {
  id: string
  timestamp: string
  valueAtTrigger: number
}

export interface PriceAlert {
  id: string
  symbol: string
  condition: AlertCondition
  threshold: number
  enabled: boolean
  createdAt: string
  triggerHistory: AlertTriggerEvent[]
}

export interface ActivityEvent {
  id: string
  type: 'signal_generated' | 'alert_triggered' | 'watchlist_added' | 'portfolio_updated'
  message: string
  timestamp: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
