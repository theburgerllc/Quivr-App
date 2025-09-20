'use client'
import { useEffect, useRef } from 'react'
import Paywall from './Paywall'

export default function PaywallOverlay({
  open = true,
  onClose,
}: {
  open?: boolean
  onClose?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && onClose) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 z-20 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
      <div
        ref={ref}
        className="relative z-10 w-full max-w-md rounded-2xl border bg-white shadow-lg p-5"
      >
        <header className="mb-2">
          <h3 className="text-lg font-semibold">Unlock Premium Filters</h3>
          <p className="text-sm text-neutral-600">
            Distance · Verified-only · Tag search
          </p>
        </header>
        <ul className="text-sm list-disc pl-5 space-y-1 mb-3">
          <li>See closer matches first with distance</li>
          <li>Filter to verified profiles only</li>
          <li>Search by interests (tags)</li>
        </ul>
        <Paywall />
        <button className="mt-3 text-sm underline" onClick={onClose}>
          Not now
        </button>
      </div>
    </div>
  )
}
