'use client'
type Props = { user: any }
function initials(name?: string) {
  const n = (name || 'U N').trim().split(/\s+/).slice(0, 2)
  return n.map((s) => s[0]?.toUpperCase() || '').join('') || 'U'
}
export default function SpotlightCard({ user }: Props) {
  const name = user.displayName || user.username || 'Unnamed'
  const age = user.age ? `${user.age} • ` : ''
  const city = [user.city, user.country].filter(Boolean).join(', ')
  const avatar = user.avatarUrl || user.photoUrl || user.photo || null
  return (
    <article
      role="listitem"
      tabIndex={0}
      onClick={() => (window.location.href = `/profile/${user.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ')
          window.location.href = `/profile/${user.id}`
      }}
      className="min-w-[220px] max-w-[240px] select-none rounded-2xl border shadow-sm p-3 bg-gradient-to-b from-white to-neutral-50 hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black cursor-pointer"
      aria-label={`Open profile ${name}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-1 ring-black/5 bg-gradient-to-br from-neutral-200 to-neutral-100 flex items-center justify-center text-sm font-semibold">
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>{initials(name)}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{name}</div>
          <div className="text-xs text-neutral-600 truncate">
            {age}
            {city}
          </div>
        </div>
      </div>
      <button
        className="mt-3 w-full px-3 py-1.5 rounded-xl bg-black text-white text-sm hover:opacity-90"
        aria-label={`View ${name}'s profile`}
      >
        View
      </button>
    </article>
  )
}
