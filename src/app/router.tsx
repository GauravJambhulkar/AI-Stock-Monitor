import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { OverviewPage } from '@/pages/OverviewPage'
import { WatchlistPage } from '@/pages/WatchlistPage'
import { MarketSignalsPage } from '@/pages/MarketSignalsPage'
import { StockExplorerPage } from '@/pages/StockExplorerPage'
import { AIAnalystPage } from '@/pages/AIAnalystPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { AlertsPage } from '@/pages/AlertsPage'
import { SettingsPage } from '@/pages/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'watchlist', element: <WatchlistPage /> },
      { path: 'signals', element: <MarketSignalsPage /> },
      { path: 'explorer', element: <StockExplorerPage /> },
      { path: 'ai-analyst', element: <AIAnalystPage /> },
      { path: 'portfolio', element: <PortfolioPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
