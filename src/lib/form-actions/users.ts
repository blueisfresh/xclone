"use server";

import { createUser, updateUser } from "@/lib/actions/users";

export async function createUserAction(formData: FormData) {
    const email = formData.get("email") as string;
    const username = formData.get("username") as string | null;
    const googleid = formData.get("googleid") as string | null;
    const provider = formData.get("provider") as string | null;
    const newuser = formData.get("newuser") === "true"; // String → Boolean

    await createUser({
        email,
        username,
        googleid,
        provider,
        newuser,
    });
}

export async function updateUserAction(formData: FormData) {
    const id = Number(formData.get("id"));
    const email = formData.get("email") as string | undefined;
    const username = formData.get("username") as string | null | undefined;
    const googleid = formData.get("googleid") as string | null | undefined;
    const provider = formData.get("provider") as string | null | undefined;
    const newuser =
        formData.get("newuser") === "true" ? true : formData.get("newuser") === "false" ? false : null;

    await updateUser(id, {
        email,
        username,
        googleid,
        provider,
        newuser,
    });
}