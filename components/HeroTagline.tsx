'use client'
import { BRAND } from '@/lib/brand'
export default function HeroTagline() {
  return (
    <section className="text-center py-10">
      <h1 className="text-3xl md:text-5xl font-bold">{BRAND.primaryTagline}</h1>
      <p className="mt-2 text-base md:text-lg text-neutral-600">
        {BRAND.heroSub}
      </p>
    </section>
  )
}
