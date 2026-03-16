import { getUsers } from "@/lib/actions/users"
import { USERS_PAGE_SIZE } from "@/lib/constants"
import UsersTable from "@/components/users/users-table"

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam) || 1)

    const { users, total } = await getUsers(page)

    return <UsersTable users={users} total={total} page={page} pageSize={USERS_PAGE_SIZE} />
}
