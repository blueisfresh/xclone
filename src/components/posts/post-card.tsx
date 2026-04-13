"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { PostWithMeta, deletePostAction } from "@/lib/actions/posts"

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date | string): string {
    const d = new Date(date)
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(d)
}

// ── Delete modal ───────────────────────────────────────────────────────────

function DeleteModal({ postId, onClose }: { postId: number; onClose: () => void }) {
    const router = useRouter()
    const [error, formAction, pending] = useActionState(
        deletePostAction,
        undefined as string | null | undefined
    )
    const wasSubmitting = useRef(false)

    useEffect(() => {
        if (pending) wasSubmitting.current = true
        if (!pending && wasSubmitting.current) {
            wasSubmitting.current = false
            if (error === null) {
                router.refresh()
                onClose()
            }
        }
    }, [pending, error])

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Delete Post</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this post? This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="id" value={postId} />
                    {error && <p className="text-sm text-destructive mb-3">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive" disabled={pending}>
                            {pending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ── Post card ──────────────────────────────────────────────────────────────

interface PostCardProps {
    post: PostWithMeta
    currentUserId?: number
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
    const [showDelete, setShowDelete] = useState(false)

    const author = post.user
    const displayName = author?.profile?.name ?? author?.username ?? "Unknown"
    const handle = author?.username ? `@${author.username}` : null
    const initials = displayName[0]?.toUpperCase() ?? "?"
    const isOwner = currentUserId !== undefined && author?.id === currentUserId

    return (
        <>
            <div className="p-4 border-b border-border bg-background hover:bg-muted/30 transition-colors last:border-b-0">
                <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0 select-none">
                        {initials}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                        {/* Header row */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-sm font-semibold text-foreground truncate">
                                    {displayName}
                                </span>
                                {handle && (
                                    <span className="text-xs text-muted-foreground truncate">
                                        {handle}
                                    </span>
                                )}
                                <span className="text-xs text-muted-foreground shrink-0">·</span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {formatRelativeTime(post.createdAt)}
                                </span>
                            </div>
                            {isOwner && (
                                <button
                                    onClick={() => setShowDelete(true)}
                                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1 rounded"
                                    aria-label="Delete post"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                            {post.content}
                        </p>

                        {/* Counts */}
                        <div className="flex items-center gap-5 mt-3">
                            <span className="text-xs text-muted-foreground">
                                {post._count.replies} {post._count.replies === 1 ? "reply" : "replies"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {post._count.reposts} {post._count.reposts === 1 ? "repost" : "reposts"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {post._count.likes} {post._count.likes === 1 ? "like" : "likes"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {showDelete && (
                <DeleteModal postId={post.id} onClose={() => setShowDelete(false)} />
            )}
        </>
    )
}
