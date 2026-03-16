"use client"

import { useEffect, useRef, useState } from "react"
import { logoutAction } from "@/lib/actions/auth"
import Link from "next/link"

interface ProfileMenuProps {
    username: string
}

export default function ProfileMenu({ username }: ProfileMenuProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div ref={ref} className="relative">
            {/* Avatar button */}
            <Link
                href="/profile"
                onClick={(e) => { e.preventDefault(); setOpen((o) => !o) }}
                className="flex items-center justify-center size-9 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity"
                aria-label="Open profile menu"
            >
                {username[0].toUpperCase()}
            </Link>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-background shadow-md overflow-hidden z-50">
                    <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex flex-col px-4 py-3 border-b border-border hover:bg-muted transition-colors"
                    >
                        {/* Avatar row */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center size-9 rounded-full bg-foreground text-background text-sm font-semibold flex-shrink-0">
                                {username[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-foreground truncate">
                                    @{username}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    View profile
                                </span>
                            </div>
                        </div>
                    </Link>

                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                            Log out @{username}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
