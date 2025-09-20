'use client'
export default function Paywall() {
  async function go() {
    const r = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'me' }),
    })
    const d = await r.json()
    if (d?.url) window.location.href = d.url
  }
  return (
    <div className="rounded-2xl border p-4 text-center">
      <h3 className="text-lg font-semibold">
        Upgrade to {process.env.NEXT_PUBLIC_PREMIUM_NAME || 'Premium'}
      </h3>
      <p className="text-sm text-neutral-600">
        Unlock advanced filters, incognito mode, boosts, and more.
      </p>
      <button
        onClick={go}
        className="mt-3 px-4 py-2 rounded bg-black text-white"
      >
        Go Premium
      </button>
    </div>
  )
}
