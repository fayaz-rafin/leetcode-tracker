import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const isLoopback = ['localhost', '127.0.0.1', '::1'].includes(
    req.nextUrl.hostname
  )

  if (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_LOCAL_AUTH_BYPASS === 'true' &&
    isLoopback
  ) {
    return NextResponse.next({ request: req })
  }

  let res = NextResponse.next({ request: req })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const redirect = (pathname: string) => {
    const response = NextResponse.redirect(new URL(pathname, req.url))
    res.cookies.getAll().forEach(({ name, value, ...options }) => {
      response.cookies.set(name, value, options)
    })
    return response
  }

  // Auth routes - only accessible to non-authenticated users
  if (user && (
    req.nextUrl.pathname.startsWith('/auth')
  )) {
    return redirect('/dashboard')
  }

  // Protected routes - only accessible to authenticated users
  if (!user && (
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/all-problems') ||
    req.nextUrl.pathname.startsWith('/profile') ||
    req.nextUrl.pathname.startsWith('/leaderboard')
  )) {
    return redirect('/auth/login')
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
