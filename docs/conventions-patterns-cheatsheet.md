# Conventions & Patterns Cheatsheet — AI Agent Quick Reference

> **Purpose**: Understand all code conventions in under 2 minutes.
> Reference specific file:line numbers to verify claims.

---

## 1. Code Style Rules

### Prettier/Formatting (`.prettierrc`)

```
semi: false, singleQuote: true, trailingComma: "es5", tabWidth: 2, printWidth: 150, useTabs: false
```

- **No semicolons** anywhere.
- **Single quotes** for strings (JSX props use double quotes per JSX convention).
- **Trailing commas** in multi-line objects/arrays (ES5 only — not function params).
- **2-space indent**, no tabs.
- **150 char width** (very wide — don't break lines unnecessarily).

### File Naming

| What | Convention | Examples |
|------|-----------|----------|
| Action directories | `kebab-case` | `nuevo-proceso/`, `gestion-de-inquilinos/` |
| Components | `PascalCase` | `Header.tsx`, `LoginForm.tsx`, `RequireAuth.tsx` |
| Lib/utils | `camelCase` | `prisma.ts`, `auth.ts`, `email.ts` |
| Page files | `page.tsx` (Next.js convention) | — |
| Layout files | `layout.tsx` (Next.js convention) | — |
| Types | `types.ts` co-located | `src/app/process/_/types.ts` |
| Sub-components | `_/` directory prefix | `src/app/dashboard/admin/properties/_/PropertyForm.tsx` |

### Import Ordering Convention

Observed from actual code (e.g. `src/components/auth/LoginForm.tsx:1-12`, `src/components/Header/index.tsx:1-15`):

```
1. React (hooks, utilities)           → import { ... } from 'react'
2. Next.js (navigation, Link)         → import { ... } from 'next/navigation'
3. Icons (lucide-react)               → import { ... } from 'lucide-react'
4. Third-party libs (date-fns, etc.)  → import { ... } from 'date-fns'
5. Project Server Actions             → import { ... } from '+/actions/...'
6. Project lib/hooks                  → import { ... } from '+/lib/...' / '+/hooks/...'
7. Project components                 → import X from '+/components/...'
8. Redux                             → import { ... } from '+/redux' or '+/redux/slices/...'
9. Relative (local)                   → import { ... } from './...'
10. Styles                            → import styles from './X.module.scss'
```

Block separated by blank lines between categories. Project imports use `+/*` path alias for `./src/*` (defined in `tsconfig.json:18`).

### Props Declaration

Always use **`type`** (type alias), **never `interface`**:

```typescript
// CORRECT — seen in LoginForm.tsx:14, RequireAuth.tsx:8, PropertyForm.tsx:10
type LoginFormProps = {
  className?: string
}

// WRONG — never use interface
interface LoginFormProps { ... }
```

### Language

- **Code (variables, functions, types)**: English
- **UI text**: Spanish
- **Docs/comments**: Spanish

---

## 2. Component Patterns

### Server Component vs Client Component

**Server Component** (default, no directive):
- Used for static content, layouts, `redirect()` calls
- Cannot use hooks, state, or browser APIs
- Example: `src/app/process/page.tsx:3` — just calls `redirect('/process/profile')`

**Client Component** (starts with `'use client'`):
- Used for interactivity, forms, modals, dashboards
- Can use hooks (`useState`, `useEffect`, `useActionState`), Redux, etc.
- Example: `src/app/dashboard/admin/page.tsx:1`, `src/components/Header/index.tsx:1`

Rule: Add `'use client'` **only when necessary** (state, events, hooks, browser APIs).

### Redux in Components

Use the typed wrappers from `src/redux/index.ts`:

```typescript
// CORRECT — use typed hooks from +/redux
import { useDispatch, useSelector } from '+/redux'
```
(`src/redux/index.ts:83-84`)

```typescript
// Reading state
const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
const user = useSelector((state) => state.user)
// (src/components/Header/index.tsx:25-26)

// Dispatching actions
const dispatch = useDispatch()
dispatch(setIsAuthenticated(true))
dispatch(setUser(userData))
// (src/components/Header/index.tsx:19,38)
```

### Error Handling in Components

**Loading states**: Manual `isLoading` flag via `useState` + try/catch/finally:

```typescript
// Pattern from src/app/dashboard/admin/properties/page.tsx:17-18
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

No `ErrorBoundary` or `Suspense` wrappers observed in actual code. No `loading.tsx` files found either. Components handle all states inline.

### Calling Server Actions from Client Components

**Pattern A — useActionState (auth forms)**:
```typescript
// src/components/auth/LoginForm.tsx:21
const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
  authenticate, authInitialState
)
```

**Pattern B — Direct async call (admin forms)**:
```typescript
// src/app/dashboard/admin/properties/_/PropertyForm.tsx:99-101
const result = mode === 'create'
  ? await createPropertyAction(input)
  : await updatePropertyAction(propertyId as string, input)

