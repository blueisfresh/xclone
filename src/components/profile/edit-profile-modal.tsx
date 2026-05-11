"use client"

import { useModalAction } from "@/hooks/use-modal-action"
import { updateProfileModalAction } from "@/lib/actions/profile"
import { UserProfile } from "@/lib/types/profile"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const inputClass =
    "h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"
const labelClass = "text-sm font-medium text-foreground"

interface Props {
    userId: number
    profile: UserProfile | null
    onClose: () => void
}

export default function EditProfileModal({ userId, profile, onClose }: Props) {
    const { error, formAction, pending } = useModalAction(updateProfileModalAction, onClose)

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>Update your public profile information.</DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex flex-col gap-4 py-2">
                    <input type="hidden" name="userId" value={userId} />

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Display name</label>
                        <input
                            name="name"
                            type="text"
                            placeholder="Your name"
                            defaultValue={profile?.name ?? ""}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Bio</label>
                        <input
                            name="bio"
                            type="text"
                            placeholder="About you"
                            defaultValue={profile?.bio ?? ""}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Website</label>
                        <input
                            name="website"
                            type="url"
                            placeholder="https://..."
                            defaultValue={profile?.website ?? ""}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Date of birth</label>
                        <input
                            name="dob"
                            type="date"
                            defaultValue={
                                profile?.dob ? new Date(profile.dob).toISOString().split("T")[0] : ""
                            }
                            className={inputClass}
                        />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={pending}>
                            {pending ? "Saving…" : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
