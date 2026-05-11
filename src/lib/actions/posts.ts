"use server"

import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getSession } from "@/lib/actions/auth"
import { CreatePostSchema, DeletePostSchema, LikePostSchema, RepostPostSchema } from "@/lib/validations/posts"
import { POSTS_PAGE_SIZE } from "@/lib/constants"

// ── Select consts ──────────────────────────────────────────────────────────

const postSelect = {
    id: true,
    content: true,
    createdAt: true,
    parentPostId: true,
    parent: {
        select: {
            user: { select: { username: true } },
        },
    },
    user: {
        select: {
            id: true,
            username: true,
            profile: { select: { name: true, img: true } },
        },
    },
    _count: { select: { likes: true, reposts: true, replies: true } },
} satisfies Prisma.PostSelect

// ── Types ──────────────────────────────────────────────────────────────────

export type PostWithMeta = Prisma.PostGetPayload<{ select: typeof postSelect }> & {
    isLikedByUser?: boolean
    isRepostedByUser?: boolean
    isFollowedByUser?: boolean
}

// ── Read ───────────────────────────────────────────────────────────────────

export async function getPosts(
    page = 1,
    pageSize = POSTS_PAGE_SIZE,
    currentUserId?: number
): Promise<{ posts: PostWithMeta[]; total: number }> {
    const skip = (page - 1) * pageSize
    const [posts, total, userLikes, userReposts, userFollows] = await Promise.all([
        prisma.post.findMany({
            select: postSelect,
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.post.count(),
        currentUserId ? prisma.like.findMany({
            where: { userId: currentUserId },
            select: { postId: true },
        }) : Promise.resolve([]),
        currentUserId ? prisma.repost.findMany({
            where: { userId: currentUserId },
            select: { postId: true },
        }) : Promise.resolve([]),
        currentUserId ? prisma.userFollows.findMany({
            where: { followerId: currentUserId },
            select: { userId: true },
        }) : Promise.resolve([]),
    ])

    const userLikeIds = new Set(userLikes.map((l) => l.postId))
    const userRepostIds = new Set(userReposts.map((r) => r.postId))
    const followedUserIds = new Set(userFollows.map((f) => f.userId))

    return {
        posts: posts.map((p) => ({
            ...p,
            isLikedByUser: userLikeIds.has(p.id),
            isRepostedByUser: userRepostIds.has(p.id),
            isFollowedByUser: followedUserIds.has(p.user?.id ?? -1),
        })),
        total,
    }
}

export async function getFollowingPosts(
    page = 1,
    pageSize = POSTS_PAGE_SIZE,
    currentUserId: number
): Promise<{ posts: PostWithMeta[]; total: number }> {
    const skip = (page - 1) * pageSize

    const follows = await prisma.userFollows.findMany({
        where: { followerId: currentUserId },
        select: { userId: true },
    })
    const followedIds = follows.map((f) => f.userId)

    if (followedIds.length === 0) return { posts: [], total: 0 }

    const [posts, total, userLikes, userReposts] = await Promise.all([
        prisma.post.findMany({
            where: { userId: { in: followedIds } },
            select: postSelect,
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.post.count({ where: { userId: { in: followedIds } } }),
        prisma.like.findMany({ where: { userId: currentUserId }, select: { postId: true } }),
        prisma.repost.findMany({ where: { userId: currentUserId }, select: { postId: true } }),
    ])

    const userLikeIds = new Set(userLikes.map((l) => l.postId))
    const userRepostIds = new Set(userReposts.map((r) => r.postId))
    const followedUserIds = new Set(followedIds)

    return {
        posts: posts.map((p) => ({
            ...p,
            isLikedByUser: userLikeIds.has(p.id),
            isRepostedByUser: userRepostIds.has(p.id),
            isFollowedByUser: followedUserIds.has(p.user?.id ?? -1),
        })),
        total,
    }
}

export async function getNewestPostId(): Promise<number | null> {
    const post = await prisma.post.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true },
    })
    return post?.id ?? null
}

export async function getPostById(
    id: number,
    currentUserId?: number
): Promise<PostWithMeta | null> {
    const postData = await prisma.post.findUnique({ where: { id }, select: postSelect })
    if (!postData) return null

    const [userLike, userRepost, userFollow] = await Promise.all([
        currentUserId
            ? prisma.like.findUnique({
                  where: { postId_userId: { postId: id, userId: currentUserId } },
                  select: { postId: true },
              })
            : Promise.resolve(null),
        currentUserId
            ? prisma.repost.findUnique({
                  where: { postId_userId: { postId: id, userId: currentUserId } },
                  select: { postId: true },
              })
            : Promise.resolve(null),
        currentUserId && postData.user?.id
            ? prisma.userFollows.findUnique({
                  where: { userId_followerId: { userId: postData.user.id, followerId: currentUserId } },
              })
            : Promise.resolve(null),
    ])

    return {
        ...postData,
        isLikedByUser: !!userLike,
        isRepostedByUser: !!userRepost,
        isFollowedByUser: !!userFollow,
    }
}

export async function getReplies(
    postId: number,
    page = 1,
    pageSize = POSTS_PAGE_SIZE,
    currentUserId?: number
): Promise<{ posts: PostWithMeta[]; total: number }> {
    const skip = (page - 1) * pageSize
    const [posts, total, userLikes, userReposts, userFollows] = await Promise.all([
        prisma.post.findMany({
            where: { parentPostId: postId },
            select: postSelect,
            orderBy: { createdAt: "asc" },
            skip,
            take: pageSize,
        }),
        prisma.post.count({ where: { parentPostId: postId } }),
        currentUserId
            ? prisma.like.findMany({ where: { userId: currentUserId }, select: { postId: true } })
            : Promise.resolve([]),
        currentUserId
            ? prisma.repost.findMany({ where: { userId: currentUserId }, select: { postId: true } })
            : Promise.resolve([]),
        currentUserId
            ? prisma.userFollows.findMany({
                  where: { followerId: currentUserId },
                  select: { userId: true },
              })
            : Promise.resolve([]),
    ])

    const userLikeIds = new Set(userLikes.map((l) => l.postId))
    const userRepostIds = new Set(userReposts.map((r) => r.postId))
    const followedUserIds = new Set(userFollows.map((f) => f.userId))

    return {
        posts: posts.map((p) => ({
            ...p,
            isLikedByUser: userLikeIds.has(p.id),
            isRepostedByUser: userRepostIds.has(p.id),
            isFollowedByUser: followedUserIds.has(p.user?.id ?? -1),
        })),
        total,
    }
}

// ── Modal actions ──────────────────────────────────────────────────────────

export async function createPostAction(
    _prev: string | null | undefined,
    formData: FormData
): Promise<string | null> {
    const user = await getSession()
    if (!user) return "You must be logged in to post"

    const result = CreatePostSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) return result.error.issues[0]?.message ?? "Validation failed"

    try {
        await prisma.post.create({
            data: {
                content: result.data.content,
                userId: user.id,
                parentPostId: result.data.parentPostId ?? null,
            },
        })
        return null
    } catch {
        return "Failed to create post"
    }
}

