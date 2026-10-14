import {
  AlertTriangle,
  Bot,
  Briefcase,
  LayoutDashboard,
  LineChart,
  Radar,
  Settings,
  Star,
  TrendingUp,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/signals', label: 'Market Signals', icon: Radar },
  { to: '/explorer', label: 'Stock Explorer', icon: LineChart },
  { to: '/ai-analyst', label: 'AI Stock Analyst', icon: Bot },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [lastUpdated, setLastUpdated] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border-subtle bg-surface-1 transition-transform lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <TrendingUp size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight text-gray-50">StockPulse AI</p>
              <p className="text-xs leading-tight text-gray-500">Market Intelligence</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-surface-2 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-gray-400 hover:bg-surface-2 hover:text-gray-100'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="m-3 rounded-lg border border-border-subtle bg-surface-2 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Provider</span>
            <span className="font-medium text-gray-200">Demo Data</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-gray-400">Status</span>
            <span className="flex items-center gap-1.5 font-medium text-warn">
              <span className="h-1.5 w-1.5 rounded-full bg-warn" />
              Simulated
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-gray-400">Updated</span>
            <span className="font-medium text-gray-200">{lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </aside>
    </>
  )
}
