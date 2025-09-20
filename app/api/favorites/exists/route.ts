import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const targetUserId = searchParams.get('targetUserId')
  if (!userId || !targetUserId)
    return NextResponse.json(
      { error: 'userId and targetUserId required' },
      { status: 400 },
    )
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('userId', userId)
    .eq('targetUserId', targetUserId)
    .limit(1)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ exists: !!data?.length })
}
