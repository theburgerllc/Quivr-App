'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Msg = { id: string; sender: string; content: string; created_at: string }

export default function Chat({ params }: { params: { id: string } }) {
  const { id } = params
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('messages')
        .select('id,sender,content,created_at')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })
      setMsgs((data || []) as any)
    })()

    const ch = supabase
      .channel('rt-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => setMsgs((m) => [...m, payload.new as any]),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ch)
    }
  }, [id])

  async function send() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !text.trim()) return
    await supabase
      .from('messages')
      .insert({ conversation_id: id, sender: user.id, content: text })
    setText('')
    listRef.current?.scrollTo({ top: 999999, behavior: 'smooth' })
  }

  return (
    <div className="container py-4 flex flex-col h-[calc(100dvh-120px)]">
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
        {msgs.map((m) => (
          <div key={m.id} className="card p-2">
            <div className="text-xs text-white/50">
              {new Date(m.created_at).toLocaleString()}
            </div>
            <div>{m.content}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="input flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={send} className="btn-primary">
          Send
        </button>
      </div>
    </div>
  )
}
