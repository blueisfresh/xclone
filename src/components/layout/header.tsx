import Link from "next/link"
import NavLinks from "./nav-links"
import ProfileMenu from "./profile-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { SessionUser } from "@/lib/actions/auth"

interface HeaderProps {
    user: SessionUser
}

export default function Header({ user }: HeaderProps) {
    return (
        <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="max-w-2xl mx-auto flex h-14 w-full items-center justify-between px-4">

                {/* Left: logo + nav */}
                <div className="flex items-center gap-4">
                    <Link href="/home" aria-label="Home">
                        <svg viewBox="0 0 24 24" className="size-5 fill-foreground">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </Link>
                    <NavLinks isAdmin={user.role.name === "ADMIN"} />
                </div>

                {/* Right: theme toggle + profile menu */}
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <ProfileMenu username={user.username ?? user.email} />
                </div>
            </div>
        </header>
    )
}
