"use client"

import { useActionState } from "react"
import { loginAction } from "@/lib/actions/auth"

export default function LoginPage() {
    const [error, formAction, pending] = useActionState(loginAction, null)

    return (
        <form action={formAction}>
            {error && <p>{error}</p>}
            <input
                type="text"
                name="identifier"
                placeholder="Email or Username"
                required
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                required
            />
            <button type="submit" disabled={pending}>
                {pending ? "Signing in..." : "Login"}
            </button>
        </form>
    )
}
