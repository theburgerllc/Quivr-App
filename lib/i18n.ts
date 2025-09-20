'use client'
const dicts: Record<string, Record<string, string>> = {
  en: {
    upload: 'Upload',
    longPressToFavorite: 'Long‑press to favorite ⭐',
    favorited: 'Favorited ★',
    goPremium: 'Go Premium',
  },
  es: {
    upload: 'Subir',
    longPressToFavorite: 'Mantén pulsado para favorito ⭐',
    favorited: 'Marcado ★',
    goPremium: 'Hazte Premium',
  },
}
export function t(key: string, lang = 'en') {
  return dicts[lang]?.[key] || key
}
