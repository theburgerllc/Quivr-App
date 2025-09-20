'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const GeoMap = dynamic(() => import('./GeoMap'), { ssr: false })

export default function Admin() {
  return (
    <main className="p-6 grid gap-6 lg:grid-cols-3">
      <KpiGrid />
      <CityHeatmap />
      <TopFavorited />
      <ReportReasons />
      <Timeseries title="Uploads (7d)" type="ts_uploads_7d" />
      <Timeseries title="Favorites (7d)" type="ts_favorites_7d" />
      <Timeseries title="Reports (7d)" type="ts_reports_7d" />
      <GeoMap />
    </main>
  )
}

function KpiGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-6">
      <Kpi title="Reports 24h" type="reports_24h" />
      <Kpi title="Reports 7d" type="reports_7d" />
      <Kpi title="Pending" type="pending_queue" />
      <Kpi title="Oldest Pending (min)" type="pending_oldest_age" />
      <Kpi title="Approval Rate 7d" type="approval_rate_7d" suffix="%" />
      <Kpi title="Uploads 24h" type="uploads_24h" />
      <Kpi title="Uploads 7d" type="uploads_7d" />
      <Kpi title="Approvals 24h" type="approvals_24h" />
      <Kpi title="Rejections 24h" type="rejections_24h" />
      <Kpi title="Favorites 24h" type="favorites_24h" />
    </section>
  )
}

function Kpi({
  title,
  type,
  suffix = '',
}: {
  title: string
  type: string
  suffix?: string
}) {
  const [v, setV] = useState<number>(0)
  useEffect(() => {
    ;(async () => {
      const r = await fetch('/api/admin/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      const d = await r.json()
      if (typeof d?.value === 'number') setV(d.value)
    })()
  }, [type])
  return (
    <article className="rounded-2xl shadow p-4">
      <div className="text-xs text-neutral-500">{title}</div>
      <div className="text-2xl font-bold mt-1">
        {v}
        {suffix}
      </div>
    </article>
  )
}

function CityHeatmap() {
  const [rows, setRows] = useState<{ city: string; count: number }[]>([])
  useEffect(() => {
    ;(async () => {
      const r = await fetch('/api/admin/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'heatmap_city' }),
      })
      const d = await r.json()
      if (Array.isArray(d?.value)) setRows(d.value)
    })()
  }, [])
  return (
    <article className="rounded-2xl shadow p-4 lg:col-span-1">
      <h3 className="text-sm font-semibold">Heatmap by City (Top 30)</h3>
      <ul className="mt-3 space-y-1 max-h-80 overflow-auto">
        {rows.map((r) => (
          <li key={r.city} className="flex items-center gap-2 text-sm">
            <span className="w-28 truncate" title={r.city}>
              {r.city}
            </span>
            <div className="flex-1 h-2 bg-neutral-200 rounded">
              <div
                className="h-2 bg-black rounded"
                style={{ width: `${Math.min(100, r.count * 4)}%` }}
              />
            </div>
            <span className="w-8 text-right font-semibold">{r.count}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function TopFavorited() {
  const [rows, setRows] = useState<{ userId: string; count: number }[]>([])
  useEffect(() => {
    ;(async () => {
      const r = await fetch('/api/admin/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'top_favorited_users_7d' }),
      })
      const d = await r.json()
      if (Array.isArray(d?.value)) setRows(d.value)
    })()
  }, [])
  return (
    <article className="rounded-2xl shadow p-4 lg:col-span-1">
      <h3 className="text-sm font-semibold">Top Favorited Users (7d)</h3>
      <ol className="mt-3 space-y-1">
        {rows.map((r, i) => (
          <li key={r.userId} className="flex justify-between text-sm">
            <span>
              {i + 1}. {r.userId}
            </span>
            <span className="font-semibold">{r.count}</span>
          </li>
        ))}
      </ol>
    </article>
  )
}

function ReportReasons() {
  const [rows, setRows] = useState<{ reason: string; count: number }[]>([])
  useEffect(() => {
    ;(async () => {
      const r = await fetch('/api/admin/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'top_report_reasons_7d' }),
      })
      const d = await r.json()
      if (Array.isArray(d?.value)) setRows(d.value)
    })()
  }, [])
  return (
    <article className="rounded-2xl shadow p-4 lg:col-span-1">
      <h3 className="text-sm font-semibold">Top Report Reasons (7d)</h3>
      <ul className="mt-3 space-y-1">
        {rows.map((r) => (
          <li key={r.reason} className="flex justify-between text-sm">
            <span className="capitalize">{r.reason}</span>
            <span className="font-semibold">{r.count}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function Timeseries({ title, type }: { title: string; type: string }) {
  const [points, setPoints] = useState<{ date: string; count: number }[]>([])
  useEffect(() => {
    ;(async () => {
      const r = await fetch('/api/admin/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      const d = await r.json()
      if (Array.isArray(d?.value)) setPoints(d.value)
    })()
  }, [type])
  const max = Math.max(1, ...points.map((p) => p.count))
  return (
    <article className="rounded-2xl shadow p-4 lg:col-span-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 grid grid-cols-7 gap-2 items-end h-32">
        {points.map((p) => (
          <div
            key={p.date}
            title={`${p.date}: ${p.count}`}
            className="bg-black rounded"
            style={{ height: `${(p.count / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-neutral-500">
        {points.map((p) => (
          <span key={p.date}>{p.date.slice(5)}</span>
        ))}
      </div>
    </article>
  )
}
