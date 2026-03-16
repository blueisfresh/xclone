import { getUserById } from "@/lib/actions/users";
import UserForm from "@/components/forms/user-form";
import { notFound } from "next/navigation";

export default async function EditUserPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const userId = Number(id);
    if (!Number.isFinite(userId)) return notFound();

    const user = await getUserById(userId);

    if (!user) return notFound();
    return <UserForm user={user} />;
}