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