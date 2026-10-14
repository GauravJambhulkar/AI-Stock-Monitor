import { getAllQuotes } from '@/data/mockStocks'
import type { TechnicalSignal, TechnicalSignalType } from '@/types/stock'
import { createSeededRandom, hashStringToSeed } from '@/utils/random'

const SIGNAL_META: Record<
  TechnicalSignalType,
  { label: string; direction: TechnicalSignal['direction']; describe: (symbol: string, value: number) => string }
> = {
  sma_bullish_crossover: {
    label: 'Bullish SMA Crossover',
    direction: 'bullish',
    describe: (symbol) => `${symbol}'s 20-day SMA has crossed above its 50-day SMA, an observed bullish trend condition.`,
  },
  sma_bearish_crossover: {
    label: 'Bearish SMA Crossover',
    direction: 'bearish',
    describe: (symbol) => `${symbol}'s 20-day SMA has crossed below its 50-day SMA, an observed bearish trend condition.`,
  },
  macd_bullish_crossover: {
    label: 'MACD Bullish Crossover',
    direction: 'bullish',
    describe: (symbol) => `${symbol}'s MACD line has crossed above its signal line.`,
  },
  macd_bearish_crossover: {
    label: 'MACD Bearish Crossover',
    direction: 'bearish',
    describe: (symbol) => `${symbol}'s MACD line has crossed below its signal line.`,
  },
  rsi_oversold: {
    label: 'RSI Oversold',
    direction: 'bullish',
    describe: (symbol, value) => `${symbol}'s 14-day RSI is at ${value.toFixed(1)}, below the 30 oversold threshold.`,
  },
  rsi_overbought: {
    label: 'RSI Overbought',
    direction: 'bearish',
    describe: (symbol, value) => `${symbol}'s 14-day RSI is at ${value.toFixed(1)}, above the 70 overbought threshold.`,
  },
  volume_spike: {
    label: 'Volume Spike',
    direction: 'neutral',
    describe: (symbol) => `${symbol} traded at significantly higher volume than its recent average.`,
  },
  bearish_momentum: {
    label: 'Bearish Momentum',
    direction: 'bearish',
    describe: (symbol) => `${symbol} is showing weakening price momentum over recent sessions.`,
  },
}

/** Derives a deterministic set of simulated technical signals from mock indicator values. */
export function getTechnicalSignals(): TechnicalSignal[] {
  const quotes = getAllQuotes()
  const signals: TechnicalSignal[] = []

  quotes.forEach((quote) => {
    const random = createSeededRandom(hashStringToSeed(`signal-${quote.symbol}`))
    const types: Array<{ type: TechnicalSignalType; value: number; hoursAgo: number }> = []

    if (quote.indicators.rsi14 < 35) {
      types.push({ type: 'rsi_oversold', value: quote.indicators.rsi14, hoursAgo: random() * 48 })
    }
    if (quote.indicators.rsi14 > 65) {
      types.push({ type: 'rsi_overbought', value: quote.indicators.rsi14, hoursAgo: random() * 48 })
    }
    if (quote.indicators.sma20 > quote.indicators.sma50) {
      types.push({ type: 'sma_bullish_crossover', value: quote.indicators.sma20, hoursAgo: random() * 72 })
    } else {
      types.push({ type: 'sma_bearish_crossover', value: quote.indicators.sma20, hoursAgo: random() * 72 })
    }
    if (quote.indicators.macd > quote.indicators.macdSignal) {
      types.push({ type: 'macd_bullish_crossover', value: quote.indicators.macdHistogram, hoursAgo: random() * 60 })
    } else {
      types.push({ type: 'macd_bearish_crossover', value: quote.indicators.macdHistogram, hoursAgo: random() * 60 })
    }
    if (random() > 0.72) {
      types.push({ type: 'volume_spike', value: quote.volume, hoursAgo: random() * 24 })
    }
    if (quote.changePercent < -1.5) {
      types.push({ type: 'bearish_momentum', value: quote.changePercent, hoursAgo: random() * 36 })
    }

    types.forEach(({ type, value, hoursAgo }, index) => {
      const meta = SIGNAL_META[type]
      const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
      signals.push({
        id: `${quote.symbol}-${type}-${index}`,
        symbol: quote.symbol,
        type,
        direction: meta.direction,
        label: meta.label,
        description: meta.describe(quote.symbol, value),
        indicatorValue: Math.round(value * 100) / 100,
        confidence: Math.round((55 + random() * 40) * 10) / 10,
        timestamp,
      })
    })
  })

  return signals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}
