"use client"

import { useActionState, useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Heart, MessageCircle, Repeat2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { PostWithMeta, deletePostAction, likePostAction, repostPostAction } from "@/lib/actions/posts"

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
    const [isPending, startTransition] = useTransition()

    // Optimistic state for interactions - assuming that the server will succeed and update the UI instantly
    const [likeCount, setLikeCount] = useState(post._count.likes)
    const [isLiked, setIsLiked] = useState(post.isLikedByUser || false)
    const [repostCount, setRepostCount] = useState(post._count.reposts)
    const [isReposted, setIsReposted] = useState(post.isRepostedByUser || false)

    const author = post.user
    const displayName = author?.profile?.name ?? author?.username ?? "Unknown"
    const handle = author?.username ? `@${author.username}` : null
    const initials = displayName[0]?.toUpperCase() ?? "?"
    const isOwner = currentUserId !== undefined && author?.id === currentUserId
    const canInteract = currentUserId !== undefined

    const handleLike = () => {
        if (!canInteract) return

        // Optimistic update
        const newLiked = !isLiked
        setIsLiked(newLiked)
        setLikeCount(newLiked ? likeCount + 1 : likeCount - 1)

        startTransition(async () => {
            try {
                const formData = new FormData()
                formData.append("postId", String(post.id))
                const result = await likePostAction(null, formData)

                if (result) {
                    // Error occurred, revert
                    setIsLiked(!newLiked)
                    setLikeCount(!newLiked ? likeCount + 1 : likeCount - 1)
                }
            } catch {
                // Revert on error
                setIsLiked(!newLiked)
                setLikeCount(!newLiked ? likeCount + 1 : likeCount - 1)
            }
        })
    }

    const handleRepost = () => {
        if (!canInteract) return

        // Optimistic update
        const newReposted = !isReposted
        setIsReposted(newReposted)
        setRepostCount(newReposted ? repostCount + 1 : repostCount - 1)

        // while server is processing like the like button is disabled to prevent double clicks
        startTransition(async () => {
            try {
                const formData = new FormData()
                formData.append("postId", String(post.id))
                const result = await repostPostAction(null, formData)

                if (result) {
                    // Error occurred, revert
                    setIsReposted(!newReposted)
                    setRepostCount(!newReposted ? repostCount + 1 : repostCount - 1)
                }
            } catch {
                // Revert on error
                setIsReposted(!newReposted)
                setRepostCount(!newReposted ? repostCount + 1 : repostCount - 1)
            }
        })
    }

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

                        {/* Action buttons */}
                        <div className="flex items-center gap-6 mt-3">
                            {/* Reply */}
                            <button
                                data-action="reply"
                                onClick={() => router.push(`/posts/${post.id}`)}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors active:scale-110 disabled:opacity-50"
                                disabled={!canInteract || isPending}
                                aria-label={`${post._count.replies} replies`}
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{post._count.replies}</span>
                            </button>

                            {/* Repost */}
                            <button
                                data-action="repost"
                                onClick={handleRepost}
                                style={isReposted ? { color: "#2FA084" } : undefined}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors active:scale-110 disabled:opacity-50"
                                disabled={!canInteract || isPending}
                                aria-label={isReposted ? "Unrepost" : "Repost"}
                            >
                                <Repeat2 className={`w-3.5 h-3.5 ${isReposted ? "fill-current" : ""}`} />
                                <span>{repostCount}</span>
                            </button>

                            {/* Like */}
                            <button
                                data-action="like"
                                onClick={handleLike}
                                style={isLiked ? { color: "#f87171" } : undefined}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors active:scale-110 disabled:opacity-50"
                                disabled={!canInteract || isPending}
                                aria-label={isLiked ? "Unlike" : "Like"}
                            >
                                <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                                <span>{likeCount}</span>
                            </button>
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
