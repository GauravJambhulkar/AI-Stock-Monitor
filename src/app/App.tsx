import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { MarketProvider } from '@/context/MarketContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'

export function App() {
  return (
    <ThemeProvider>
      <MarketProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </MarketProvider>
    </ThemeProvider>
  )
}
