'use client'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { supabase } from '@/lib/supabaseClient'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

type Pin = {
  id: string
  username: string
  lat: number
  lon: number
  photo_url: string | null
}

export default function MapPage() {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [pins, setPins] = useState<Pin[]>([])

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-73.9857, 40.7484],
        zoom: 11,
      })
    }
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('public_profiles_view')
        .select('id,username,lat,lon,photo_url')
        .not('lat', 'is', null)
        .not('lon', 'is', null)
        .limit(200)
      setPins((data || []) as any)
    }
    load()
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    pins.forEach((p) => {
      const el = document.createElement('div')
      el.className =
        'rounded-full border border-white/40 overflow-hidden w-10 h-10 bg-white/10'
      el.title = p.username
      el.onclick = () => {
        window.location.href = `/u/${p.username || p.id}`
      }
      new mapboxgl.Marker({ element: el }).setLngLat([p.lon, p.lat]).addTo(map)
    })
  }, [pins])

  return <div ref={containerRef} className="w-full h-[calc(100dvh-72px)]" />
}
