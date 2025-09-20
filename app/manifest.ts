import { BRAND } from '@/lib/brand'
export default function manifest() {
  return {
    name: BRAND.name,
    short_name: 'Quivr',
    description: BRAND.metaDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
