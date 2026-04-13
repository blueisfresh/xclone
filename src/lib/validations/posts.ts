import { z } from "zod"

export const CreatePostSchema = z.object({
    content: z
        .string()
        .min(1, "Post cannot be empty")
        .max(280, "Post cannot exceed 280 characters"),
})

export const DeletePostSchema = z.object({
    id: z.coerce.number().int().positive("Invalid post id"),
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type DeletePostInput = z.infer<typeof DeletePostSchema>
