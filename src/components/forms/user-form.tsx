"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { updateUserAction, createUserWithHash, UserBase } from "@/lib/actions/users";

interface UserFormProps {
    user?: UserBase | null;
}

export default function UserForm({ user }: UserFormProps) {
    const isEdit = !!user?.id;
    // Changed initial provider to "none" if null
    const [provider, setProvider] = useState<string>(user?.provider ?? "none");

    const initialProviderId =
        provider === "apple" ? (user as any)?.appleid ?? "" : user?.providerId ?? "";
    const [providerId, setProviderId] = useState<string>(initialProviderId);

    const providerIdLabel = provider === "apple" ? "Apple ID" : "Google ID";

    // Choose the proper server action
    const action = isEdit ? updateUserAction : createUserWithHash;

    return (
        <div className="max-w-md mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-6">
                {isEdit ? "Edit" : "Create"} User
            </h1>

            <form action={action} className="space-y-4">
                {/* include id for edit */}
                {isEdit && (
                    <input type="hidden" name="id" value={String(user!.id)} />
                )}

                {/* USERNAME */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        defaultValue={user?.username ?? ""}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* EMAIL */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        defaultValue={user?.email ?? ""}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* PASSWORD (only shown on create, but harmless on edit) */}
                {!isEdit && (
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                )}

                {/* PROVIDER */}
                <div>
                    <label htmlFor="provider" className="block text-sm font-medium mb-1">
                        Provider
                    </label>
                    <select
                        id="provider"
                        name="provider"
                        value={provider}
                        onChange={(e) => {
                            const next = e.target.value;
                            setProvider(next);
                            if (next === "none") setProviderId("");
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="none">No Provider</option>
                        <option value="google">Google</option>
                        <option value="apple">Apple</option>
                    </select>
                </div>

                {/* CONDITIONAL PROVIDER ID */}
                {provider !== "none" && (
                    <div>
                        <label htmlFor="providerId" className="block text-sm font-medium mb-1">
                            {providerIdLabel}
                        </label>
                        <input
                            type="text"
                            id="providerId"
                            name="providerId"
                            value={providerId}
                            onChange={(e) => setProviderId(e.target.value)}
                            placeholder={provider === "apple" ? "Enter Apple ID" : "Enter Google ID"}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {/* IS NEW USER? */}
                <div>
                    <label htmlFor="newUser" className="block text-sm font-medium mb-1">
                        Is New User?
                    </label>
                    <select
                        id="newUser"
                        name="newUser"
                        defaultValue={user?.newUser ? "true" : "false"}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>

                <div className="flex gap-2 pt-4">
                    <Button type="submit" variant="default">
                        Save
                    </Button>
                    <Link href="/users" className="inline-block">
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}