'use client'
import { useState } from 'react'
import { encode } from 'blurhash'
import { initAnalytics, track } from '@/lib/analytics'

initAnalytics()

async function pick(): Promise<File | undefined> {
  return new Promise((res) => {
    const i = document.createElement('input')
    i.type = 'file'
    i.accept = 'image/*'
    i.onchange = () => res(i.files?.[0] || undefined)
    i.click()
  })
}

async function compressToWebP(
  file: File,
  maxW = 2048,
  quality = 0.82,
): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, maxW / Math.max(bmp.width, bmp.height))
  const w = Math.round(bmp.width * scale),
    h = Math.round(bmp.height * scale)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.drawImage(bmp, 0, 0, w, h)
  const blob: Blob = await new Promise((r) =>
    c.toBlob((b) => r(b!), 'image/webp', quality),
  )
  return blob
}

async function getBlurHash(file: File): Promise<string> {
  const bmp = await createImageBitmap(file)
  const c = document.createElement('canvas')
  c.width = 64
  c.height = Math.max(1, Math.round((64 * bmp.height) / bmp.width))
  const ctx = c.getContext('2d')!
  ctx.drawImage(bmp, 0, 0, c.width, c.height)
  const imgData = ctx.getImageData(0, 0, c.width, c.height)
  return encode(imgData.data, imgData.width, imgData.height, 4, 3)
}

export function UploadButton({ userId }: { userId: string }) {
  const [busy, setBusy] = useState(false)
  return (
    <button
      className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
      disabled={busy}
      onClick={async () => {
        const file = await pick()
        if (!file) return
        setBusy(true)
        try {
          const webp = await compressToWebP(file)
          const blurHash = await getBlurHash(file)
          const up = await fetch('/api/media/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, contentType: 'image/webp' }),
          })
          const { uploadUrl, id } = await up.json()
          await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'image/webp' },
            body: webp,
          })
          await fetch('/api/media/blurhash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, blurHash }),
          })
          track('media_upload_success', { contentType: 'image/webp' })
          alert('Uploaded for review')
        } catch (e) {
          console.error(e)
          alert('Upload failed')
        } finally {
          setBusy(false)
        }
      }}
    >
      {busy ? 'Uploading…' : 'Upload'}
    </button>
  )
}
