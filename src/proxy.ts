import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE = "session_token"

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"])

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value

    const isPublicRoute = PUBLIC_ROUTES.has(pathname)

    // Authenticated user hitting public routes → send to home
    if (isPublicRoute && sessionToken) {
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
        // Exclude all Next.js internals (_next/*), favicon, and static assets
        "/((?!_next/|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
