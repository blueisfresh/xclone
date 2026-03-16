import { getSession } from "@/lib/actions/auth"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
    const user = await getSession()
    if (!user) redirect("/login")

    return (
        <div className="container mx-auto py-8 max-w-xl">
            <div className="bg-background rounded-2xl border border-border shadow-sm p-8 flex flex-col items-center gap-4">

                {/* Avatar */}
                <div className="flex items-center justify-center size-20 rounded-full bg-foreground text-background text-3xl font-bold">
                    {(user.username ?? user.email)[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex flex-col items-center gap-1">
                    <h1 className="text-xl font-bold text-foreground tracking-tight">
                        @{user.username ?? user.email}
                    </h1>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
            </div>
        </div>
    )
}
