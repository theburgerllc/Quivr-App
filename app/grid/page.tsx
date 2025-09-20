import { supabaseAdmin } from '@/lib/supabaseAdmin'
// app/grid/page.tsx
import GridClient from './GridClient'
import { getPremiumForCurrentUser } from '@/lib/premium'
export default async function GridPage() {
  const { uid, premium } = await getPremiumForCurrentUser()
  const { data: prof } = await supabaseAdmin
    .from('profiles')
    .select('city,country')
    .eq('id', uid)
    .limit(1)
  const origin = {
    city: prof?.[0]?.city || null,
    country: prof?.[0]?.country || 'US',
  }
  const users = await fetchUsers()
  return (
    <GridClient
      currentUserId={uid}
      users={users}
      premium={premium}
      origin={origin}
    />
  )
}
async function fetchUsers() {
  return [] as any[]
}
