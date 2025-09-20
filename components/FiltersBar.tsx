'use client'
import { useEffect, useState } from 'react'

export type Filters = {
  minAge: number
  maxAge: number
  maxKm: number
  onlineOnly: boolean
  withPhoto: boolean
}

const defaultFilters: Filters = {
  minAge: 18,
  maxAge: 99,
  maxKm: 50,
  onlineOnly: false,
  withPhoto: false,
}

export default function FiltersBar({
  onChange,
}: {
  onChange: (f: Filters) => void
}) {
  const [f, setF] = useState<Filters>(() => {
    if (typeof window === 'undefined') return defaultFilters
    try {
      return JSON.parse(localStorage.getItem('filters') || '') || defaultFilters
    } catch {
      return defaultFilters
    }
  })
  useEffect(() => {
    onChange(f)
    if (typeof window !== 'undefined')
      localStorage.setItem('filters', JSON.stringify(f))
  }, [f])
  return (
    <div className="card p-3 mb-4 flex flex-wrap items-center gap-3">
      <div className="text-sm">Age</div>
      <input
        type="number"
        min={18}
        max={99}
        className="input w-20"
        value={f.minAge}
        onChange={(e) => setF({ ...f, minAge: +e.target.value })}
      />
      <span>–</span>
      <input
        type="number"
        min={18}
        max={99}
        className="input w-20"
        value={f.maxAge}
        onChange={(e) => setF({ ...f, maxAge: +e.target.value })}
      />
      <div className="text-sm ml-2">Max km</div>
      <input
        type="number"
        min={1}
        max={500}
        className="input w-24"
        value={f.maxKm}
        onChange={(e) => setF({ ...f, maxKm: +e.target.value })}
      />
      <label className="ml-2 text-sm flex items-center gap-2">
        <input
          type="checkbox"
          checked={f.onlineOnly}
          onChange={(e) => setF({ ...f, onlineOnly: e.target.checked })}
        />{' '}
        Online
      </label>
      <label className="text-sm flex items-center gap-2">
        <input
          type="checkbox"
          checked={f.withPhoto}
          onChange={(e) => setF({ ...f, withPhoto: e.target.checked })}
        />{' '}
        With photo
      </label>
      <button
        className="btn-ghost ml-auto"
        onClick={() => setF(defaultFilters)}
      >
        Reset
      </button>
    </div>
  )
}
