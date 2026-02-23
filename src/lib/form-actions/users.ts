"use server";

import { createUser, updateUser } from "@/lib/actions/users";

export async function createUserAction(formData: FormData) {
    const email = formData.get("email") as string;
    const username = (formData.get("username") as string) || null;
    const provider = (formData.get("provider") as string) || null; // "google" | "apple"
    const providerId = (formData.get("providerId") as string) || null; // dynamic field
    const newuser = formData.get("newuser") === "true";

    // Map to your schema fields
    const data: any = {
        email,
        username,
        provider,
        newuser,
    };

    if (provider === "google") data.googleid = providerId;
    if (provider === "apple") data.appleid = providerId; // add this column if not present

    await createUser(data);
}

export async function updateUserAction(formData: FormData) {
    const id = Number(formData.get("id") || 0);
    const email = formData.get("email") as string | undefined;
    const username = (formData.get("username") as string) || undefined;
    const provider = (formData.get("provider") as string) || undefined;
    const providerId = (formData.get("providerId") as string) || undefined;
    const newuserStr = formData.get("newuser") as string | null;

    const data: any = { email, username, provider };

    if (newuserStr !== null) data.newuser = newuserStr === "true";

    if (provider === "google") {
        data.googleid = providerId ?? null;
        data.appleid = null;
    } else if (provider === "apple") {
        data.appleid = providerId ?? null;
        data.googleid = null;
    }

    await updateUser(id, data);
}