'use client'
import posthog from 'posthog-js'
export function initAnalytics() {
  if (!(posthog as any).__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
      api_host: 'https://us.i.posthog.com',
    })
    ;(posthog as any).__loaded = true
  }
}
export const track = (ev: string, props?: Record<string, any>) =>
  posthog.capture(ev, props)
