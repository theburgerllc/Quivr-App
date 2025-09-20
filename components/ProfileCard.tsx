'use client'
import Image from 'next/image'
import { haversineKm } from '@/lib/geo'

type Profile = {
  id: string
  username: string
  display_name: string | null
  age: number | null
  photo_url: string | null
  lat: number | null
  lon: number | null
  show_distance: boolean | null
  is_online: boolean | null
}

export default function ProfileCard({
  p,
  myLat,
  myLon,
}: {
  p: Profile
  myLat: number | null
  myLon: number | null
}) {
  const km =
    p.show_distance &&
    myLat != null &&
    myLon != null &&
    p.lat != null &&
    p.lon != null
      ? Math.round(haversineKm(myLat, myLon, p.lat, p.lon) * 10) / 10
      : null
  return (
    <a
      href={`/u/${p.username || p.id}`}
      className="block group rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-brand-400/60"
    >
      <div className="relative aspect-square bg-black/30">
        {p.photo_url ? (
          <Image
            src={p.photo_url}
            alt={p.username}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-white/30">
            No photo
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2 from-black/70 to-transparent bg-gradient-to-t text-sm">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{p.display_name || p.username}</div>
            <div className={p.is_online ? 'text-green-400' : 'text-white/60'}>
              {p.is_online ? '● online' : 'offline'}
            </div>
          </div>
          <div className="text-white/60 text-xs">
            {km != null ? `${km} km` : 'distance hidden'}
          </div>
        </div>
      </div>
    </a>
  )
}
