"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PostWithMeta } from "@/lib/actions/posts"
import PostCard from "./post-card"

interface PostFeedProps {
    posts: PostWithMeta[]
    total: number
    page: number
    pageSize: number
    currentUserId?: number
}

export default function PostFeed({ posts, total, page, pageSize, currentUserId }: PostFeedProps) {
    const router = useRouter()
    const totalPages = Math.ceil(total / pageSize)
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, total)

    return (
        <div className="border border-border rounded-xl overflow-hidden">
            {posts.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                    No posts yet. Be the first to post!
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
                        onClick={() => router.push(`?page=${page - 1}`)}
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
                        onClick={() => router.push(`?page=${page + 1}`)}
                        disabled={page >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
