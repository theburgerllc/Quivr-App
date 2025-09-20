'use client'
import { useState } from 'react'
import PaywallOverlay from '@/components/PaywallOverlay'

type Props = {
  onChange: (f: any) => void
  premium?: boolean
  origin?: { city?: string; country?: string }
}
export default function Filters({ onChange, premium = false, origin }: Props) {
  const [ageMin, setAgeMin] = useState(18)
  const [ageMax, setAgeMax] = useState(99)
  const [lookingFor, setLookingFor] = useState('')

  // Advanced
  const [distanceKm, setDistanceKm] = useState<number | undefined>(undefined)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [tagStr, setTagStr] = useState('')

  const [showUpsell, setShowUpsell] = useState(false)
  return (
    <div className="relative">
      {!premium && showUpsell && (
        <PaywallOverlay onClose={() => setShowUpsell(false)} />
      )}
      <form aria-label="filters" className="flex flex-wrap gap-2 items-end">
        <label className="text-sm">
          Age
          <input
            aria-label="min age"
            className="ml-2 w-16 border rounded px-2 py-1"
            type="number"
            value={ageMin}
            min={18}
            max={99}
            onChange={(e) => setAgeMin(+e.target.value)}
          />
          <span className="mx-1">–</span>
          <input
            aria-label="max age"
            className="w-16 border rounded px-2 py-1"
            type="number"
            value={ageMax}
            min={18}
            max={99}
            onChange={(e) => setAgeMax(+e.target.value)}
          />
        </label>

        <label className="text-sm">
          Looking for
          <select
            className="ml-2 border rounded px-2 py-1"
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
          >
            <option value="">Any</option>
            <option value="chat">Chat</option>
            <option value="dates">Dates</option>
            <option value="friends">Friends</option>
          </select>
        </label>

        {premium && (
          <>
            <label className="text-sm">
              Distance (km)
              <input
                className="ml-2 w-20 border rounded px-2 py-1"
                type="number"
                value={distanceKm || ''}
                onFocus={() => !premium && setShowUpsell(true)}
                onChange={(e) =>
                  setDistanceKm(e.target.value ? +e.target.value : undefined)
                }
              />
            </label>
            <label className="text-sm">
              <input
                type="checkbox"
                className="mr-2"
                checked={verifiedOnly}
                onFocus={() => !premium && setShowUpsell(true)}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
              />
              Verified only
            </label>
            <label className="text-sm">
              Tags
              <input
                className="ml-2 w-64 border rounded px-2 py-1"
                placeholder="gym, kink-friendly"
                onFocus={() => !premium && setShowUpsell(true)}
                value={tagStr}
                onChange={(e) => setTagStr(e.target.value)}
              />
            </label>
          </>
        )}

        <button
          type="button"
          className="px-3 py-1.5 rounded bg-black text-white"
          onClick={() => {
            const tags = tagStr
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
            onChange({
              ageMin,
              ageMax,
              lookingFor,
              tags,
              verifiedOnly,
              distanceKm,
              originCity: origin?.city,
              originCountry: origin?.country,
            })
          }}
        >
          Apply
        </button>
      </form>
    </div>
  )
}
