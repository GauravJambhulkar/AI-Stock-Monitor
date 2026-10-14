import { useEffect, useState, type FormEvent } from 'react'
import { AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { useToast } from '@/context/ToastContext'
import { alertService } from '@/services/alertService'
import { stockService } from '@/services/stockService'
import type { AlertCondition } from '@/types/alerts'

const CONDITION_LABELS: Record<AlertCondition, string> = {
  price_above: 'Price above',
  price_below: 'Price below',
  change_percent_above: 'Daily % change above',
  rsi_below: 'RSI below',
  rsi_above: 'RSI above',
}

export function AlertsPage() {
  const { showToast } = useToast()
  const [alerts, setAlerts] = useState(() => alertService.getAlerts())
  const [symbol, setSymbol] = useState('RELIANCE')
  const [condition, setCondition] = useState<AlertCondition>('price_above')
  const [threshold, setThreshold] = useState('')

  useEffect(() => {
    setAlerts(alertService.evaluateAlerts())
  }, [])

  const handleCreate = (event: FormEvent) => {
    event.preventDefault()
    const value = Number(threshold)
    if (!threshold || Number.isNaN(value)) return
    setAlerts(alertService.createAlert(symbol, condition, value))
    setThreshold('')
    showToast(`Alert created for ${symbol}`)
  }

  const handleToggle = (id: string) => setAlerts(alertService.toggleAlert(id))
  const handleDelete = (id: string) => {
    setAlerts(alertService.deleteAlert(id))
    showToast('Alert deleted', 'info')
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-border-subtle bg-surface-1 p-4"
      >
        <label className="text-sm text-gray-400">
          Symbol
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="mt-1 block rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-100 focus:border-accent focus:outline-none"
          >
            {stockService.listStocks().map((stock) => (
              <option key={stock.symbol} value={stock.symbol}>
                {stock.symbol}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-gray-400">
          Condition
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as AlertCondition)}
            className="mt-1 block rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-100 focus:border-accent focus:outline-none"
          >
            {Object.entries(CONDITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-gray-400">
          Threshold
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="mt-1 block w-32 rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-100 focus:border-accent focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          <Plus size={14} /> Create Alert
        </button>
      </form>

      {alerts.length === 0 ? (
        <EmptyState
          title="No alerts configured"
          description="Create a simulated alert above to get notified when a condition is met while the app is open."
          icon={AlertTriangle}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-xl border border-border-subtle bg-surface-1 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-100">{alert.symbol}</span>
                    <span className="text-sm text-gray-400">
                      {CONDITION_LABELS[alert.condition]} {alert.threshold}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Created {new Date(alert.createdAt).toLocaleDateString()} &middot; {alert.triggerHistory.length} triggers
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(alert.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      alert.enabled ? 'bg-bull-soft text-green-300' : 'bg-surface-2 text-gray-400'
                    }`}
                  >
                    {alert.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(alert.id)}
                    aria-label={`Delete alert for ${alert.symbol}`}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-2 hover:text-bear"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {alert.triggerHistory.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                  {alert.triggerHistory.slice(0, 3).map((trigger) => (
                    <span key={trigger.id} className="rounded-full bg-surface-2 px-2 py-0.5">
                      {new Date(trigger.timestamp).toLocaleString()} &middot; {trigger.valueAtTrigger.toFixed(2)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Alerts are evaluated against simulated quotes only while this browser tab is open; no background monitoring runs when the browser is closed.
      </p>
    </div>
  )
}
