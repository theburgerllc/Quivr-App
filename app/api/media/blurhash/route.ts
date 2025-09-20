import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
)
export async function POST(req: NextRequest) {
  const { id, blurHash } = await req.json()
  if (!id || !blurHash)
    return NextResponse.json(
      { error: 'id and blurHash required' },
      { status: 400 },
    )
  const { error } = await supabase
    .from('media')
    .update({ blurHash })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
