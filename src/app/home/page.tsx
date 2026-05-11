import { redirect } from "next/navigation"
import { getSession } from "@/lib/actions/auth"
import { getPosts, getNewestPostId } from "@/lib/actions/posts"
import { POSTS_PAGE_SIZE } from "@/lib/constants"
import PostComposer from "@/components/posts/post-composer"
import PostFeed from "@/components/posts/post-feed"
import NewPostsBanner from "@/components/posts/new-posts-banner"

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const user = await getSession()
    if (!user) redirect("/api/auth/signout")

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam) || 1)

    const [{ posts, total }, newestPostId] = await Promise.all([
        getPosts(page, POSTS_PAGE_SIZE, user.id),
        getNewestPostId(),
    ])

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <PostComposer />
            <div className="mt-6 flex flex-col gap-4">
                <NewPostsBanner initialNewestId={newestPostId} />
                <PostFeed
                    posts={posts}
                    total={total}
                    page={page}
                    pageSize={POSTS_PAGE_SIZE}
                    currentUserId={user.id}
                />
            </div>
        </div>
    )
}
