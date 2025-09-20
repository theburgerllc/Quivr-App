import { requireAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
)

export async function POST(req: NextRequest) {
  requireAdmin()

  const { type } = await req.json()
  const now = new Date()
  const since24h = new Date(now.getTime() - 24 * 3600 * 1000).toISOString()
  const since7d = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString()

  try {
    switch (type) {
      case 'reports_24h': {
        const { count, error } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .gte('createdAt', since24h)
        if (error) throw error
        return NextResponse.json({ value: count ?? 0 })
      }
      case 'reports_7d': {
        const { count, error } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .gte('createdAt', since7d)
        if (error) throw error
        return NextResponse.json({ value: count ?? 0 })
      }
      case 'pending_queue': {
        const { count, error } = await supabase
          .from('media')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
        if (error) throw error
        return NextResponse.json({ value: count ?? 0 })
      }
      case 'pending_oldest_age': {
        const { data, error } = await supabase
          .from('media')
          .select('createdAt')
          .eq('status', 'pending')
          .order('createdAt', { ascending: true })
          .limit(1)
        if (error) throw error
        if (!data?.length) return NextResponse.json({ value: 0 })
        const oldest = new Date(data[0].createdAt).getTime()
        const mins = Math.max(0, Math.round((now.getTime() - oldest) / 60000))
        return NextResponse.json({ value: mins })
      }
      case 'approval_rate_7d': {
        const [{ count: approved }, { count: reviewed }] = await Promise.all([
          supabase
            .from('media')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved')
            .gte('createdAt', since7d),
          supabase
            .from('media')
            .select('*', { count: 'exact', head: true })
            .in('status', ['approved', 'rejected'])
            .gte('createdAt', since7d),
        ])
        const rate =
          reviewed && reviewed > 0
            ? Math.round(((approved || 0) / reviewed) * 100)
            : 0
        return NextResponse.json({ value: rate })
      }
      case 'approvals_24h': {
        const { count, error } = await supabase
          .from('media')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')
          .gte('createdAt', since24h)
        if (error) throw error
        return NextResponse.json({ value: count ?? 0 })
      }
      case 'rejections_24h': {
        const { count, error } = await supabase
          .from('media')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'rejected')
          .gte('createdAt', since24h)
        if (error) throw error
        return NextResponse.json({ value: count ?? 0 })
      }
      case 'uploads_24h': {
        const { count, error } = await supabase
          .from('media')
          .select('*', { count: 'exact', head: true })
          .gte('createdAt', since24h)
        if (error) throw error
        return NextResponse.json({ value: count ?? 0 })
      }
      case 'uploads_7d': {
        const { count, error } = await supabase
          .from('media')
          .select('*', { count: 'exact', head: true })
          .gte('createdAt', since7d)
        if (error) throw error
        return NextResponse.json({ value: count ?? 0 })
      }
      case 'favorites_24h': {
        const { count, error } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .gte('createdAt', since24h)
        if (error) throw error
        return NextResponse.json({ value: count ?? 0 })
      }
      case 'heatmap_city': {
        const { data, error } = await supabase.from('profiles').select('city')
        if (error) throw error
        const map: Record<string, number> = {}
        for (const r of data || []) {
          const c = (r.city || '').trim()
          if (!c) continue
          map[c] = (map[c] || 0) + 1
        }
        const list = Object.entries(map)
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 30)
        return NextResponse.json({ value: list })
      }
      case 'top_report_reasons_7d': {
        const { data, error } = await supabase
          .from('reports')
          .select('reason')
          .gte('createdAt', since7d)
        if (error) throw error
        const map: Record<string, number> = {}
        for (const r of data || []) {
          const key = (r.reason || 'other').trim().toLowerCase()
          map[key] = (map[key] || 0) + 1
        }
        const list = Object.entries(map)
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
        return NextResponse.json({ value: list })
      }
      case 'top_favorited_users_7d': {
        const { data, error } = await supabase
          .from('favorites')
          .select('targetUserId')
          .gte('createdAt', since7d)
        if (error) throw error
        const map: Record<string, number> = {}
        for (const r of data || [])
          map[r.targetUserId] = (map[r.targetUserId] || 0) + 1
        const list = Object.entries(map)
          .map(([userId, count]) => ({ userId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
        return NextResponse.json({ value: list })
      }
      case 'ts_uploads_7d': {
        const { data, error } = await supabase
          .from('media')
          .select('createdAt')
          .gte('createdAt', since7d)
        if (error) throw error
        return NextResponse.json({
          value: bucketByDay(data || [], 'createdAt'),
        })
      }
      case 'ts_favorites_7d': {
        const { data, error } = await supabase
          .from('favorites')
          .select('createdAt')
          .gte('createdAt', since7d)
        if (error) throw error
        return NextResponse.json({
          value: bucketByDay(data || [], 'createdAt'),
        })
      }
      case 'ts_reports_7d': {
        const { data, error } = await supabase
          .from('reports')
          .select('createdAt')
          .gte('createdAt', since7d)
        if (error) throw error
        return NextResponse.json({
          value: bucketByDay(data || [], 'createdAt'),
        })
      }
      default:
        return NextResponse.json({ error: 'unknown type' }, { status: 400 })
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'server_error' },
      { status: 500 },
    )
  }
}

function bucketByDay(rows: any[], key: string) {
  const map: Record<string, number> = {}
  for (const r of rows) {
    const d = new Date(r[key])
    const ds = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    )
      .toISOString()
      .slice(0, 10)
    map[ds] = (map[ds] || 0) + 1
  }
  const days: string[] = []
  const now = new Date()
  const start = new Date(now.getTime() - 6 * 24 * 3600 * 1000)
  for (let i = 0; i < 7; i++) {
    const t = new Date(
      Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth(),
        start.getUTCDate() + i,
      ),
    )
      .toISOString()
      .slice(0, 10)
    days.push(t)
  }
  return days.map((d) => ({ date: d, count: map[d] || 0 }))
}
