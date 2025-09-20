'use client'
import { useState } from 'react'

export default function Plus() {
  const [loading, setLoading] = useState(false)
  async function buy() {
    setLoading(true)
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
    })
    const { url } = await res.json()
    window.location.href = url
  }
  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">lingr Plus</h1>
      <p className="text-white/70 mb-6">
        Unlock unlimited filters, incognito mode, pinned chats, and more.
      </p>
      <button className="btn-primary" onClick={buy} disabled={loading}>
        {loading ? 'Redirecting...' : 'Upgrade — $9.99/mo'}
      </button>
    </div>
  )
}
