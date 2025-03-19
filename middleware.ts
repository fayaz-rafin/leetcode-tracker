import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Auth routes - only accessible to non-authenticated users
  if (user && (
    req.nextUrl.pathname.startsWith('/auth')
  )) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Protected routes - only accessible to authenticated users
  if (!user && (
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/all-problems') ||
    req.nextUrl.pathname.startsWith('/profile') ||
    req.nextUrl.pathname.startsWith('/leaderboard')
  )) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/all-problems/:path*',
    '/profile/:path*',
    '/auth/:path*',
    '/leaderboard/:path*',
  ]
}