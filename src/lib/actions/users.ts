"use server"

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

// Prisma-derived types — single source of truth, never drift from the schema

export type UserBase = Prisma.UserGetPayload<{
    select: {
        id: true;
        email: true;
        username: true;
        newUser: true;
        providerId: true;
        provider: true;
        createdAt: true;
    };
}>;

export type UserWithProfile = Prisma.UserGetPayload<{
    select: {
        id: true;
        email: true;
        username: true;
        newUser: true;
        providerId: true;
        provider: true;
        createdAt: true;
        profile: {
            select: {
                id: true;
                name: true;
                bio: true;
                img: true;
                website: true;
                dob: true;
                userId: true;
            };
        };
        _count: {
            select: {
                posts: true;
                following: true;
                followers: true;
            };
        };
    };
}>;

export async function createUserWithHash(formData: FormData) {
    const email = formData.get("email") as string;
    const username = (formData.get("username") as string) || null;
    const password = formData.get("password") as string;
    const provider = (formData.get("provider") as string) || null;
    const providerId = (formData.get("providerId") as string) || null;
    const newUser = formData.get("newUser") === "true";

    if (!email || !password) throw new Error("Email and password are required");

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
        data: {
            email,
            username,
            provider,
            providerId,
            newUser,
            hashedPassword,
        },
    });

    redirect("/users");
}

export async function updateUserAction(formData: FormData) {
    const id = Number(formData.get("id"));
    if (!id) throw new Error("Missing user id");

    const email = (formData.get("email") as string) || null;
    const username = (formData.get("username") as string) || null;
    const provider = (formData.get("provider") as string) || null;
    const providerId = (formData.get("providerId") as string) || null;
    const newUser = formData.get("newUser") === "true";
    const password = (formData.get("password") as string) || "";

    const noProvider = !provider || provider === "none";

    const data: Prisma.UserUpdateInput = {
        email: email ?? undefined,
        username,
        newUser,
        provider: noProvider ? null : provider,
        providerId: noProvider ? null : providerId,
        ...(password.trim() && { hashedPassword: await bcrypt.hash(password, 12) }),
    };

    await prisma.user.update({ where: { id }, data });
    redirect("/users");
}

export async function getUsers(): Promise<UserWithProfile[]> {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                newUser: true,
                providerId: true,
                provider: true,
                createdAt: true,
                // Include the profile relation
                profile: {
                    select: {
                        id: true,
                        name: true,
                        bio: true,
                        img: true,
                        website: true,
                        dob: true,
                        userId: true,
                    }
                },
                // Optional: Include counts for stats
                _count: {
                    select: {
                        posts: true,
                        following: true,
                        followers: true,
                    }
                }
            }
        });

        return users;
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
        const updatedUser = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                username: true,
                newUser: true,
                providerId: true,
                provider: true,
                createdAt: true,
            },
        });

        return updatedUser;
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user.");
    }
}

export async function getUserById(id: number): Promise<UserBase | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                newUser: true,
                providerId: true,
                provider: true,
                createdAt: true,
            },
        });
        return user;
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