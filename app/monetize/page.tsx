'use client'
import { useEffect, useState } from 'react'

export default function Monetize() {
  const [busy, setBusy] = useState<string | false>(false)
  async function buy(type: 'boost' | 'spotlight') {
    setBusy(type)
    const r = await fetch('/api/monetization/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, userId: 'me' }),
    })
    const d = await r.json()
    setBusy(false)
    if (d?.url) window.location.href = d.url
  }
  return (
    <main className="p-6 max-w-xl mx-auto grid gap-4">
      <h1 className="text-xl font-semibold">Boost & Spotlight</h1>
      <article className="rounded-2xl border p-4">
        <h3 className="font-semibold">Boost — 24 hours</h3>
        <p className="text-sm text-neutral-600">
          Rise to the top of discovery for a day.
        </p>
        <button
          disabled={busy === 'boost'}
          onClick={() => buy('boost')}
          className="mt-3 px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          Buy Boost
        </button>
      </article>
      <article className="rounded-2xl border p-4">
        <h3 className="font-semibold">Spotlight — 24 hours</h3>
        <p className="text-sm text-neutral-600">
          Be featured in your city for a day.
        </p>
        <button
          disabled={busy === 'spotlight'}
          onClick={() => buy('spotlight')}
          className="mt-3 px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          Buy Spotlight
        </button>
      </article>
    </main>
  )
}
