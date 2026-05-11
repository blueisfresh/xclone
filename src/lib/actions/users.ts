"use server"

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { CreateUserSchema, UpdateUserSchema, DeleteUserSchema } from "@/lib/validations/users";
import { USERS_PAGE_SIZE } from "@/lib/constants";
import { getSession } from "@/lib/actions/auth";

// ── Helpers ────────────────────────────────────────────────────────────────

function firstError(error: { issues: { message: string }[] }): string {
    return error.issues[0]?.message ?? "Validation failed"
}

// ── Select consts — change a field here and it updates everywhere ──────────

const userBaseSelect = {
    id: true,
    email: true,
    username: true,
    newUser: true,
    providerId: true,
    provider: true,
    createdAt: true,
    role: { select: { name: true } },
} satisfies Prisma.UserSelect;

const userWithProfileSelect = {
    ...userBaseSelect,
    profile: {
        select: {
            id: true,
            name: true,
            bio: true,
            img: true,
            website: true,
            dob: true,
            userId: true,
        },
    },
    _count: {
        select: {
            posts: true,
            following: true,
            followers: true,
        },
    },
} satisfies Prisma.UserSelect;

// ── Types derived from the selects ─────────────────────────────────────────

export type UserBase = Prisma.UserGetPayload<{ select: typeof userBaseSelect }>;
export type UserWithProfile = Prisma.UserGetPayload<{ select: typeof userWithProfileSelect }>;

// ── Page-level actions (redirect on success) ───────────────────────────────

export async function createUserWithHash(formData: FormData) {
    const result = CreateUserSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) throw new Error(firstError(result.error))

    const { email, username, password, provider, providerId, newUser } = result.data
    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
        data: {
            email,
            username,
            provider: provider === "none" ? null : provider,
            providerId,
            newUser,
            hashedPassword,
        },
    });

    redirect("/users");
}

export async function updateUserAction(formData: FormData) {
    const result = UpdateUserSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) throw new Error(firstError(result.error))

    const { id, email, username, provider, providerId, newUser, password } = result.data
    const noProvider = provider === "none"

    await prisma.user.update({
        where: { id },
        data: {
            email: email ?? undefined,
            username,
            newUser,
            provider: noProvider ? null : provider,
            providerId: noProvider ? null : providerId,
            ...(password && { hashedPassword: await bcrypt.hash(password, 12) }),
        },
    });

    redirect("/users");
}

// ── Read ───────────────────────────────────────────────────────────────────

export async function getUsers(
    page = 1,
    pageSize = USERS_PAGE_SIZE
): Promise<{ users: UserWithProfile[]; total: number }> {
    try {
        const skip = (page - 1) * pageSize
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                select: userWithProfileSelect,
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.user.count(),
        ])
        return { users, total }
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch users.");
    }
}

export async function updateUser(
    id: number,
    data: Prisma.UserUpdateInput
): Promise<UserBase> {
    try {
        return await prisma.user.update({ where: { id }, data, select: userBaseSelect });
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user.");
    }
}

export async function getUserById(id: number): Promise<UserBase | null> {
    try {
        return await prisma.user.findUnique({ where: { id }, select: userBaseSelect });
    } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Failed to fetch user.");
    }
}

export async function deleteUser(id: number): Promise<void> {
    try {
        await prisma.user.delete({ where: { id } });
    } catch (error) {
        console.error("Error deleting user:", error);
        throw new Error("Failed to delete user.");
    }
}

// ── Modal actions (return null on success, string on error) ───────────────

export async function createUserModalAction(
    _prev: string | null | undefined,
    formData: FormData
): Promise<string | null> {
    const session = await getSession()
    if (!session || session.role.name !== "ADMIN") return "Unauthorized"

    const result = CreateUserSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) return firstError(result.error)

    const { email, username, password, provider, providerId, newUser } = result.data

    try {
        const hashedPassword = await bcrypt.hash(password, 12)
        await prisma.user.create({
            data: {
                email,
                username,
                provider: provider === "none" ? null : provider,
                providerId,
                newUser,
                hashedPassword,
            },
        });
        return null
    } catch {
        return "Failed to create user. Email may already be in use."
    }
}

export async function updateUserModalAction(
    _prev: string | null | undefined,
    formData: FormData
): Promise<string | null> {
    const session = await getSession()
    if (!session || session.role.name !== "ADMIN") return "Unauthorized"

    const result = UpdateUserSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) return firstError(result.error)

    const { id, email, username, provider, providerId, newUser, password } = result.data
    const noProvider = provider === "none"

    try {
        await prisma.user.update({
            where: { id },
            data: {
                email: email ?? undefined,
                username,
                newUser,
                provider: noProvider ? null : provider,
                providerId: noProvider ? null : providerId,
                ...(password && { hashedPassword: await bcrypt.hash(password, 12) }),
            },
        });
        return null
    } catch {
        return "Failed to update user."
    }
}

export async function deleteUserModalAction(
    _prev: string | null | undefined,
    formData: FormData
): Promise<string | null> {
    const session = await getSession()
    if (!session || session.role.name !== "ADMIN") return "Unauthorized"

    const result = DeleteUserSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) return firstError(result.error)

    try {
        await prisma.user.delete({ where: { id: result.data.id } });
        return null
    } catch {
        return "Failed to delete user."
    }
}
