'use client'
import { useEffect, useState, useImperativeHandle, forwardRef } from 'react'

type Props = { userId: string }
export type FavoritesBadgeRef = { refresh: () => void }

const FavoritesBadge = forwardRef<FavoritesBadgeRef, Props>(
  ({ userId }, ref) => {
    const [count, setCount] = useState<number>(0)
    async function load() {
      const res = await fetch('/api/favorites/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      setCount(Number(data?.count || 0))
    }
    useImperativeHandle(ref, () => ({ refresh: load }))
    useEffect(() => {
      let active = true
      ;(async () => {
        if (active) await load()
      })()
      const id = setInterval(load, 30000)
      return () => {
        active = false
        clearInterval(id)
      }
    }, [userId])
    if (!userId) return null
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-black text-white text-xs px-2 py-1">
        <span>Favorites</span>
        <span className="min-w-5 text-center rounded-full bg-white/20 px-1">
          {count}
        </span>
      </span>
    )
  },
)
export default FavoritesBadge
