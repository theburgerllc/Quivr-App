import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
)

export async function POST(req: NextRequest) {
  const { city, country = 'US', limit = 3 } = await req.json()
  if (!city) return NextResponse.json({ profiles: [] })
  const now = new Date().toISOString()
  const { data: srows, error } = await supabase
    .from('spotlights')
    .select('userId, endsAt')
    .eq('city', city)
    .eq('country', country)
    .gt('endsAt', now)
    .order('endsAt', { ascending: false })
    .limit(Math.min(6, limit))
  if (error || !srows?.length) return NextResponse.json({ profiles: [] })

  const ids = srows.map((r) => r.userId)
  const { data: profs } = await supabase
    .from('profiles')
    .select('*')
    .in('id', ids)
  const byId: Record<string, any> = {}
  for (const p of profs || []) byId[p.id] = p
  const ordered = ids.map((id) => byId[id]).filter(Boolean)
  return NextResponse.json({ profiles: ordered })
}
