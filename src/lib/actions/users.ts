"use server"

import { User } from "@/lib/types";
import {prisma} from "@/lib/prisma";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

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
    let providerId = (formData.get("providerId") as string) || null;
    const newUser = formData.get("newUser") === "true";
    const password = (formData.get("password") as string) || "";

    const data: {
        email?: string | null;
        username?: string | null;
        newUser?: boolean;
        provider?: string | null;
        providerId?: string | null;
        hashedPassword?: string;
    } = { email, username, newUser };

    if (!provider || provider === "none") {
        data.provider = null;
        data.providerId = null;
    } else {
        data.provider = provider;
        data.providerId = providerId;
    }

    if (password.trim()) {
        data.hashedPassword = await bcrypt.hash(password, 12);
    }

    await prisma.user.update({ where: { id }, data });
    redirect("/users");
}

export async function getUsers(): Promise<User[]> {
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

        return users as User[];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch users.");
    }
}

export async function updateUser(
    id: number,
    data: {
        email?: string;
        username?: string | null;
        newuser?: boolean | null;
        hashedpassword?: string | null;
        providerId?: string | null;
        provider?: string | null;
    }
): Promise<User> {
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
            },
        });

        return updatedUser as User;
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user.");
    }
}

export async function getUserById(id: number): Promise<User | null> {
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
        return user as User | null;
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