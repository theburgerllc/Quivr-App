import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
)

export async function POST(req: NextRequest) {
  const { mediaId, requesterId } = await req.json()
  if (!mediaId)
    return NextResponse.json({ error: 'mediaId required' }, { status: 400 })
  const { data: rows, error } = await supabase
    .from('media')
    .select('*')
    .eq('id', mediaId)
    .limit(1)
  if (error || !rows?.length)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const m = rows[0]
  const allowClear = m.status === 'approved' || m.userId === requesterId
  const { data: signed, error: sErr } = await supabase.storage
    .from('media')
    .createSignedUrl(m.path, 60)
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 400 })
  return NextResponse.json({ url: signed.signedUrl, allowClear })
}
