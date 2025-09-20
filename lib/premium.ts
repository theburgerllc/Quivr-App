import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getCurrentUserId } from '@/lib/auth'

export async function getPremiumForCurrentUser() {
  const uid = await getCurrentUserId()
  if (!uid) return { uid: '', premium: false }
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('premium, premiumUntil')
    .eq('id', uid)
    .limit(1)
  const premium =
    !!data?.[0]?.premium &&
    (!data?.[0]?.premiumUntil ||
      new Date(data[0].premiumUntil as any) > new Date())
  return { uid, premium }
}
