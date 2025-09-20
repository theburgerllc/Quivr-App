import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth'
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
)
export async function GET() {
  requireAdmin()
  const { data: profs } = await supabase.from('profiles').select('city,country')
  const counts = new Map<string, number>()
  for (const p of profs || []) {
    const c = (p.city || '').trim()
    const k = `${c}::${p.country || 'US'}`
    if (c) counts.set(k, (counts.get(k) || 0) + 1)
  }
  const out: any[] = []
  for (const key of counts.keys()) {
    const [city, country] = key.split('::')
    const { data } = await supabase
      .from('cities')
      .select('lat,lon')
      .eq('city', city)
      .eq('country', country)
      .limit(1)
    if (data?.[0])
      out.push({
        city,
        country,
        lat: data[0].lat,
        lon: data[0].lon,
        count: counts.get(key)!,
      })
  }
  return NextResponse.json({ value: out })
}
