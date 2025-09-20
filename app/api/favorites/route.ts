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
  await supabase.from('favorites').insert({ userId, targetUserId })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { userId, targetUserId } = await req.json()
  if (!userId || !targetUserId)
    return NextResponse.json(
      { error: 'userId and targetUserId required' },
      { status: 400 },
    )
  await supabase.from('favorites').delete().match({ userId, targetUserId })
  return NextResponse.json({ ok: true })
}
