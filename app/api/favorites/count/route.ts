import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
)

export async function POST(req: NextRequest) {
  const { userId } = await req.json()
  if (!userId)
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('userId', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ count: count ?? 0 })
}
