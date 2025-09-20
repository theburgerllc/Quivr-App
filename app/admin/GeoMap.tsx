'use client'
import { useEffect, useState } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps'
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
export default function GeoMap() {
  const [pts, setPts] = useState<
    { city: string; country: string; lat: number; lon: number; count: number }[]
  >([])
  useEffect(() => {
    ;(async () => {
      const r = await fetch('/api/admin/geo/cities')
      const d = await r.json()
      if (Array.isArray(d?.value)) setPts(d.value)
    })()
  }, [])
  const max = Math.max(1, ...pts.map((p) => p.count))
  return (
    <div className="rounded-2xl shadow p-4 lg:col-span-3">
      <h3 className="text-sm font-semibold mb-3">User Density — World</h3>
      <ComposableMap
        projectionConfig={{ scale: 150 }}
        style={{ width: '100%', height: '480px' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: { fill: '#f2f2f2', stroke: '#d6d6d6' },
                  hover: { fill: '#e2e2e2' },
                  pressed: { fill: '#e2e2e2' },
                }}
              />
            ))
          }
        </Geographies>
        {pts.map((p, i) => (
          <Marker key={i} coordinates={[p.lon, p.lat]}>
            <circle
              r={4 + 8 * (p.count / max)}
              fill="#111"
              fillOpacity={0.75}
            />
            <title>{`${p.city}, ${p.country}: ${p.count}`}</title>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  )
}
