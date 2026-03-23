import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const hasToken = request.cookies.get('accessToken')

    // Redirect unauthenticated users
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        if (!hasToken) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
        if (hasToken) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/login',
        '/signup/:path*',
        '/login/',
        '/signup/verify-otp'
    ],
}
