"use server";

import { prisma } from "@/lib/prisma";
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