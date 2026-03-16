"use client"

import { useActionState } from "react"
import { loginAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
    const [error, formAction, pending] = useActionState(loginAction, null)

    return (
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-background rounded-2xl border border-border shadow-sm p-8 flex flex-col gap-6">

                {/* X Logo */}
                <div className="flex justify-center">
                    <svg viewBox="0 0 24 24" className="size-8 fill-foreground" aria-label="X">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                </div>

                {/* Heading */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        Sign in to X
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email or username and password.
                    </p>
                </div>

                {/* Form */}
                <form action={formAction} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="identifier" className="text-sm font-medium text-foreground">
                            Email or username
                        </label>
                        <input
                            id="identifier"
                            name="identifier"
                            type="text"
                            placeholder="name@example.com"
                            required
                            autoComplete="username"
                            className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-sm font-medium text-foreground">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <Button type="submit" disabled={pending} className="w-full mt-1">
                        {pending ? "Signing in..." : "Sign in"}
                    </Button>
                </form>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <a href="/register" className="font-medium text-foreground underline underline-offset-4 hover:opacity-70">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    )
}
