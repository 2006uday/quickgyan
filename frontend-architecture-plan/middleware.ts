import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value
  const { pathname } = request.nextUrl

  // Protected paths: /dashboard, /dashboard/*, /admin, /admin/*
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  // If user tries to access protected route without accessToken, redirect to /login
  if (isProtected && !accessToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is already authenticated and visits /login or /signup, redirect to /dashboard
  const isAuthRoute = pathname === '/login' || pathname === '/signup'
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
  ],
}
