import { match } from 'assert'
import { log } from 'console'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {

    if ((request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/dashboard/settings') || request.nextUrl.pathname.startsWith('/dashboard/resources') || request.nextUrl.pathname.startsWith('/dashboard/ai-chat') || request.nextUrl.pathname.startsWith('/dashboard/courses')) && !request.cookies.get('accessToken')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if ((request.nextUrl.pathname.startsWith('/login')) && request.cookies.get('accessToken')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if ((request.nextUrl.pathname.startsWith('/signup') || request.nextUrl.pathname.startsWith('/signup/verify-otp')) && request.cookies.get('accessToken')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // return NextResponse.redirect(new URL('/login', request.url))
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
    matcher: ['/dashboard', '/login', '/signup', '/dashboard/settings', '/dashboard/resources', '/dashboard/ai-chat', '/dashboard/courses', '/login/', '/signup/verify-otp'],
}
