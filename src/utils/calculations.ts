export function simpleMovingAverage(values: number[], period: number): number {
  if (values.length === 0) return 0
  const slice = values.slice(-period)
  const sum = slice.reduce((acc, v) => acc + v, 0)
  return sum / slice.length
}

export function relativeStrengthIndex(values: number[], period = 14): number {
  if (values.length < period + 1) return 50
  const slice = values.slice(-(period + 1))
  let gains = 0
  let losses = 0
  for (let i = 1; i < slice.length; i += 1) {
    const diff = slice[i] - slice[i - 1]
    if (diff >= 0) gains += diff
    else losses += Math.abs(diff)
  }
  if (losses === 0) return 100
  const rs = gains / losses
  return 100 - 100 / (1 + rs)
}

function exponentialMovingAverage(values: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const ema: number[] = []
  values.forEach((value, index) => {
    if (index === 0) {
      ema.push(value)
    } else {
      ema.push(value * k + ema[index - 1] * (1 - k))
    }
  })
  return ema
}

export function macd(values: number[]): { macd: number; signal: number; histogram: number } {
  if (values.length < 26) return { macd: 0, signal: 0, histogram: 0 }
  const ema12 = exponentialMovingAverage(values, 12)
  const ema26 = exponentialMovingAverage(values, 26)
  const macdLine = ema12.map((v, i) => v - ema26[i])
  const signalLine = exponentialMovingAverage(macdLine, 9)
  const last = macdLine.length - 1
  return {
    macd: macdLine[last],
    signal: signalLine[last],
    histogram: macdLine[last] - signalLine[last],
  }
}
