"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/actions/auth"
import { UpdateProfileSchema } from "@/lib/validations/profile"

export async function updateProfileModalAction(
    _prev: string | null | undefined,
    formData: FormData
): Promise<string | null> {
    const session = await getSession()
    if (!session) return "Unauthorized"

    const parsed = UpdateProfileSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return parsed.error.errors[0].message

    if (parsed.data.userId !== session.id) return "Unauthorized"

    const { userId, name, ...rest } = parsed.data
    // Profile.name is required (non-nullable) in the schema — fall back to empty string
    const safeName = name ?? ""

    try {
        await prisma.profile.upsert({
            where: { userId },
            create: { userId, name: safeName, ...rest },
            update: { name: safeName, ...rest },
        })
        return null
    } catch {
        return "Failed to save profile"
    }
}
