# xclone — Project Guidelines

## Styling

### Design System
- **Component library:** shadcn/ui (new-york style)
- **CSS framework:** Tailwind CSS v4
- **Font:** Geist Sans (`font-sans`) + Geist Mono (`font-mono`)
- **Color palette:** Black/white only — no custom brand colors. All colors come from CSS variable tokens.

### Always use design tokens, never raw colors
Use CSS variable-backed Tailwind classes so components automatically adapt to light/dark mode.

| Purpose | Class to use |
|---|---|
| Page background | `bg-background` |
| Card/surface background | `bg-background` or `bg-muted` |
| Body text | `text-foreground` |
| Subtle/secondary text | `text-muted-foreground` |
| Input background | `bg-background` |
| Input border | `border-input` |
| Focus ring | `focus:ring-ring` |
| Destructive/error | `text-destructive` |
| Borders | `border-border` |

Never use `bg-white`, `bg-gray-*`, `text-black`, `text-gray-*`, etc. Always use the token equivalents above.

### Page layout
Full-height centered pages use this shell:
```tsx
<div className="min-h-screen bg-muted flex items-center justify-center p-4">
  <div className="w-full max-w-sm bg-background rounded-2xl border border-border shadow-sm p-8 flex flex-col gap-6">
    {/* content */}
  </div>
</div>
```

For wider content pages (tables, dashboards) use:
```tsx
<div className="container mx-auto py-8">
```

### Cards / surfaces
```tsx
<div className="bg-background rounded-2xl border border-border shadow-sm p-8">
```

### Form inputs
No shadcn Input component — style directly with Tailwind tokens:
```tsx
<input className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50" />
```

Always include a `<label>` with `text-sm font-medium text-foreground`. Wrap label + input in a `flex flex-col gap-1.5`.

### Buttons
Always use the `Button` component from `@/components/ui/button`. Never style a raw `<button>` element.

```tsx
import { Button } from "@/components/ui/button"

// Full-width (forms)
<Button type="submit" className="w-full">Submit</Button>

// Variants available: default | outline | destructive | secondary | ghost | link
// Sizes available: default | sm | lg | icon
```

### Error messages
```tsx
{error && <p className="text-sm text-destructive">{error}</p>}
```

### Typography scale
- Page titles: `text-2xl font-bold text-foreground tracking-tight`
- Section headings: `text-3xl font-bold`
- Labels: `text-sm font-medium text-foreground`
- Body / helper text: `text-sm text-muted-foreground`
- Micro / captions: `text-xs text-muted-foreground`

### Spacing rhythm
- Gap between form fields: `gap-4`
- Gap between label and input: `gap-1.5`
- Gap between major sections inside a card: `gap-6`
- Padding inside cards: `p-8`

### Links
```tsx
<a className="font-medium text-foreground underline underline-offset-4 hover:opacity-70">
```

### Pagination

Every query that returns a list **must** be paginated. Never fetch unbounded lists.

- **Page size:** 10 items per page for all data tables
- **Mechanism:** URL search param `?page=N` — server component reads it, passes page + total to the client table component
- **DB query:** always include `skip`, `take`, and `orderBy` (consistent ordering is required for pagination to be correct). Fetch count and data in parallel with `Promise.all`:

```ts
export const THING_PAGE_SIZE = 10

export async function getThings(page = 1, pageSize = THING_PAGE_SIZE) {
    const skip = (page - 1) * pageSize
    const [items, total] = await Promise.all([
        prisma.thing.findMany({ orderBy: { createdAt: "desc" }, skip, take: pageSize }),
        prisma.thing.count(),
    ])
    return { items, total }
}
```

- **Page component:** read and clamp `searchParams.page`, pass `page`, `total`, `pageSize` as props
- **Table component:** show `"Showing X–Y of Z items"` and Prev / Next buttons; navigate with `router.push("?page=N")`
- The `PAGE_SIZE` constant lives in `lib/constants.ts` (not the actions file — `"use server"` files can only export async functions)

---

### Modals / Dialogs
For any create, edit, delete, or other short-form action — always use a Dialog (modal), never navigate to a separate page.

- Use the `Dialog` component from `@/components/ui/dialog`
- Each modal is its own component that only renders when needed (conditional render = automatic state reset on close)
- Modal actions use `useActionState` with these return conventions:
  - `undefined` — initial state (never submitted)
  - `null` — success
  - `string` — error message to display
- On success: call `router.refresh()` to re-fetch server data, then close the modal
- Use the `useModalAction` hook pattern to avoid repeating this logic

```tsx
// Modal is conditionally rendered — mounts on open, unmounts on close
{mode === "create" && <CreateModal onClose={close} />}

// Inside the modal component:
function CreateModal({ onClose }: { onClose: () => void }) {
    const { error, formAction, pending } = useModalAction(createAction, onClose)
    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>...</DialogTitle>
                    <DialogDescription>...</DialogDescription>
                </DialogHeader>
                <form action={formAction} className="flex flex-col gap-4 py-2">
                    {/* fields */}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
```

Server actions used inside modals must **not** call `redirect()` — return `null` on success, an error string on failure:
```ts
export async function createThingModalAction(
    _prev: string | null | undefined,
    formData: FormData
): Promise<string | null> {
    // ... validate and write to DB
    return null // success
    // or return "Something went wrong" // error
}
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript — strict mode |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Database | PostgreSQL 16 (Docker on port 5433) |
| Auth | Custom session table + bcrypt + httpOnly cookie |
| UI | shadcn/ui + Tailwind CSS v4 + Radix UI |
| Icons | lucide-react |
| Package manager | pnpm |

## Auth

- Session token stored in `session_token` httpOnly cookie.
- `getSession()` in `@/lib/actions/auth.ts` is the auth primitive — call it at the top of every protected server component or server action.
- Middleware (`src/middleware.ts`) checks cookie presence only (Edge-safe). Full DB validation happens in `getSession()`.
- `loginAction` / `logoutAction` are server actions — import and use directly, no API route needed.

```ts
// Every protected server component:
const user = await getSession()
if (!user) redirect("/login")
```

## Server Actions pattern

All database writes are server actions in `src/lib/actions/`. They:
- Are tagged `"use server"` at the top of the file
- Use `Prisma.ModelSelect` + `Prisma.ModelGetPayload` for precise types — never define manual interfaces that duplicate schema fields
- Export a `*Select` const and a derived `type` so callers get typed results
- **Modal actions** return `null` (success) or a string (error) — never call `redirect()`
- **Page-level actions** (e.g. login) may call `redirect()` after mutations

## Prisma types

Always derive types from Prisma's generated types — never write manual interfaces:
```ts
const mySelect = { id: true, email: true } satisfies Prisma.UserSelect
export type MyUser = Prisma.UserGetPayload<{ select: typeof mySelect }>
```

## File structure

```
src/
  app/              — Next.js App Router pages
  components/
    ui/             — shadcn primitives (Button, etc.)
    forms/          — reusable form components
  lib/
    prisma.ts       — single Prisma client instance
    utils.ts        — cn() helper
    actions/
      auth.ts       — loginAction, logoutAction, getSession
      users.ts      — user CRUD + types
```
