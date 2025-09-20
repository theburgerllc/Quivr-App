import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'

export default async function UserProfile({
  params,
}: {
  params: { username: string }
}) {
  const { data } = await supabase
    .from('public_profiles_view')
    .select('*')
    .eq('username', params.username)
    .maybeSingle()
  const p = data as any
  if (!p) return <div className="container py-10">Profile not found.</div>
  return (
    <div className="container py-8 grid md:grid-cols-2 gap-6">
      <div className="card overflow-hidden">
        {p.photo_url ? (
          <Image
            src={p.photo_url}
            alt={p.username}
            width={1200}
            height={1200}
          />
        ) : (
          <div className="p-8 text-white/40">No photo</div>
        )}
      </div>
      <div>
        <h1 className="text-3xl font-bold">{p.display_name || p.username}</h1>
        <div className="text-white/70 mt-2">Age: {p.age ?? '—'}</div>
        <a className="btn-primary mt-6 inline-block" href={`/messages`}>
          Message
        </a>
        <button className="btn-ghost ml-2">Tap 🔥</button>
      </div>
    </div>
  )
}
