'use client'
import { useEffect, useState } from 'react'
export default function MediaCard({
  mediaId,
  requesterId,
}: {
  mediaId: string
  requesterId: string
}) {
  const [url, setUrl] = useState('')
  const [allowClear, setAllowClear] = useState(false)
  useEffect(() => {
    ;(async () => {
      const r = await fetch('/api/media/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, requesterId }),
      })
      const d = await r.json()
      setUrl(d.url || '')
      setAllowClear(!!d.allowClear)
    })()
  }, [mediaId, requesterId])
  if (!url)
    return (
      <div className="aspect-square w-full bg-neutral-100 animate-pulse rounded-xl" />
    )
  return (
    <img
      src={url}
      className={
        allowClear ? 'media-clear rounded-xl' : 'media-blur rounded-xl'
      }
      alt="media"
    />
  )
}
