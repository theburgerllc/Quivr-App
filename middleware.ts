import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/admin')) {
    const role = req.cookies.get('role')?.value
    if (role !== 'admin') {
      const url = req.nextUrl.clone(); url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}
export const config = { matcher: ['/admin/:path*'] }
