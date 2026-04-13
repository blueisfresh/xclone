"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createPostAction } from "@/lib/actions/posts"

export default function ReplyComposer({ postId }: { postId: number }) {
    const router = useRouter()
    const [content, setContent] = useState("")
    const [error, formAction, pending] = useActionState(
        createPostAction,
        undefined as string | null | undefined
    )
    const wasSubmitting = useRef(false)

    useEffect(() => {
        if (pending) wasSubmitting.current = true
        if (!pending && wasSubmitting.current) {
            wasSubmitting.current = false
            if (error === null) {
                router.refresh()
                setContent("")
            }
        }
    }, [pending, error])

    const remaining = 280 - content.length

    return (
        <form
            action={formAction}
            className="border border-border rounded-xl bg-background p-4 flex flex-col gap-3"
        >
            <input type="hidden" name="parentPostId" value={postId} />
            <textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Post your reply..."
                rows={3}
                maxLength={280}
                className="w-full resize-none bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-border pt-3">
                <span
                    className={`text-xs tabular-nums ${
                        remaining <= 20 ? "text-destructive" : "text-muted-foreground"
                    }`}
                >
                    {remaining}
                </span>
                <div className="flex items-center gap-3">
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button
                        type="submit"
                        size="sm"
                        disabled={pending || content.trim().length === 0}
                    >
                        {pending ? "Replying..." : "Reply"}
                    </Button>
                </div>
            </div>
        </form>
    )
}
