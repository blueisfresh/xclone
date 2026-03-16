"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { updateUserAction, createUserWithHash, UserBase } from "@/lib/actions/users";

const inputClass =
    "h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50";

const selectClass =
    "h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50";

const labelClass = "text-sm font-medium text-foreground";

interface UserFormProps {
    user?: UserBase | null;
}

export default function UserForm({ user }: UserFormProps) {
    const isEdit = !!user?.id;
    const [provider, setProvider] = useState<string>(user?.provider ?? "none");

    const initialProviderId =
        provider === "apple" ? (user as any)?.appleid ?? "" : user?.providerId ?? "";
    const [providerId, setProviderId] = useState<string>(initialProviderId);

    const providerIdLabel = provider === "apple" ? "Apple ID" : "Google ID";
    const action = isEdit ? updateUserAction : createUserWithHash;

    return (
        <div className="min-h-screen bg-muted flex items-start justify-center p-8">
            <div className="w-full max-w-md bg-background rounded-2xl border border-border shadow-sm p-8 flex flex-col gap-6">

                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        {isEdit ? "Edit" : "Create"} User
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isEdit ? "Update the user's details below." : "Fill in the details to create a new user."}
                    </p>
                </div>

                <form action={action} className="flex flex-col gap-4">
                    {isEdit && (
                        <input type="hidden" name="id" value={String(user!.id)} />
                    )}

                    {/* USERNAME */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="username" className={labelClass}>Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            defaultValue={user?.username ?? ""}
                            placeholder="johndoe"
                            className={inputClass}
                            required
                        />
                    </div>

                    {/* EMAIL */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className={labelClass}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            defaultValue={user?.email ?? ""}
                            placeholder="name@example.com"
                            className={inputClass}
                            required
                        />
                    </div>

                    {/* PASSWORD (create only) */}
                    {!isEdit && (
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="password" className={labelClass}>Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                className={inputClass}
                                required
                            />
                        </div>
                    )}

                    {/* PROVIDER */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="provider" className={labelClass}>Provider</label>
                        <select
                            id="provider"
                            name="provider"
                            value={provider}
                            onChange={(e) => {
                                const next = e.target.value;
                                setProvider(next);
                                if (next === "none") setProviderId("");
                            }}
                            className={selectClass}
                        >
                            <option value="none">No Provider</option>
                            <option value="google">Google</option>
                            <option value="apple">Apple</option>
                        </select>
                    </div>

                    {/* PROVIDER ID (conditional) */}
                    {provider !== "none" && (
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="providerId" className={labelClass}>{providerIdLabel}</label>
                            <input
                                type="text"
                                id="providerId"
                                name="providerId"
                                value={providerId}
                                onChange={(e) => setProviderId(e.target.value)}
                                placeholder={provider === "apple" ? "Enter Apple ID" : "Enter Google ID"}
                                className={inputClass}
                            />
                        </div>
                    )}

                    {/* IS NEW USER */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="newUser" className={labelClass}>Is New User?</label>
                        <select
                            id="newUser"
                            name="newUser"
                            defaultValue={user?.newUser ? "true" : "false"}
                            className={selectClass}
                        >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="submit">Save</Button>
                        <Link href="/users">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
