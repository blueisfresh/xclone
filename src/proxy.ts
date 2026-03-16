import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE = "session_token"

// Routes accessible without a session
const PUBLIC_ROUTES = new Set(["/", "/login"])

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value

    const isPublicRoute = PUBLIC_ROUTES.has(pathname)

    // Authenticated user hitting login → send to home
    if (pathname === "/login" && sessionToken) {
        return NextResponse.redirect(new URL("/home", request.url))
    }

    // Unauthenticated user hitting a protected route → send to login
    if (!isPublicRoute && !sessionToken) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Match everything except Next.js internals and static assets
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
