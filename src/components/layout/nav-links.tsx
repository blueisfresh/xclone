"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users } from "lucide-react"

interface NavLinksProps {
    isAdmin: boolean
}

export default function NavLinks({ isAdmin }: NavLinksProps) {
    const pathname = usePathname()

    const links = [
        { href: "/home",  label: "Home",  icon: Home },
        ...(isAdmin ? [{ href: "/users", label: "Users", icon: Users }] : []),
    ]

    return (
        <nav className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/")
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            active
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <Icon className="size-4" />
                        {label}
                    </Link>
                )
            })}
        </nav>
    )
}
