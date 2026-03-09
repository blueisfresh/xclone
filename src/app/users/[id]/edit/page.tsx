import { prisma } from "@/lib/prisma";
import UserForm from "@/components/forms/user-form";
import { notFound } from "next/navigation";

export default async function EditUserPage({
                                               params,
                                           }: {
    params: Promise<{ id: string }>; // <- note: Promise
}) {
    const { id } = await params; // <- await the params
    const userId = Number(id);
    if (!Number.isFinite(userId)) return notFound();

    const user = await prisma.user.findUnique({
        where: { id: userId },
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

    if (!user) return notFound();
    return <UserForm user={user} />;
}