import { getStockQuote } from '@/data/mockStocks'
import type { AlertCondition, PriceAlert } from '@/types/alerts'

const STORAGE_KEY = 'stockpulse.alerts'

function readAlerts(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PriceAlert[]) : []
  } catch {
    return []
  }
}

function writeAlerts(alerts: PriceAlert[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}

/**
 * Simulated, browser-local alert evaluation. This does not run in the
 * background when the browser is closed; it only evaluates against
 * current mock quotes while the app is open.
 */
export const alertService = {
  getAlerts(): PriceAlert[] {
    return readAlerts()
  },

  createAlert(symbol: string, condition: AlertCondition, threshold: number): PriceAlert[] {
    const alerts = readAlerts()
    const alert: PriceAlert = {
      id: `alert-${Date.now()}`,
      symbol,
      condition,
      threshold,
      enabled: true,
      createdAt: new Date().toISOString(),
      triggerHistory: [],
    }
    const next = [alert, ...alerts]
    writeAlerts(next)
    return next
  },

  toggleAlert(id: string): PriceAlert[] {
    const next = readAlerts().map((alert) =>
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert,
    )
    writeAlerts(next)
    return next
  },

  deleteAlert(id: string): PriceAlert[] {
    const next = readAlerts().filter((alert) => alert.id !== id)
    writeAlerts(next)
    return next
  },

  /** Evaluates enabled alerts against current simulated quotes. */
  evaluateAlerts(): PriceAlert[] {
    const alerts = readAlerts()
    const next = alerts.map((alert) => {
      if (!alert.enabled) return alert
      const quote = getStockQuote(alert.symbol)
      const value =
        alert.condition === 'price_above' || alert.condition === 'price_below'
          ? quote.price
          : alert.condition === 'change_percent_above'
            ? quote.changePercent
            : quote.indicators.rsi14

      const triggered =
        (alert.condition === 'price_above' && value > alert.threshold) ||
        (alert.condition === 'price_below' && value < alert.threshold) ||
        (alert.condition === 'change_percent_above' && value > alert.threshold) ||
        (alert.condition === 'rsi_below' && value < alert.threshold) ||
        (alert.condition === 'rsi_above' && value > alert.threshold)

      if (!triggered) return alert
      const alreadyTriggeredToday = alert.triggerHistory.some(
        (event) => event.timestamp.slice(0, 10) === new Date().toISOString().slice(0, 10),
      )
      if (alreadyTriggeredToday) return alert

      return {
        ...alert,
        triggerHistory: [
          { id: `trigger-${Date.now()}`, timestamp: new Date().toISOString(), valueAtTrigger: value },
          ...alert.triggerHistory,
        ],
      }
    })
    writeAlerts(next)
    return next
  },
}