export async function deletePostAction(
    _prev: string | null | undefined,
    formData: FormData
): Promise<string | null> {
    const user = await getSession()
    if (!user) return "Not authenticated"

    const result = DeletePostSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) return result.error.issues[0]?.message ?? "Validation failed"

    try {
        const post = await prisma.post.findUnique({
            where: { id: result.data.id },
            select: { userId: true },
        })
        if (!post) return "Post not found"
        if (post.userId !== user.id) return "Not authorized"

        await prisma.post.delete({ where: { id: result.data.id } })
        return null
    } catch {
        return "Failed to delete post"
    }
}

export async function likePostAction(
    _prev: string | null | undefined,
    formData: FormData
): Promise<string | null> {
    const user = await getSession()
    if (!user) return "Not authenticated"

    const result = LikePostSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) return result.error.issues[0]?.message ?? "Validation failed"

    const { postId } = result.data

    try {
        // finding like record
        const existing = await prisma.like.findUnique({
            where: { postId_userId: { postId, userId: user.id } },
        })

        if (existing) {
            // Unlike
            await prisma.like.delete({
                where: { postId_userId: { postId, userId: user.id } },
            })
        } else {
            // Like
            await prisma.like.create({
                data: { postId, userId: user.id },
            })
        }
        return null
    } catch {
        return "Failed to update like"
    }
}

export async function repostPostAction(
    _prev: string | null | undefined,
    formData: FormData
): Promise<string | null> {
    const user = await getSession()
    if (!user) return "Not authenticated"

    const result = RepostPostSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) return result.error.issues[0]?.message ?? "Validation failed"

    const { postId } = result.data

    try {
        const existing = await prisma.repost.findUnique({
            where: { postId_userId: { postId, userId: user.id } },
        })

        if (existing) {
            // Unrepost
            await prisma.repost.delete({
                where: { postId_userId: { postId, userId: user.id } },
            })
        } else {
            // Repost
            await prisma.repost.create({
                data: { postId, userId: user.id },
            })
        }
        return null
    } catch {
        return "Failed to update repost"
    }
}
