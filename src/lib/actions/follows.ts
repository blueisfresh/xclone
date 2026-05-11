"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/actions/auth"
import { FollowUserSchema } from "@/lib/validations/follows"

export async function getIsFollowing(targetUserId: number, currentUserId: number): Promise<boolean> {
    const record = await prisma.userFollows.findUnique({
        where: { userId_followerId: { userId: targetUserId, followerId: currentUserId } },
    })
    return !!record
}

export async function followUserAction(
    _prev: string | null | undefined,
    formData: FormData
): Promise<string | null> {
    const user = await getSession()
    if (!user) return "Not authenticated"

    const result = FollowUserSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) return result.error.issues[0]?.message ?? "Validation failed"

    const { targetUserId } = result.data

    if (targetUserId === user.id) return "Cannot follow yourself"

    try {
        const existing = await prisma.userFollows.findUnique({
            where: { userId_followerId: { userId: targetUserId, followerId: user.id } },
        })

        if (existing) {
            await prisma.userFollows.delete({
                where: { userId_followerId: { userId: targetUserId, followerId: user.id } },
            })
        } else {
            await prisma.userFollows.create({
                data: { userId: targetUserId, followerId: user.id },
            })
        }

        return null
    } catch {
        return "Failed to update follow"
    }
}
