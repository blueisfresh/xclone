"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PostWithMeta } from "@/lib/actions/posts"
import PostCard from "./post-card"

interface PostFeedProps {
    posts: PostWithMeta[]
    total: number
    page: number
    pageSize: number
    currentUserId?: number
    emptyMessage?: string
}

export default function PostFeed({ posts, total, page, pageSize, currentUserId, emptyMessage = "No posts yet. Be the first to post!" }: PostFeedProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const totalPages = Math.ceil(total / pageSize)

    function buildPageUrl(newPage: number) {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", String(newPage))
        return `?${params.toString()}`
    }
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, total)

    return (
        <div className="border border-border/70 rounded-xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]">
            {posts.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                </div>
            ) : (
                posts.map((post) => (
                    <PostCard key={post.id} post={post} currentUserId={currentUserId} />
                ))
            )}

            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background">
                <p className="text-sm text-muted-foreground">
                    {total === 0
                        ? "No posts"
                        : `Showing ${start}–${end} of ${total} posts`}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(buildPageUrl(page - 1))}
                        disabled={page <= 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-1">
                        Page {page} of {totalPages || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(buildPageUrl(page + 1))}
                        disabled={page >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
