import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
)

export async function POST(req: NextRequest) {
  const { userId, contentType } = await req.json()
  if (!userId || !contentType) {
    return NextResponse.json(
      { error: 'userId and contentType required' },
      { status: 400 },
    )
  }
  const id = globalThis.crypto.randomUUID()
  const key = `users/${userId}/${id}`
  // @ts-ignore
  const { data, error } = await supabase.storage
    .from('media')
    .createSignedUploadUrl(key)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await supabase
    .from('media')
    .insert({ id, userId, path: key, status: 'pending' })
  return NextResponse.json({ id, key, uploadUrl: data.signedUrl })
}
