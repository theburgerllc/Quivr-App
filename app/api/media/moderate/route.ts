import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
)

export async function POST(req: NextRequest) {
  const { id, status } = await req.json()
  if (!id || !['approved', 'rejected', 'pending'].includes(status))
    return NextResponse.json(
      { error: 'id(s) and valid status required' },
      { status: 400 },
    )
  const ids = Array.isArray(id) ? id : [id]
  const { error } = await supabase
    .from('media')
    .update({ status })
    .in('id', ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, count: ids.length })
}