if (!result.success) {
  setError(result.error ?? 'No se pudo guardar la propiedad')
  return
}
```

**Pattern C — useEffect with Server Action (data fetching)**:
```typescript
// src/app/dashboard/admin/page.tsx:25-36
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await getProperties()
      setProperties(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }
  loadData()
}, [])
```

---

## 3. Form Pattern

### The Actual Form Pattern (NOT react-hook-form)

`react-hook-form` is in `package.json` as a dependency **but is NOT used anywhere** in the codebase. The actual form patterns are:

**Pattern 1: useActionState (auth forms)** — `src/components/auth/LoginForm.tsx`:
```typescript
const [state, formAction, isPending] = useActionState<MyState, FormData>(
  serverActionFunction, initialState
)

// Submit: build FormData, call formAction inside startTransition
const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const formData = new FormData()
  formData.append('email', email.trim())
  formData.append('password', password)
  startTransition(() => { formAction(formData) })
}
```

**Pattern 2: Manual state + direct Server Action call (admin forms)** — `src/app/dashboard/admin/properties/_/PropertyForm.tsx`:
```typescript
const [form, setForm] = useState<PropertyFormState>(initialForm)
const [submitting, setSubmitting] = useState(false)
const [error, setError] = useState<string | null>(null)

const updateField = (key: keyof PropertyFormState) =>
  (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
  }

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  setSubmitting(true)
  try {
    const result = await createPropertyAction(input)
    if (!result.success) { setError(result.error); return }
    onSuccess?.()
  } catch (err) { setError('Error') }
  finally { setSubmitting(false) }
}

// JSX:
<input value={form.name} onChange={updateField('name')} required />
```

**Zod**: Used **only on the server** in actions for validation — `src/actions/auth/reset-password.ts:13`, `src/actions/auth/verify-email.ts:11`. Not used in client-side forms.

---

## 4. Auth Pattern

### Server-Side Auth Check

```typescript
// ALWAYS first step in any Server Action or Server Component that needs auth
import { auth } from '+/lib/auth'

