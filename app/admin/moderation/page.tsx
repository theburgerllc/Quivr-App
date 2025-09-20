'use client'
import React, { useEffect, useState } from 'react'
export default function ModerationQueue() {
  const [rows, setRows] = useState<any[]>([])
  const [sel, setSel] = useState<Record<string, boolean>>({})
  useEffect(() => {
    ;(async () => {
      const r = await fetch('/api/admin/moderation/pending')
      const d = await r.json()
      setRows(Array.isArray(d?.items) ? d.items : [])
    })()
  }, [])
  async function act(status: 'approved' | 'rejected', ids: string[]) {
    for (const id of ids) {
      await fetch('/api/media/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
    }
    setRows(rows.filter((r) => !ids.includes(r.id)))
    setSel({})
  }
  function toggle(id: string) {
    setSel((s) => ({ ...s, [id]: !s[id] }))
  }
  function key(e: React.KeyboardEvent | globalThis.KeyboardEvent) {
    if (e.key === 'a')
      act(
        'approved',
        Object.keys(sel).filter((k) => sel[k]),
      )
    if (e.key === 'r')
      act(
        'rejected',
        Object.keys(sel).filter((k) => sel[k]),
      )
  }
  useEffect(() => {
    window.addEventListener('keydown', key as any)
    return () => window.removeEventListener('keydown', key as any)
  }, [sel, rows])
  return (
    <main className="p-4">
      <header className="flex items-center gap-2 mb-3">
        <button
          className="px-3 py-1.5 rounded bg-black text-white"
          onClick={() =>
            act(
              'approved',
              Object.keys(sel).filter((k) => sel[k]),
            )
          }
        >
          Approve (A)
        </button>
        <button
          className="px-3 py-1.5 rounded border"
          onClick={() =>
            act(
              'rejected',
              Object.keys(sel).filter((k) => sel[k]),
            )
          }
        >
          Reject (R)
        </button>
        <span className="text-xs text-neutral-600">{rows.length} pending</span>
      </header>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {rows.map((m: any) => {
          const ageMin = Math.round(
            (Date.now() - new Date(m.createdAt).getTime()) / 60000,
          )
          return (
            <label
              key={m.id}
              className={`relative block rounded-xl overflow-hidden border ${sel[m.id] ? 'ring-2 ring-black' : ''}`}
            >
              <input
                aria-label={`select ${m.id}`}
                type="checkbox"
                className="sr-only"
                checked={!!sel[m.id]}
                onChange={() => toggle(m.id)}
              />
              <div
                className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded ${ageMin > 60 ? 'bg-red-600 text-white' : 'bg-black/60 text-white'}`}
              >
                {ageMin}m
              </div>
              <img
                src={m.previewUrl}
                alt="pending"
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
                {new Date(m.createdAt).toLocaleString()}
              </div>
            </label>
          )
        })}
      </section>
    </main>
  )
}
