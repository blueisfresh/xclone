"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getNewestPostId } from "@/lib/actions/posts"

const POLL_INTERVAL = 30_000 // 30 seconds

export default function NewPostsBanner({ initialNewestId }: { initialNewestId: number | null }) {
    const router = useRouter()
    const [hasNew, setHasNew] = useState(false)
    const [knownNewestId, setKnownNewestId] = useState(initialNewestId)

    // When the feed refreshes, reset the banner with the new newest ID
    useEffect(() => {
        setKnownNewestId(initialNewestId)
        setHasNew(false)
    }, [initialNewestId])

    // Poll for new posts in the background
    useEffect(() => {
        const interval = setInterval(async () => {
            const latestId = await getNewestPostId()
            if (latestId && knownNewestId && latestId > knownNewestId) {
                setHasNew(true)
            }
        }, POLL_INTERVAL)

        return () => clearInterval(interval)
    }, [knownNewestId])

    if (!hasNew) return null

    const handleClick = async () => {
        router.refresh()
        const latestId = await getNewestPostId()
        setKnownNewestId(latestId)
        setHasNew(false)
    }

    return (
        <button
            onClick={handleClick}
            className="w-full text-center text-sm py-2.5 bg-foreground text-background rounded-xl hover:opacity-80 transition-opacity font-medium"
        >
            New posts available — click to refresh
        </button>
    )
}
