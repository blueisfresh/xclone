import {getUsers} from "@/lib/actions/users";
import UserForm from "@/components/forms/user-form";


export default async function CreateInventoryPage() {
    const users= await getUsers();

    return <UserForm user={users} />;
}