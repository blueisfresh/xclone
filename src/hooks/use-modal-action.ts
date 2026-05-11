"use client"

import { useActionState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export function useModalAction<T extends (prev: any, fd: FormData) => Promise<string | null>>(
    action: T,
    onSuccess: () => void
) {
    const router = useRouter()
    const [error, formAction, pending] = useActionState(action, undefined as string | null | undefined)
    const wasSubmitting = useRef(false)

    useEffect(() => {
        if (pending) wasSubmitting.current = true
        if (!pending && wasSubmitting.current) {
            wasSubmitting.current = false
            if (error === null) {
                router.refresh()
                onSuccess()
            }
        }
    }, [pending, error])

    return { error, formAction, pending }
}
