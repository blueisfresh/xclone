"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

export async function updateUserAction(formData: FormData) {
    const id = Number(formData.get("id"));
    if (!id) throw new Error("Missing user id");

    const email = (formData.get("email") as string) || null;
    const username = (formData.get("username") as string) || null;
    const provider = (formData.get("provider") as string) || null; // "google" | "apple" | "none" | null
    let providerId = (formData.get("providerId") as string) || null;
    const newUser = formData.get("newUser") === "true";
    const password = (formData.get("password") as string) || ""; // optional on edit

    const data: any = { email, username, newUser };

    // normalize provider + providerId
    if (!provider || provider === "none") {
        data.provider = null;
        providerId = null;
    } else {
        data.provider = provider;
        data.providerId = providerId;
    }

    if (password.trim()) {
        data.hashedPassword = await bcrypt.hash(password, 12);
    }

    await prisma.user.update({
        where: { id },
        data,
    });

    redirect("/users");
}