// lib/auth.ts
import { cookies } from 'next/headers'

export async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get('uid')?.value || ''
}

// Admin helpers
export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value || ''
  return role === 'admin'
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error('FORBIDDEN: admin required')
}
