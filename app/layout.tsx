import { BRAND } from '@/lib/brand'
import './globals.css'
import type { Metadata } from 'next'

export const metadata = {
  title: 'Quivr — for the ones who linger',
  description:
    'Quivr is for people who take their time—private, queer-inclusive, and unrushed.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white px-3 py-2 rounded"
        >
          Skip to content
        </a>
        <div className="min-h-dvh flex flex-col">
          <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10 bg-black/20">
            <nav className="container flex items-center gap-4 py-3">
              <a href="/" className="font-semibold tracking-wide">
                🌈 lingr
              </a>
              <div className="ml-auto flex items-center gap-3 text-sm">
                <a href="/grid" className="hover:text-brand-300">
                  Grid
                </a>
                <a href="/map" className="hover:text-brand-300">
                  Map
                </a>
                <a href="/messages" className="hover:text-brand-300">
                  Messages
                </a>
                <a href="/profile" className="hover:text-brand-300">
                  My profile
                </a>
                <a href="/plus" className="badge border-brand-500/40">
                  Plus
                </a>
              </div>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 text-xs text-white/60 py-6 text-center">
            © {new Date().getFullYear()} lingr
          </footer>
        </div>
      </body>
    </html>
  )
}
