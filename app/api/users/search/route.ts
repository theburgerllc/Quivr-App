import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
)

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export async function POST(req: NextRequest) {
  const {
    ageMin = 18,
    ageMax = 99,
    lookingFor = '',
    tags = [],
    distanceKm,
    originCity,
    originCountry = 'US',
    verifiedOnly = false,
    limit = 60,
  } = await req.json()

  let q = supabase
    .from('profiles')
    .select('*')
    .gte('age', ageMin)
    .lte('age', ageMax)
    .limit(Math.min(120, limit))
  if (lookingFor) q = q.ilike('lookingFor', `%${lookingFor}%`)
  if (verifiedOnly) q = q.eq('verified', true)
  if (Array.isArray(tags) && tags.length > 0) q = q.contains('tags', tags)

  const { data: users, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (distanceKm && originCity) {
    const { data: o } = await supabase
      .from('cities')
      .select('lat,lon')
      .eq('city', originCity)
      .eq('country', originCountry)
      .limit(1)
    if (!o?.[0]) return NextResponse.json({ users: [] })
    const { lat: olat, lon: olon } = o[0]

    const keys = Array.from(
      new Set(
        (users || []).map(
          (u: any) => `${(u.city || '').trim()}::${(u.country || 'US').trim()}`,
        ),
      ),
    ).filter(Boolean)
    const cityRows: Record<string, { lat: number; lon: number }> = {}
    for (const key of keys) {
      const [city, country] = key.split('::')
      const { data: row } = await supabase
        .from('cities')
        .select('lat,lon')
        .eq('city', city)
        .eq('country', country)
        .limit(1)
      if (row?.[0]) cityRows[key] = { lat: row[0].lat, lon: row[0].lon }
    }

    const filtered = (users || []).filter((u: any) => {
      const k = `${(u.city || '').trim()}::${(u.country || 'US').trim()}`
      const c = cityRows[k]
      if (!c) return false
      return haversineKm(olat, olon, c.lat, c.lon) <= distanceKm
    })
    return NextResponse.json({ users: await bubbleBoosts(filtered) })
  }

  return NextResponse.json({ users: await bubbleBoosts(users || []) })
}

async function bubbleBoosts(list: any[]) {
  const ids = list.map((u) => u.id)
  const now = new Date().toISOString()
  try {
    const { data } = await (await import('@supabase/supabase-js'))
      .createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE!,
      )
      .from('boosts')
      .select('userId,endsAt')
      .in('userId', ids)
      .gt('endsAt', now)
    const boosted = new Set((data || []).map((b: any) => b.userId))
    return list.sort(
      (a, b) => (boosted.has(b.id) ? 1 : 0) - (boosted.has(a.id) ? 1 : 0),
    )
  } catch {
    return list
  }
}
