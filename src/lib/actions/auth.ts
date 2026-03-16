"use server"

import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import bcrypt from "bcrypt"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { LoginSchema, SignupSchema } from "@/lib/validations/auth"

const SESSION_COOKIE = "session_token"
const SESSION_DURATION_DAYS = 30

const sessionUserSelect = {
    id: true,
    email: true,
    username: true,
    newUser: true,
    provider: true,
    providerId: true,
    createdAt: true,
} satisfies Prisma.UserSelect

export type SessionUser = Prisma.UserGetPayload<{ select: typeof sessionUserSelect }>

// ── Private helper ─────────────────────────────────────────────────────────

async function createSession(userId: number) {
    const token = crypto.randomUUID()
    const expirationTime = new Date()
    expirationTime.setDate(expirationTime.getDate() + SESSION_DURATION_DAYS)

    await prisma.session.create({
        data: { refreshToken: token, expirationTime, userId },
    })

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expirationTime,
        path: "/",
    })
}

// ── Actions ────────────────────────────────────────────────────────────────

export async function loginAction(
    _prevState: string | null,
    formData: FormData
): Promise<string | null> {
    const result = LoginSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) return result.error.issues[0]?.message ?? "Validation failed"

    const { identifier, password } = result.data

    const user = await prisma.user.findFirst({
        where: { OR: [{ email: identifier }, { username: identifier }] },
    })

    if (!user || !user.hashedPassword) return "Invalid credentials"

    const passwordMatch = await bcrypt.compare(password, user.hashedPassword)
    if (!passwordMatch) return "Invalid credentials"

    await createSession(user.id)
    redirect("/home")
}

export async function signupAction(
    _prevState: string | null,
    formData: FormData
): Promise<string | null> {
    const result = SignupSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) return result.error.issues[0]?.message ?? "Validation failed"

    const { username, email, password } = result.data

    const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
    })
    if (existing?.email === email) return "An account with this email already exists"
    if (existing?.username === username) return "Username is already taken"

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
        data: { email, username, hashedPassword, newUser: true },
    })

    await createSession(user.id)
    redirect("/home")
}

export async function logoutAction() {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (token) {
        await prisma.session.deleteMany({ where: { refreshToken: token } })
        cookieStore.delete(SESSION_COOKIE)
    }

    redirect("/login")
}

export async function getSession(): Promise<SessionUser | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (!token) return null

    const session = await prisma.session.findFirst({
        where: {
            refreshToken: token,
            expirationTime: { gt: new Date() },
        },
        select: { user: { select: sessionUserSelect } },
    })

    return session?.user ?? null
}
