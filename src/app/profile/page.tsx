import { redirect } from "next/navigation"
import { getSession } from "@/lib/actions/auth"

export default async function ProfilePage() {
    const user = await getSession()
    if (!user) redirect("/login")
    redirect(`/profile/${user.username ?? user.email}`)
}
