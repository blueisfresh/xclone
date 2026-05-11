import { z } from "zod"

const optStr = z.string().transform((v) => v.trim() || null)

export const UpdateProfileSchema = z.object({
    userId:  z.coerce.number().int().positive(),
    name:    optStr,
    bio:     optStr,
    website: optStr,
    dob:     z.string().transform((v) => (v ? new Date(v) : null)),
})
