import { z } from "zod"

export const FollowUserSchema = z.object({
    targetUserId: z.coerce.number().int().positive(),
})
