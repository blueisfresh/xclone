"use server"

import { User } from "@/lib/types";
import {prisma} from "@/lib/prisma";

export async function getUsers(): Promise<User[]> {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                newuser: true,
                googleid: true,
                provider: true,
                createdat: true,
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
        googleid?: string | null;
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
                newuser: true,
                googleid: true,
                provider: true,
                createdat: true,
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

export async function createUser(data: {
    email: string;
    username?: string | null;
    hashedpassword?: string | null;
    googleid?: string | null;
    provider?: string | null;
    newuser?: boolean | null;
}): Promise<User> {
    try {
        const user = await prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                newuser: data.newuser ?? true,
                hashedpassword: data.hashedpassword,
                googleid: data.googleid,
                provider: data.provider,
            },
            select: {
                id: true,
                email: true,
                username: true,
                newuser: true,
                googleid: true,
                provider: true,
                createdat: true,
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

        return user as User;
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user.");
    }
}