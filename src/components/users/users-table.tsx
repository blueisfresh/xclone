"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    UserWithProfile,
    createUserModalAction,
    updateUserModalAction,
    deleteUserModalAction,
} from "@/lib/actions/users"

// ── Shared input styles ────────────────────────────────────────────────────

const inputClass =
    "h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"
const selectClass =
    "h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"
const labelClass = "text-sm font-medium text-foreground"

// ── Shared hook: calls onSuccess when server action returns null ───────────

function useModalAction<T extends (prev: any, fd: FormData) => Promise<string | null>>(
    action: T,
    onSuccess: () => void
) {
    const router = useRouter()
    const [error, formAction, pending] = useActionState(action, undefined as string | null | undefined)
    const wasSubmitting = useRef(false)

    useEffect(() => {
        if (pending) wasSubmitting.current = true
        if (!pending && wasSubmitting.current) {
            wasSubmitting.current = false
            if (error === null) {
                router.refresh()
                onSuccess()
            }
        }
    }, [pending, error])

    return { error, formAction, pending }
}

// ── Create modal ───────────────────────────────────────────────────────────

function CreateModal({ onClose }: { onClose: () => void }) {
    const [provider, setProvider] = useState("none")
    const { error, formAction, pending } = useModalAction(createUserModalAction, onClose)

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                    <DialogDescription>Fill in the details to create a new user.</DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="c-username" className={labelClass}>Username</label>
                        <input id="c-username" name="username" type="text" placeholder="johndoe" className={inputClass} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="c-email" className={labelClass}>Email</label>
                        <input id="c-email" name="email" type="email" placeholder="name@example.com" className={inputClass} required />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="c-password" className={labelClass}>Password</label>
                        <input id="c-password" name="password" type="password" placeholder="••••••••" className={inputClass} required />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="c-provider" className={labelClass}>Provider</label>
                        <select
                            id="c-provider"
                            name="provider"
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className={selectClass}
                        >
                            <option value="none">No Provider</option>
                            <option value="google">Google</option>
                            <option value="apple">Apple</option>
                        </select>
                    </div>

                    {provider !== "none" && (
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="c-providerId" className={labelClass}>
                                {provider === "apple" ? "Apple ID" : "Google ID"}
                            </label>
                            <input
                                id="c-providerId"
                                name="providerId"
                                type="text"
                                placeholder={`Enter ${provider === "apple" ? "Apple" : "Google"} ID`}
                                className={inputClass}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="c-newUser" className={labelClass}>Is New User?</label>
                        <select id="c-newUser" name="newUser" defaultValue="false" className={selectClass}>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={pending}>{pending ? "Creating..." : "Create"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ── Edit modal ─────────────────────────────────────────────────────────────

function EditModal({ user, onClose }: { user: UserWithProfile; onClose: () => void }) {
    const [provider, setProvider] = useState(user.provider ?? "none")
    const { error, formAction, pending } = useModalAction(updateUserModalAction, onClose)

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Updating{" "}
                        <span className="font-medium text-foreground">
                            {user.username ?? user.email}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex flex-col gap-4 py-2">
                    <input type="hidden" name="id" value={user.id} />

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="e-username" className={labelClass}>Username</label>
                        <input
                            id="e-username"
                            name="username"
                            type="text"
                            defaultValue={user.username ?? ""}
                            placeholder="johndoe"
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="e-email" className={labelClass}>Email</label>
                        <input
                            id="e-email"
                            name="email"
                            type="email"
                            defaultValue={user.email}
                            placeholder="name@example.com"
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="e-provider" className={labelClass}>Provider</label>
                        <select
                            id="e-provider"
                            name="provider"
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className={selectClass}
                        >
                            <option value="none">No Provider</option>
                            <option value="google">Google</option>
                            <option value="apple">Apple</option>
                        </select>
                    </div>

                    {provider !== "none" && (
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="e-providerId" className={labelClass}>
                                {provider === "apple" ? "Apple ID" : "Google ID"}
                            </label>
                            <input
                                id="e-providerId"
                                name="providerId"
                                type="text"
                                defaultValue={user.providerId ?? ""}
                                placeholder={`Enter ${provider === "apple" ? "Apple" : "Google"} ID`}
                                className={inputClass}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="e-newUser" className={labelClass}>Is New User?</label>
                        <select
                            id="e-newUser"
                            name="newUser"
                            defaultValue={user.newUser ? "true" : "false"}
                            className={selectClass}
                        >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ── Delete modal ───────────────────────────────────────────────────────────

function DeleteModal({ user, onClose }: { user: UserWithProfile; onClose: () => void }) {
    const { error, formAction, pending } = useModalAction(deleteUserModalAction, onClose)

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-foreground">
                            {user.username ?? user.email}
                        </span>
                        ? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction}>
                    <input type="hidden" name="id" value={user.id} />
                    {error && <p className="text-sm text-destructive mb-3">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="destructive" disabled={pending}>
                            {pending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ── Table ──────────────────────────────────────────────────────────────────

type Mode = "create" | "edit" | "delete"

interface UsersTableProps {
    users: UserWithProfile[]
    total: number
    page: number
    pageSize: number
}

export default function UsersTable({ users, total, page, pageSize }: UsersTableProps) {
    const router = useRouter()
    const [mode, setMode] = useState<Mode | null>(null)
    const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null)

    const totalPages = Math.ceil(total / pageSize)
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, total)

    const openEdit = (user: UserWithProfile) => { setSelectedUser(user); setMode("edit") }
    const openDelete = (user: UserWithProfile) => { setSelectedUser(user); setMode("delete") }
    const close = () => { setMode(null); setSelectedUser(null) }

    const goToPage = (p: number) => router.push(`?page=${p}`)

    return (
        <>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Users</h1>
                    <Button onClick={() => setMode("create")}>Add user</Button>
                </div>

                <div className="border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse bg-background">
                            <thead>
                                <tr className="bg-muted">
                                    {["Username", "Email", "New User", "Provider ID", "Provider", "Created At", "Actions"].map((h) => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-background divide-y divide-border">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted-foreground">
                                            No users yet.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                {item.username ?? "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground">
                                                {item.email || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground">
                                                {item.newUser ? "Yes" : "No"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {item.providerId || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {item.provider || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                                                {item.createdAt
                                                    ? new Intl.DateTimeFormat("en-GB", {
                                                          day: "2-digit",
                                                          month: "short",
                                                          year: "numeric",
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                      }).format(new Date(item.createdAt))
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                                                    Edit
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => openDelete(item)}>
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background">
                        <p className="text-sm text-muted-foreground">
                            {total === 0
                                ? "No results"
                                : `Showing ${start}–${end} of ${total} users`}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(page - 1)}
                                disabled={page <= 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground px-1">
                                Page {page} of {totalPages || 1}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(page + 1)}
                                disabled={page >= totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {mode === "create" && <CreateModal onClose={close} />}
            {selectedUser && mode === "edit" && <EditModal user={selectedUser} onClose={close} />}
            {selectedUser && mode === "delete" && <DeleteModal user={selectedUser} onClose={close} />}
        </>
    )
}
