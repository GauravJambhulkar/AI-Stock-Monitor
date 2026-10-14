import { getStockQuote } from '@/data/mockStocks'
import { signalService } from '@/services/signalService'
import { watchlistService } from '@/services/watchlistService'

/**
 * Mock assistant service. Returns predefined, context-aware explanations
 * derived from local mock indicator data. Designed so the same call shape
 * (`ask(prompt, symbol)`) can later be swapped for a call to an ASP.NET
 * Core endpoint that integrates with a real LLM.
 */
function describeIndicators(symbol: string): string {
  const quote = getStockQuote(symbol)
  const { rsi14, sma20, sma50, macd: macdLine, macdSignal } = quote.indicators
  const trend = sma20 > sma50 ? 'above' : 'below'
  const macdState = macdLine > macdSignal ? 'above' : 'below'
  const rsiState = rsi14 < 30 ? 'in oversold territory' : rsi14 > 70 ? 'in overbought territory' : 'in a neutral range'

  return `For ${symbol} (simulated data): price is ${quote.price} with a ${quote.changePercent >= 0 ? 'gain' : 'decline'} of ${quote.changePercent.toFixed(2)}% today. The 20-day SMA is currently ${trend} the 50-day SMA, suggesting a ${trend === 'above' ? 'bullish' : 'bearish'} trend bias. The MACD line is ${macdState} its signal line. RSI(14) is ${rsi14.toFixed(1)}, which is ${rsiState}. These are observed technical conditions, not predictions or recommendations.`
}

function compareStocks(symbolA: string, symbolB: string): string {
  const a = getStockQuote(symbolA)
  const b = getStockQuote(symbolB)
  return `Comparing ${symbolA} and ${symbolB} (simulated indicators): ${symbolA} RSI ${a.indicators.rsi14.toFixed(1)} vs ${symbolB} RSI ${b.indicators.rsi14.toFixed(1)}. ${symbolA} is ${a.changePercent >= 0 ? 'up' : 'down'} ${Math.abs(a.changePercent).toFixed(2)}% today while ${symbolB} is ${b.changePercent >= 0 ? 'up' : 'down'} ${Math.abs(b.changePercent).toFixed(2)}%. Neither comparison implies a trading recommendation; it only reflects current simulated technical readings.`
}

function explainIndicatorsGeneral(): string {
  return 'RSI (Relative Strength Index) measures how fast and how much a price has moved recently on a 0-100 scale; readings below 30 are often labeled "oversold" and above 70 "overbought", meaning price moved sharply in one direction, not that a reversal is guaranteed. MACD compares two moving averages (12-day and 26-day) to gauge momentum; when the MACD line crosses above its signal line, it is often described as bullish momentum, and below as bearish momentum. Both are lagging, rules-based indicators derived from past prices, and should not be treated as certain predictions of future performance.'
}

function summarizeWatchlist(): string {
  const watchlist = watchlistService.getWatchlist()
  const signals = signalService.getAllSignals().filter((s) => watchlist.some((w) => w.symbol === s.symbol))
  const bullish = signals.filter((s) => s.direction === 'bullish').length
  const bearish = signals.filter((s) => s.direction === 'bearish').length
  return `Across your watchlist (${watchlist.length} symbols), there are currently ${bullish} bullish-leaning and ${bearish} bearish-leaning simulated technical signals. This is a snapshot of rule-based conditions in mock data, not investment advice.`
}

function explainLimitations(): string {
  return 'These technical signals are derived entirely from simulated/mock price data for this prototype, not live market feeds. Even with real data, indicators like RSI, SMA and MACD are backward-looking and can produce false signals, lag sudden news-driven moves, and perform differently across market regimes. They should be combined with broader research and risk management, not used as a sole basis for decisions.'
}

export const aiAnalystService = {
  ask(prompt: string, symbol?: string): string {
    const lower = prompt.toLowerCase()

    if (lower.includes('compare')) {
      const symbols = lower.match(/[A-Z]{2,10}/g)
      if (symbols && symbols.length >= 2) return compareStocks(symbols[0], symbols[1])
      return compareStocks('TCS', 'INFY')
    }
    if (lower.includes('limitation')) return explainLimitations()
    if (lower.includes('watchlist')) return summarizeWatchlist()
    if (lower.includes('rsi') && lower.includes('macd') && lower.includes('simple')) {
      return explainIndicatorsGeneral()
    }
    if (lower.includes('signal') || lower.includes('explain')) {
      return describeIndicators(symbol ?? 'RELIANCE')
    }
    return `${describeIndicators(symbol ?? 'RELIANCE')} (Mock assistant: this response is generated from predefined templates for this prototype.)`
  },
}
