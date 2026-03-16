import Link from "next/link"
import NavLinks from "./nav-links"
import ProfileMenu from "./profile-menu"
import { SessionUser } from "@/lib/actions/auth"

interface HeaderProps {
    user: SessionUser
}

export default function Header({ user }: HeaderProps) {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">

                {/* Left: logo + nav */}
                <div className="flex items-center gap-4">
                    <Link href="/home" aria-label="Home">
                        <svg viewBox="0 0 24 24" className="size-5 fill-foreground">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </Link>
                    <NavLinks />
                </div>

                {/* Right: profile menu */}
                <ProfileMenu username={user.username ?? user.email} />
            </div>
        </header>
    )
}
