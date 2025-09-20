'use client'
import { useEffect, useState } from 'react'

export default function Settings() {
  const [status, setStatus] = useState<'free' | 'premium'>('free')
  const [customerId, setCustomerId] = useState<string | undefined>()

  useEffect(() => {
    ;(async () => {
      const r = await fetch('/api/me/billing')
      const d = await r.json()
      setStatus(d?.premium ? 'premium' : 'free')
      setCustomerId(d?.stripeCustomerId || undefined)
    })()
  }, [])

  async function upgrade() {
    const r = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'me' }),
    })
    const d = await r.json()
    if (d?.url) window.location.href = d.url
  }
  async function manage() {
    const r = await fetch('/api/billing/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    })
    const d = await r.json()
    if (d?.url) window.location.href = d.url
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Settings</h1>
      <div className="rounded-2xl border p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-neutral-600">Subscription</div>
          <div className="text-lg font-bold">
            {status === 'premium' ? 'Premium' : 'Free'}
          </div>
        </div>
        {status === 'premium' ? (
          <button
            onClick={manage}
            className="px-4 py-2 rounded bg-black text-white"
          >
            Manage
          </button>
        ) : (
          <button
            onClick={upgrade}
            className="px-4 py-2 rounded bg-black text-white"
          >
            Upgrade
          </button>
        )}
      </div>
    </main>
  )
}
