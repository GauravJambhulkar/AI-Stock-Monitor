import type { SignalDirection } from '@/types/stock'

const VARIANT_STYLES: Record<SignalDirection, string> = {
  bullish: 'bg-bull-soft text-green-300 border-bull/40',
  bearish: 'bg-bear-soft text-red-300 border-bear/40',
  neutral: 'bg-warn-soft text-amber-300 border-warn/40',
}

const VARIANT_LABEL: Record<SignalDirection, string> = {
  bullish: 'Bullish',
  bearish: 'Bearish',
  neutral: 'Neutral',
}

interface StatusBadgeProps {
  direction: SignalDirection
  label?: string
}

export function StatusBadge({ direction, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${VARIANT_STYLES[direction]}`}
    >
      {label ?? VARIANT_LABEL[direction]}
    </span>
  )
}
