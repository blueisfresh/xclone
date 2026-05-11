"use client"

import { useRouter } from "next/navigation"

interface HomeTabsProps {
    activeTab: "for-you" | "following"
}

export default function HomeTabs({ activeTab }: HomeTabsProps) {
    const router = useRouter()

    return (
        <div className="flex border-b border-border mb-4">
            <button
                onClick={() => router.push("?tab=for-you")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === "for-you"
                        ? "border-b-2 border-foreground text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                For You
            </button>
            <button
                onClick={() => router.push("?tab=following")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === "following"
                        ? "border-b-2 border-foreground text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                Following
            </button>
        </div>
    )
}
