import { Prisma } from "@prisma/client"

export const profileSelect = {
    name: true,
    bio: true,
    img: true,
    website: true,
    dob: true,
} satisfies Prisma.ProfileSelect

export type UserProfile = Prisma.ProfileGetPayload<{ select: typeof profileSelect }>
