'use client'
import { useState, useRef } from 'react'
import FavoritesBadge, { FavoritesBadgeRef } from './FavoritesBadge'
export default function ProfileHeader({
  currentUserId,
}: {
  currentUserId: string
}) {
  const [tab, setTab] = useState<'photos' | 'info' | 'favorites'>('photos')
  const badgeRef = useRef<FavoritesBadgeRef>(null)
  return (
    <header className="flex items-center justify-between gap-4 p-4">
      <nav className="flex gap-3 text-sm">
        <button
          onClick={() => setTab('photos')}
          className={tab === 'photos' ? 'font-semibold' : ''}
        >
          Photos
        </button>
        <button
          onClick={() => setTab('info')}
          className={tab === 'info' ? 'font-semibold' : ''}
        >
          Info
        </button>
        <button
          onClick={() => setTab('favorites')}
          className={tab === 'favorites' ? 'font-semibold' : ''}
        >
          Favorites
        </button>
      </nav>
      <FavoritesBadge ref={badgeRef} userId={currentUserId} />
    </header>
  )
}
