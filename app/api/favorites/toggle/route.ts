import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
)

export async function POST(req: NextRequest) {
  const { userId, targetUserId } = await req.json()
  if (!userId || !targetUserId)
    return NextResponse.json(
      { error: 'userId and targetUserId required' },
      { status: 400 },
    )

  const { data: rows, error: e1 } = await supabase
    .from('favorites')
    .select('id')
    .eq('userId', userId)
    .eq('targetUserId', targetUserId)
    .limit(1)
  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 })

  if (rows?.length) {
    const id = rows[0].id
    const { error } = await supabase.from('favorites').delete().eq('id', id)
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, favorited: false })
  }
  const { error } = await supabase
    .from('favorites')
    .insert({ userId, targetUserId })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, favorited: true })
}
