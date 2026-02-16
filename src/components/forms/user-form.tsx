import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User } from "@/lib/types";
import { createUserAction, updateUserAction } from "@/lib/form-actions/users";

interface UserFormProps {
    user?: User;
}

export default function UserForm({ user }: UserFormProps) {
    const isEdit = !user;
    const action = isEdit ? updateUserAction : createUserAction;

    return (
        <div className="max-w-md mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-6">
                {isEdit ? "Edit" : "Create"} User
            </h1>

            <form action={action} className="space-y-4">
                {/* USERNAME */}
                <div>
                    <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        defaultValue={user?.username || ""}
                        className="w-full border border-gray-300 rounded-md px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* EMAIL */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        defaultValue={user?.email || ""}
                        className="w-full border border-gray-300 rounded-md px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* GOOGLE ID */}

                <div>
                    <label
                        htmlFor="googleid"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Google ID
                    </label>
                    <input
                        type="text"
                        id="googleid"
                        name="googleid"
                        defaultValue={user?.googleid || ""}
                        className="w-full border border-gray-300 rounded-md px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* PROVIDER */}
                <div>
                    <label
                        htmlFor="provider"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Provider
                    </label>
                    <select
                        id="provider"
                        name="provider"
                        defaultValue={user?.provider || ""}
                        className="w-full border border-gray-300 rounded-md px-3 py-2
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="true">Google</option>
                        <option value="false">Apple</option>
                    </select>

                </div>

                {/* IS NEW USER? */}
                <div>
                    <label
                        htmlFor="newuser"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Is New User?
                    </label>
                    <select
                        id="newuser"
                        name="newuser"
                        defaultValue={user?.newuser ? "true" : "false"}
                        className="w-full border border-gray-300 rounded-md px-3 py-2
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>

                {/* BUTTONS */}
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