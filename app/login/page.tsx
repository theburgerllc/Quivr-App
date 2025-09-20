'use client'
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  async function sendMagic() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setLoading(false)
    alert(error ? error.message : 'Check your email for a sign-in link.')
  }
  return (
    <div className="container py-10 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <label className="label">Email</label>
      <input
        className="input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <button
        onClick={sendMagic}
        className="btn-primary mt-4"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send magic link'}
      </button>
    </div>
  )
}
