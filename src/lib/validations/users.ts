import { z } from "zod"

// ── Reusable field transforms ──────────────────────────────────────────────

// FormData always gives strings — empty string means "not provided"
const optionalString = z.string().transform((v) => v.trim() || null)

// FormData sends "true" / "false" strings for checkboxes / selects
const boolFromString = z
    .string()
    .optional()
    .transform((v) => v === "true")

// ── Schemas ────────────────────────────────────────────────────────────────

export const CreateUserSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    username: optionalString,
    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
    provider: z.enum(["none", "google", "apple"]).default("none"),
    providerId: optionalString,
    newUser: boolFromString,
})

export const UpdateUserSchema = z.object({
    id: z.coerce.number().int().positive("Invalid user id"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    username: optionalString,
    provider: z.enum(["none", "google", "apple"]).default("none"),
    providerId: optionalString,
    newUser: boolFromString,
    // Password is optional on update — only re-hashed if provided
    password: z
        .string()
        .optional()
        .transform((v) => v?.trim() || null),
})

export const DeleteUserSchema = z.object({
    id: z.coerce.number().int().positive("Invalid user id"),
})

// ── Inferred types ─────────────────────────────────────────────────────────

export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type DeleteUserInput = z.infer<typeof DeleteUserSchema>
