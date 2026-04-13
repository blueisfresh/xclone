import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/actions/auth"
import { getPostById, getReplies } from "@/lib/actions/posts"
import { POSTS_PAGE_SIZE } from "@/lib/constants"
import PostCard from "@/components/posts/post-card"
import ReplyComposer from "@/components/posts/reply-composer"
import PostFeed from "@/components/posts/post-feed"

export default async function PostDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ page?: string }>
}) {
    const user = await getSession()
    if (!user) redirect("/login")

    const { id } = await params
    const postId = Number(id)
    if (!postId) notFound()

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam) || 1)

    const [post, { posts: replies, total }] = await Promise.all([
        getPostById(postId, user.id),
        getReplies(postId, page, POSTS_PAGE_SIZE, user.id),
    ])

    if (!post) notFound()

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            {/* Parent post */}
            <div className="border border-border rounded-xl overflow-hidden mb-6">
                <PostCard post={post} currentUserId={user.id} />
            </div>

            {/* Reply composer */}
            <ReplyComposer postId={postId} />

            {/* Replies */}
            <div className="mt-6">
                <PostFeed
                    posts={replies}
                    total={total}
                    page={page}
                    pageSize={POSTS_PAGE_SIZE}
                    currentUserId={user.id}
                    emptyMessage="No replies yet. Be the first to reply!"
                />
            </div>
        </div>
    )
}
