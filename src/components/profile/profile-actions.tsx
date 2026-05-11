"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import EditProfileModal from "./edit-profile-modal"
import { UserProfile } from "@/lib/types/profile"

interface Props {
    userId: number
    profile: UserProfile | null
}

export default function ProfileActions({ userId, profile }: Props) {
    const [editing, setEditing] = useState(false)

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Edit profile
            </Button>
            {editing && (
                <EditProfileModal
                    userId={userId}
                    profile={profile}
                    onClose={() => setEditing(false)}
                />
            )}
        </>
    )
}
