import { Button } from "@/components/ui/button";
import Link from "next/link";
import {getUsers} from "@/lib/actions/users";
import { User } from "@/lib/types";

export default async function UserPage() {
    const users = await getUsers();

    console.log("RAW ITEMS FROM API:", JSON.stringify(users[0], null, 2));

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Users</h1>
                <Link href="/users/create">
                    <Button>➕ Add user</Button>
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Is New User?
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            GoogleId
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Provider
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Created At?
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                Nothing to show here
                            </td>
                        </tr>
                    ) : (
                        users.map((item: User) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{item.username}</td>
                                <td className="px-6 py-4">{item.username || "-"}</td>
                                <td className="px-6 py-4">{item.newuser ? "yes" : "no"}</td>
                                <td className="px-6 py-4">
                                    {item.googleid || "-"}
                                </td>
                                <td className="px-6 py-4">
                                    {item.provider || "-"}
                                </td>
                                <td className="px-6 py-4">
                                    {item.createdat?.toString() || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Link
                                        href={`/users/${item.id}/edit`}
                                        className="inline-block"
                                    >
                                        <Button size="sm" variant="outline">
                                            Edit
                                        </Button>
                                    </Link>
                                    <Link
                                        href={`/users/${item.id}/delete`}
                                        className="inline-block"
                                    >
                                        <Button size="sm" variant="destructive">
                                            Delete
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
