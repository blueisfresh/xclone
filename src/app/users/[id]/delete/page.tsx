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
        <div className="min-h-screen bg-muted flex items-start justify-center p-8">
            <div className="w-full max-w-md bg-background rounded-2xl border border-border shadow-sm p-8 flex flex-col gap-6">

                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        Delete User
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        This action cannot be undone.
                    </p>
                </div>

                <p className="text-sm text-foreground">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">{user.username ?? user.email}</span>?
                </p>

                <form action={handleDelete} className="flex gap-2">
                    <Button type="submit" variant="destructive">Delete</Button>
                    <Link href="/users">
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                </form>
            </div>
        </div>
    );
}
