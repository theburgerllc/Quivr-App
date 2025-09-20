'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function MyProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [photo, setPhoto] = useState<string>('')
  const [displayName, setDisplayName] = useState('')
  const [showDistance, setShowDistance] = useState(true)

  useEffect(() => {
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) {
        setProfile(data)
        setPhoto(data.photo_url || '')
        setDisplayName(data.display_name || '')
        setShowDistance(data.show_distance ?? true)
      }
    })()
  }, [])

  async function save() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        photo_url: photo,
        show_distance: showDistance,
      })
      .eq('id', user.id)
    alert('Saved')
  }
  async function setLocationFromBrowser() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await supabase
        .from('profiles')
        .update({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        .eq('id', user.id)
      alert('Location updated')
    })
  }

  return (
    <div className="container py-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="label">Display name</label>
          <input
            className="input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Photo URL</label>
          <input
            className="input"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
          />
        </div>
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={showDistance}
            onChange={(e) => setShowDistance(e.target.checked)}
          />
          Show distance to others
        </label>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={save}>
            Save
          </button>
          <button className="btn-ghost" onClick={setLocationFromBrowser}>
            Use my location
          </button>
        </div>
      </div>
    </div>
  )
}
