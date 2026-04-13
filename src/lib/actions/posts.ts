"use server"

import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getSession } from "@/lib/actions/auth"
import { CreatePostSchema, DeletePostSchema } from "@/lib/validations/posts"
import { POSTS_PAGE_SIZE } from "@/lib/constants"

// ── Select consts ──────────────────────────────────────────────────────────

const postSelect = {
    id: true,
    content: true,
    createdAt: true,
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

export type PostWithMeta = Prisma.PostGetPayload<{ select: typeof postSelect }>

// ── Read ───────────────────────────────────────────────────────────────────

export async function getPosts(
    page = 1,
    pageSize = POSTS_PAGE_SIZE
): Promise<{ posts: PostWithMeta[]; total: number }> {
    const skip = (page - 1) * pageSize
    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            select: postSelect,
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.post.count(),
    ])
    return { posts, total }
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
            data: { content: result.data.content, userId: user.id },
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
