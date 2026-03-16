"use server";

import { Button } from "@/components/ui/button";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUserById, deleteUser } from "@/lib/actions/users";

export default async function DeleteUserPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const userId = Number(id);
    if (!Number.isFinite(userId)) return notFound();

    const user = await getUserById(userId);
    if (!user) return notFound();

    async function handleDelete() {
        "use server";
        await deleteUser(userId);
        redirect("/users");
    }

    return (
        <div className="max-w-md mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Delete User</h1>

            <p className="mb-6 text-gray-600">
                Are you sure you want to delete{" "}
                <strong>{user.username ?? user.email}</strong>? This action
                cannot be undone.
            </p>

            <form action={handleDelete} className="flex gap-2">
                <Button type="submit" variant="destructive">
                    Delete
                </Button>
                <Link href="/users">
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                </Link>
            </form>
        </div>
    );
}
