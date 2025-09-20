import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth'
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
)
export async function GET(req: NextRequest) {
  await requireAdmin()
  const url = new URL(req.url)
  const page = Number(url.searchParams.get('page') || '1')
  const pageSize = 48
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabase
    .from('media')
    .select('id,path,createdAt', { count: 'exact' })
    .eq('status', 'pending')
    .order('createdAt', { ascending: true })
    .range(from, to)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const out: any[] = []
  for (const m of data || []) {
    const { data: signed } = await supabase.storage
      .from('media')
      .createSignedUrl(m.path, 60)
    out.push({
      id: m.id,
      createdAt: m.createdAt,
      previewUrl: signed?.signedUrl,
    })
  }
  return NextResponse.json({ items: out, total: count || 0, page, pageSize })
}
