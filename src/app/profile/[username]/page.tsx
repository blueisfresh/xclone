import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/actions/auth"
import { getUserByUsername } from "@/lib/actions/users"
import { getPostsByUserId } from "@/lib/actions/posts"
import { getIsFollowing } from "@/lib/actions/follows"
import { POSTS_PAGE_SIZE } from "@/lib/constants"
import PostFeed from "@/components/posts/post-feed"
import FollowButton from "@/components/follows/follow-button"
import ProfileActions from "@/components/profile/profile-actions"

export default async function PublicProfilePage({
    params,
    searchParams,
}: {
    params: Promise<{ username: string }>
    searchParams: Promise<{ page?: string }>
}) {
    const { username } = await params
    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam) || 1)

    const [session, profileUser] = await Promise.all([
        getSession(),
        getUserByUsername(username),
    ])

    if (!session) redirect("/login")
    if (!profileUser) notFound()

    const isOwnProfile = session.id === profileUser.id

    const [{ posts, total }, isFollowing] = await Promise.all([
        getPostsByUserId(profileUser.id, page, POSTS_PAGE_SIZE, session.id),
        isOwnProfile ? Promise.resolve(false) : getIsFollowing(profileUser.id, session.id),
    ])

    const displayName = profileUser.profile?.name ?? profileUser.username ?? profileUser.email
    const initials = displayName[0]?.toUpperCase() ?? "?"
    const { posts: postCount, followers, following } = profileUser._count

    return (
        <div className="container mx-auto py-8 max-w-xl flex flex-col gap-6">
            {/* Profile header */}
            <div className="bg-background rounded-2xl border border-border shadow-sm p-8 flex flex-col gap-4">

                {/* Top row: avatar + action button */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center justify-center size-16 rounded-full bg-foreground text-background text-2xl font-bold shrink-0">
                        {initials}
                    </div>
                    {isOwnProfile ? (
                        <ProfileActions userId={session.id} profile={profileUser.profile ?? null} />
                    ) : (
                        <FollowButton
                            targetUserId={profileUser.id}
                            initialIsFollowing={isFollowing}
                            currentUserId={session.id}
                            size="default"
                        />
                    )}
                </div>

                {/* Name + admin badge + handle */}
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-foreground tracking-tight">
                            {displayName}
                        </h1>
                        {profileUser.role.name === "ADMIN" && (
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded-md border border-border bg-muted text-muted-foreground">
                                Admin
                            </span>
                        )}
                    </div>
                    {profileUser.username && (
                        <p className="text-sm text-muted-foreground">@{profileUser.username}</p>
                    )}
                </div>

                {/* Bio */}
                {profileUser.profile?.bio && (
                    <p className="text-sm text-foreground">{profileUser.profile.bio}</p>
                )}

                {/* Website */}
                {profileUser.profile?.website && (
                    <a
                        href={profileUser.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground underline underline-offset-4 hover:opacity-70 w-fit"
                    >
                        {profileUser.profile.website}
                    </a>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                    <span>
                        <strong className="text-foreground">{postCount}</strong>{" "}
                        <span className="text-muted-foreground">Posts</span>
                    </span>
                    <span>
                        <strong className="text-foreground">{following}</strong>{" "}
                        <span className="text-muted-foreground">Following</span>
                    </span>
                    <span>
                        <strong className="text-foreground">{followers}</strong>{" "}
                        <span className="text-muted-foreground">Followers</span>
                    </span>
                </div>
            </div>

            {/* Posts feed */}
            <PostFeed
                posts={posts}
                total={total}
                page={page}
                pageSize={POSTS_PAGE_SIZE}
                currentUserId={session.id}
                emptyMessage="No posts yet."
            />
        </div>
    )
}
