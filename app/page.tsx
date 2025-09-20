export default function Home() {
  return (
    <div className="container py-16">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
        Meet nearby. <span className="text-brand-400">On your terms.</span>
      </h1>
      <p className="mt-5 max-w-2xl text-white/80">
        A polished LGBTQIA+ dating app blending a proximity grid with an
        interactive map. Realtime chat, privacy-first location, powerful
        filters, and optional Plus features.
      </p>
      <div className="mt-8 flex gap-4">
        <a href="/grid" className="btn-primary">
          Open Grid
        </a>
        <a href="/map" className="btn-ghost">
          Open Map
        </a>
      </div>
    </div>
  )
}
