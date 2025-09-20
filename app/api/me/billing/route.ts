import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getCurrentUserId } from '@/lib/auth'

export async function GET() {
  const uid = getCurrentUserId()
  if (!uid) return NextResponse.json({ premium: false })
  const [{ data: p }, { data: c }] = await Promise.all([
    supabaseAdmin.from('profiles').select('premium').eq('id', uid).limit(1),
    supabaseAdmin
      .from('billing_customers')
      .select('stripeCustomerId')
      .eq('userId', uid)
      .limit(1),
  ])
  return NextResponse.json({
    premium: !!p?.[0]?.premium,
    stripeCustomerId: c?.[0]?.stripeCustomerId || null,
  })
}
