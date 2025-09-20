'use client'
import SpotlightCard from './SpotlightCard'
import Filters from './Filters'
import React, { useEffect, useState } from 'react'
export default function GridClient({
  currentUserId,
  users,
  premium,
  origin,
}: {
  currentUserId: string
  users: any[]
  premium: boolean
  origin?: { city?: string; country?: string }
}) {
  return (
    <main className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
      {users.map((u: any) => (
        <LongPressFavorite key={u.id} currentUserId={currentUserId} user={u}>
          <UserCard user={u} />
        </LongPressFavorite>
      ))}
    </main>
  )
}
function UserCard({ user }: { user: any }) {
  return <div className="aspect-[3/4] rounded-xl bg-neutral-100" />
}
function LongPressFavorite({
  currentUserId,
  user,
  children,
}: {
  currentUserId: string
  user: any
  children: React.ReactNode
}) {
  const [faved, setFaved] = useState<boolean>(false)
  let pressTimer: any
  async function check() {
    const q = new URLSearchParams({
      userId: currentUserId,
      targetUserId: user.id,
    })
    const res = await fetch(`/api/favorites/exists?${q.toString()}`)
    const data = await res.json()
    setFaved(!!data?.exists)
  }
  async function toggle() {
    setFaved((v) => !v)
    const res = await fetch('/api/favorites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId, targetUserId: user.id }),
    })
    const data = await res.json()
    if (typeof data?.favorited === 'boolean') setFaved(data.favorited)
  }
  useEffect(() => {
    check()
  }, [])
  return (
    <div
      onPointerDown={() => {
        pressTimer = setTimeout(toggle, 550)
      }}
      onPointerUp={() => {
        clearTimeout(pressTimer)
      }}
      onPointerLeave={() => {
        clearTimeout(pressTimer)
      }}
      className="relative"
    >
      {children}
      <div
        className={`absolute top-2 right-2 text-xs ${faved ? 'bg-yellow-500' : 'bg-black/60'} text-white px-2 py-1 rounded`}
      >
        {faved ? 'Favorited ★' : 'Long‑press to favorite ⭐'}
      </div>
    </div>
  )
}
