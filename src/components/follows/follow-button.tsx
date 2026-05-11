"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { followUserAction } from "@/lib/actions/follows"

interface FollowButtonProps {
    targetUserId: number
    initialIsFollowing: boolean
    currentUserId?: number
    size?: "default" | "sm"
}

export default function FollowButton({
    targetUserId,
    initialIsFollowing,
    currentUserId,
    size = "sm",
}: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [isPending, startTransition] = useTransition()

    if (!currentUserId || targetUserId === currentUserId) return null

    const handleFollow = (e: React.MouseEvent) => {
        e.stopPropagation()

        const optimistic = !isFollowing
        setIsFollowing(optimistic)

        startTransition(async () => {
            const formData = new FormData()
            formData.append("targetUserId", String(targetUserId))
            const result = await followUserAction(null, formData)
            if (result) {
                // Revert on error
                setIsFollowing(!optimistic)
            }
        })
    }

    return (
        <Button
            variant={isFollowing ? "outline" : "default"}
            size={size}
            onClick={handleFollow}
            disabled={isPending}
            className="h-6 text-xs px-2.5"
        >
            {isFollowing ? "Following" : "Follow"}
        </Button>
    )
}
