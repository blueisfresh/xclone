import { redirect } from "next/navigation"
import { getSession } from "@/lib/actions/auth"
import { getPosts, getFollowingPosts, getNewestPostId } from "@/lib/actions/posts"
import { POSTS_PAGE_SIZE } from "@/lib/constants"
import PostComposer from "@/components/posts/post-composer"
import PostFeed from "@/components/posts/post-feed"
import NewPostsBanner from "@/components/posts/new-posts-banner"
import HomeTabs from "@/components/home/home-tabs"

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; tab?: string }>
}) {
    const user = await getSession()
    if (!user) redirect("/api/auth/signout")

    const { page: pageParam, tab: tabParam } = await searchParams
    const tab = tabParam === "following" ? "following" : "for-you"
    const page = Math.max(1, Number(pageParam) || 1)

    const [{ posts, total }, newestPostId] = await Promise.all([
        tab === "following"
            ? getFollowingPosts(page, POSTS_PAGE_SIZE, user.id)
            : getPosts(page, POSTS_PAGE_SIZE, user.id),
        tab === "for-you" ? getNewestPostId() : Promise.resolve(null),
    ])

    return (
        <div className="min-h-screen bg-muted">
        <div className="container mx-auto py-8 max-w-2xl px-4">
            <PostComposer />
            <div className="mt-6 flex flex-col gap-4">
                <HomeTabs activeTab={tab} />
                {tab === "for-you" && <NewPostsBanner initialNewestId={newestPostId} />}
                <PostFeed
                    posts={posts}
                    total={total}
                    page={page}
                    pageSize={POSTS_PAGE_SIZE}
                    currentUserId={user.id}
                    emptyMessage={
                        tab === "following"
                            ? "Follow some people to see their posts here."
                            : undefined
                    }
                />
            </div>
        </div>
        </div>
    )
}