const session = await auth()
const userId = session?.user?.id
if (!userId) return { success: false, error: 'No autenticado' }
// (src/actions/property/index.ts:126-128)
```

Session exposes: `session.user.id`, `.role` (`'admin' | 'tenant'`), `.adminLevel` (`'SUPER_ADMIN' | 'MANAGER' | 'STANDARD' | 'LIMITED'`), `.email`, `.name` — `src/lib/auth.ts:111-119`.

### Client-Side Auth Check

**Two-layer check**:

1. **useSession() hook** (`src/hooks/useSession.ts`) — hits `/api/auth/session`, returns `{ status, isAuthenticated, user, role }`
2. **Redux** — `useSelector((state) => state.auth.isAuthenticated)` and `useSelector((state) => state.user)`

```typescript
// src/components/auth/RequireAuth.tsx:14-15
const { status, isLoading } = useSession()
const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
```

### Route Restriction

**Layer 1 — proxy.ts middleware** (`src/proxy.ts:81-83`):
- Blocks unauthenticated access to `/dashboard/*` and `/process/*` → redirects to `/`
- Role-based routing: admin levels map to allowed route prefixes (proxy.ts:7-23)

**Layer 2 — NextAuth `authorized` callback** (`src/lib/auth.ts:71-78`):
- Blocks `/dashboard/*` without session

**Layer 3 — RequireAuth client guard** (`src/components/auth/RequireAuth.tsx`):
- Wraps `DashboardLayout` and `ProcessLayout`
- Shows spinner while loading, redirects to `/` if unauthenticated

---

## 5. Database Pattern

### Prisma Singleton

```typescript
import { prisma } from '+/lib/prisma'
```
(`src/lib/prisma.ts:21-31`) — Single `PrismaClient` instance, cached on `globalThis` in dev (except `NODE_ENV=production`).

- Auto-detects SQLite (via `@libsql/client` adapter) or PostgreSQL based on `DATABASE_URL` prefix
- Logs `error` and `warn` to console

### Query Pattern

```typescript
// Read
const entity = await prisma.model.findUnique({ where: { id }, include: { relation: true } })

// Create
const created = await prisma.model.create({ data: { ...fields }, select: { id: true } })

// Update
await prisma.model.update({ where: { id }, data: { ...fields } })

// Delete
await prisma.model.delete({ where: { id } })
```

### Transactions

**No `prisma.$transaction` usage found** in the codebase. Operations are single-step.

### Soft Delete

The `User` model has a `deletedAt DateTime?` field (`prisma/schema.sqlite.prisma:483`) with an index on it. Actual soft-delete logic (filtering `WHERE deletedAt IS NULL`) may or may not be enforced in queries — verify per module.

### Schema Modification

When changing schema: edit **both** `prisma/schema.sqlite.prisma` and `prisma/schema.postgresql.prisma`, then:
```bash
pnpm db:generate && pnpm db:push
```
PostgreSQL-specific annotations (like `@db.Decimal`) are in the `.postgresql.prisma` file and commented out in the `.sqlite.prisma` file.

### Type Generation from Prisma

```typescript
// src/actions/property/index.ts:44,57,73
export type PropertyWithRelations = Prisma.PromiseReturnType<typeof getProperty>
export type PropertyLite = Prisma.PromiseReturnType<typeof getPropertyLite>
export type PropertyWithUnits = Prisma.PromiseReturnType<typeof getPropertyWithUnits>
```

---

## 6. Navigation Pattern

### Client Components — useRouter

```typescript
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/dashboard/admin')        // Navigate
router.replace('/')                    // Replace
router.refresh()                       // Re-fetch server data
// (src/app/dashboard/admin/page.tsx:21,57)
```

### useAppRouter (Custom Hook)

`src/hooks/useAppRouter.ts` — wraps `useRouter` + `useTransition` with a fallback to `window.location.assign` after 500ms if Next.js navigation didn't take effect. Usage undetermined in current codebase.

### Server Components — redirect

```typescript
import { redirect } from 'next/navigation'
redirect('/process/profile')
// (src/app/process/page.tsx:4)
```

Used in Server Components to redirect at render time (e.g., index route redirects to first step).

---

## 7. Server Action Response Convention

### Two patterns observed:

**Pattern A — Direct throw / return data** (read-only actions, no `Action` suffix):
```typescript
// src/actions/property/index.ts:7-16
export const getProperties = async () => {
  try {
    return await prisma.property.findMany({ ... })
  } catch (error) {
    console.error('Error:', error)
    throw error  // throws, caller handles
  }
}
```

**Pattern B — Standard response** (mutations, functions with `Action` suffix):
```typescript
// src/actions/property/index.ts:125-172
export const createPropertyAction = async (input) => {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'No autenticado' }
  try {
    // ... prisma operations ...
    return { success: true, data: property }
  } catch (error) {
    console.error('Error:', error)
    return { success: false, error: 'No se pudo crear...' }
  }
}
```

**Rule**: Functions suffixed `Action` MUST return `{ success: boolean; data?: T; error?: string }`.

---

## 8. DOS and DON'TS

### DO

- Start every Server Action with `const session = await auth()`
- Use `+/` path alias for all project imports (never `../../` chains)
- Use `type` (not `interface`) for props/state types
- Use `useDispatch`/`useSelector` from `+/redux` (typed wrappers)
- Use `useActionState` for auth forms, direct async calls for admin CRUD forms
- Edit BOTH Prisma schemas (sqlite + postgresql) when changing models
- Use `'use client'` only when needed (state, events, hooks, browser APIs)
- Return `{ success, data?, error? }` from `Action`-suffixed functions
- Use `console.error` for caught exceptions in Server Actions
- Name Server Action modules `index.ts` in kebab-case directories

### DON'T

- DON'T use `interface` — use `type` everywhere
- DON'T use `react-hook-form` — it's installed but the project uses `useActionState` + manual forms
- DON'T create REST/GraphQL endpoints — Server Actions are the only backend contract
- DON'T use semicolons
- DON'T use double quotes for strings (except JSX props per JSX convention)
- DON'T call Server Actions directly in Server Components without `'use server'` in the action file
- DON'T use `loading.tsx` files — inline loading states with `useState` flag
- DON'T create central type directories — co-locate types with the code that uses them
- DON'T commit `.env` or secrets
- DON'T use `fetch()` to call endpoints — use Server Action imports directly

---

## Quick Reference: File Paths

| What | Path |
|------|------|
| Prisma client (singleton) | `src/lib/prisma.ts` |
| Auth config (NextAuth) | `src/lib/auth.ts` |
| Email target resolution | `src/lib/email.ts` |
| Proxy middleware | `src/proxy.ts` |
| Redux store + typed hooks | `src/redux/index.ts` |
| Redux initial state | `src/redux/store.ts` |
| Redux slices | `src/redux/slices/*.ts` |
| Client session hook | `src/hooks/useSession.ts` |
| Server session getter | `src/hooks/getSession.ts` |
| App router wrapper | `src/hooks/useAppRouter.ts` |
| RequireAuth guard | `src/components/auth/RequireAuth.tsx` |
| Header (nav bar) | `src/components/Header/index.tsx` |
| Modal component | `src/components/Modal/index.tsx` |
| Type augmentation (NextAuth) | `src/types/next-auth.d.ts` |
| Path alias config | `tsconfig.json:18` |
| Prettier config | `.prettierrc` |
| Environment template | `example.env` |
