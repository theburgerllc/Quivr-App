import { getCurrentUserId } from '@/lib/auth'
import ProfileHeader from '@/components/ProfileHeader'
export default async function ProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const currentUserId = await getCurrentUserId()
  return (
    <>
      <ProfileHeader currentUserId={currentUserId} />
      <main className="p-4">Profile body for {params.id}</main>
    </>
  )
}
