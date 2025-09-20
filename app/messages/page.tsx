'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

type Conversation = {
  id: string
  last_message_at: string | null
  other_username: string | null
}

export default function Messages() {
  const [rows, setRows] = useState<Conversation[]>([])
  useEffect(() => {
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.rpc('my_conversations')
      setRows((data || []) as any)
    })()
  }, [])
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="space-y-2">
        {rows.map((c) => (
          <a
            key={c.id}
            href={`/messages/${c.id}`}
            className="card p-3 block hover:border-brand-400/60"
          >
            <div className="font-semibold">{c.other_username}</div>
            <div className="text-xs text-white/60">
              Last message{' '}
              {c.last_message_at ? dayjs(c.last_message_at).fromNow() : '—'}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
