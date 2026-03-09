import UserForm from "@/components/forms/user-form";

export default function CreateUserPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Create User</h1>
            <UserForm />
        </div>
    );
}