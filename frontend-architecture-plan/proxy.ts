import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function proxy(request: NextRequest) {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")

    // If the user tries to access the dashboard without an access token, redirect to login
        // if (request.nextUrl.pathname.startsWith('/dashboard') || !accessToken) {
        //     return NextResponse.redirect(new URL('/login', request.url))
        // }

    return NextResponse.next()
}

export const config = {
    // Apply this middleware to the dashboard and about pages
    matcher: ['/dashboard/:path*', '/about/:path*'],
}