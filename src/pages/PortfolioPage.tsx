import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Trash2, Wallet } from 'lucide-react'
import { AllocationChart } from '@/components/charts/AllocationChart'
import { EmptyState } from '@/components/common/EmptyState'
import { MetricCard } from '@/components/common/MetricCard'
import { useToast } from '@/context/ToastContext'
import { portfolioService } from '@/services/portfolioService'
import { stockService } from '@/services/stockService'
import { formatNumber, formatPercent } from '@/utils/formatters'

export function PortfolioPage() {
  const { showToast } = useToast()
  const [version, setVersion] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [symbol, setSymbol] = useState('RELIANCE')
  const [quantity, setQuantity] = useState('1')
  const [buyPrice, setBuyPrice] = useState('')

  const holdings = portfolioService.getHoldingViews()
  const summary = portfolioService.getSummary()

  const allocation = useMemo(() => {
    const bySector = new Map<string, number>()
    holdings.forEach((h) => bySector.set(h.sector, (bySector.get(h.sector) ?? 0) + h.currentValue))
    return Array.from(bySector.entries()).map(([name, value]) => ({ name, value }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdings, version])

  const handleAdd = (event: FormEvent) => {
    event.preventDefault()
    const qty = Number(quantity)
    const price = Number(buyPrice) || stockService.getQuote(symbol).price
    if (!qty || qty <= 0) return
    portfolioService.addHolding({ symbol, quantity: qty, buyPrice: price })
    setShowModal(false)
    setQuantity('1')
    setBuyPrice('')
    setVersion((v) => v + 1)
    showToast(`Added ${qty} shares of ${symbol} to portfolio`)
  }

  const handleRemove = (id: string, label: string) => {
    portfolioService.removeHolding(id)
    setVersion((v) => v + 1)
    showToast(`Removed ${label} from portfolio`, 'info')
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Portfolio Value" value={formatNumber(summary.currentValue)} icon={Wallet} trend="flat" changeLabel="Simulated" />
        <MetricCard label="Invested Amount" value={formatNumber(summary.investedValue)} icon={Wallet} trend="flat" changeLabel="Simulated" />
        <MetricCard
          label="Unrealized P/L"
          value={formatNumber(summary.gainLoss)}
          icon={Wallet}
          trend={summary.gainLoss >= 0 ? 'up' : 'down'}
          changeLabel="Simulated"
        />
        <MetricCard
          label="Return %"
          value={formatPercent(summary.gainLossPercent)}
          icon={Wallet}
          trend={summary.gainLossPercent >= 0 ? 'up' : 'down'}
          changeLabel="Simulated"
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-xl border border-border-subtle bg-surface-1 p-4 xl:col-span-1">
          <h2 className="mb-2 text-sm font-semibold text-gray-200">Asset Allocation</h2>
          {allocation.length > 0 ? <AllocationChart data={allocation} /> : <EmptyState title="No holdings yet" />}
        </div>

        <div className="xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-200">Holdings</h2>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
            >
              <Plus size={14} /> Add Holding
            </button>
          </div>

          {holdings.length === 0 ? (
            <EmptyState title="No holdings yet" description="Add a hypothetical holding to see simulated portfolio analytics." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border-subtle">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-2 text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Symbol</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Buy Price</th>
                    <th className="px-4 py-3 text-right">Current Value</th>
                    <th className="px-4 py-3 text-right">Gain/Loss</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.id} className="border-b border-border-subtle/60 bg-surface-1 last:border-0 hover:bg-surface-2">
                      <td className="px-4 py-3 font-semibold text-gray-100">{holding.symbol}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{holding.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{formatNumber(holding.buyPrice)}</td>
                      <td className="px-4 py-3 text-right text-gray-100">{formatNumber(holding.currentValue)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${holding.gainLoss >= 0 ? 'text-bull' : 'text-bear'}`}>
                        {formatNumber(holding.gainLoss)} ({formatPercent(holding.gainLossPercent)})
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemove(holding.id, holding.symbol)}
                          aria-label={`Remove ${holding.symbol} holding`}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-3 hover:text-bear"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <p className="text-xs text-gray-500">All figures reflect hypothetical holdings and simulated prices.</p>

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleAdd} className="w-full max-w-sm rounded-xl border border-border-subtle bg-surface-1 p-5">
            <h2 className="mb-4 text-base font-semibold text-gray-100">Add Holding</h2>
            <label className="mb-3 block text-sm text-gray-400">
              Symbol
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-gray-100 focus:border-accent focus:outline-none"
              >
                {stockService.listStocks().map((stock) => (
                  <option key={stock.symbol} value={stock.symbol}>
                    {stock.symbol} - {stock.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="mb-3 block text-sm text-gray-400">
              Quantity
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-gray-100 focus:border-accent focus:outline-none"
              />
            </label>
            <label className="mb-4 block text-sm text-gray-400">
              Buy Price (leave blank for current simulated price)
              <input
                type="number"
                min={0}
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder={formatNumber(stockService.getQuote(symbol).price)}
                className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-accent focus:outline-none"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-border-subtle px-3 py-2 text-sm text-gray-300 hover:bg-surface-2"
              >
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
                Add Holding
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
