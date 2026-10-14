import { Loader2 } from 'lucide-react'

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-1 px-6 py-12 text-gray-400">
      <Loader2 size={22} className="animate-spin text-accent" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
