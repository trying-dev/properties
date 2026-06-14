# AGENTS.md — AI Agent Quick Reference

## Quick Start

Properties is a Next.js 16 (App Router) full-stack property management app. Stack: React 19, NextAuth v5 (Credentials/JWT), Redux Toolkit, Prisma (SQLite dev / PostgreSQL prod), Tailwind CSS 4, Resend (email).

```bash
cp example.env .env   # fill NEXTAUTH_SECRET, RESEND_API_KEY
pnpm install
pnpm db:generate && pnpm db:push && pnpm db:seed
pnpm dev              # http://localhost:3000
```

Seed users: `admin1@propiedades.com` (SUPER_ADMIN), `comerciante1@gmail.com` (tenant). Password = `SEED_PASSWORD` from `.env`.

---

## Entry Points Map

### Route Tree (`src/app/`)

| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Landing page with unit search, auth modal | Public |
| `/sobre-nosotros` | About page | Public |
| `/contacto` | Contact page | Public |
| `/terminos` | Terms of service | Public |
| `/privacidad` | Privacy policy | Public |
| `/units/[id]` | Public unit detail | Public |
| `/reset-password` | Password recovery (email → token → new password) | Public |
| `/registro-con-token` | Tenant registration via invite token | Public |
| `/codeudor/confirmar` | Co-debtor confirmation (token-based) | Public |
| `/dashboard` | Redirect hub (no content) | Session required |
| `/dashboard/admin` | Admin dashboard home | Session + admin role |
| `/dashboard/admin/units` | Admin unit list (table with filters) | Session + admin |
| `/dashboard/admin/units/[id]` | Admin unit detail/edit | Session + admin |
| `/dashboard/admin/properties` | Property list/CRUD | Session + admin |
| `/dashboard/admin/properties/[id]` | Property detail with units | Session + admin |
| `/dashboard/admin/payments` | Payment management (list, confirm, filter) | Session + admin |
| `/dashboard/admin/applications` | Application/process list (tenant applications) | Session + admin |
| `/dashboard/admin/applications/[id]` | Application detail/review | Session + admin |
| `/dashboard/admin/nuevo-proceso` | Start new rental process (select unit) | Session + admin |
| `/dashboard/admin/nuevo-proceso/seleccion-de-usuario` | Select/create tenant for process | Session + admin |
| `/dashboard/admin/nuevo-proceso/confirmacion-de-inicio-de-proceso` | Confirm & send invite email | Session + admin |
| `/dashboard/admin/gestion-de-inquilinos` | Tenant CRUD (search, create, edit, disable) | Session + admin |
| `/dashboard/admin/notifications` | Admin notifications inbox | Session + admin |
| `/dashboard/admin/create-admin` | Create new admin (SUPER_ADMIN/MANAGER only) | Session + admin |
| `/dashboard/admin/administrators` | List admins | Session + admin |
| `/dashboard/tenant` | Tenant dashboard home | Session + tenant |
| `/dashboard/tenant/perfil` | Tenant profile | Session + tenant |
| `/dashboard/tenant/formulario-de-tenant` | Tenant application form | Session + tenant |
| `/dashboard/tenant/units` | Tenant's contracted units | Session + tenant |
| `/dashboard/tenant/processes` | Tenant's application processes | Session + tenant |
| `/dashboard/tenant/notifications` | Tenant notifications inbox | Session + tenant |
| `/dashboard/tenant/favoritos` | Tenant favorite units | Session + tenant |
| `/dashboard/property/[id]` | Shared property detail view | Session required |
| `/process` | Rental application wizard entry | Session + tenant |
| `/process/profile` | Step 1: Select profile type | Session + tenant |
| `/process/basicInformation` | Step 2: Personal info, identity, income | Session + tenant |
| `/process/complementInfo` | Step 3: Upload documents by profile type | Session + tenant |
| `/process/security` | Step 4: Guarantee, co-debtors, deposit | Session + tenant |
| `/api/cron/payments` | Generate monthly payments for active contracts | CRON_SECRET |
| `/api/cron/alerts` | Mark overdue payments, generate alerts | CRON_SECRET |

### Middleware (`src/proxy.ts`)

Custom Next.js middleware (not `middleware.ts`). Matches all routes except `api`, `_next/static`, `_next/image`, `*.png`. Guards:
- Blocks unauthenticated access to `/dashboard/*` and `/process/*` → redirects to `/`
- Enforces HTTP-level admin-level route access (e.g. LIMITED admins cannot access `/dashboard/admin/*`, tenants cannot access `/dashboard/admin/*`)
- Validates required env vars on first request (RESEND_API_KEY, FROM_EMAIL, etc.); returns 500 if missing

### Server Action Modules (`src/actions/`)

| Module | Key Exports |
|--------|------------|
| `auth/login` | `authenticate` |
| `auth/register` | `registerUser`, `verifyEmailCode`, `resendVerificationCode` |
| `auth/reset-password` | `sendResetPasswordEmail`, `validateResetToken`, `resetPassword` |
| `user/index` | `getUserTenant`, `getUserAfterLogin`, `updateTenantProfile`, `updateUserBasicInfo` |
| `admin/index` | `createAdmin` |
| `property/index` | `getProperties`, `getProperty`, `getPropertyLite`, `getPropertyWithUnits`, `createPropertyAction`, `updatePropertyAction`, `deletePropertyAction`, `createUnitAction`, `updateUnitAction`, `deleteUnitAction` |
| `units/index` | `getAdminUnits`, `getAdminUnitsAction` |
| `payments/index` | `getAdminPayments`, `getAdminPaymentsAction`, `getPendingPaymentsCount`, `confirmPaymentAction` |
| `processes/index` | `createProcessAction`, `updateProcessAction`, `getProcessAction`, `getProcessDetailsAction`, `getTenantProcessesAction`, `deleteTenantProcessAction`, `getAdminProcessesAction`, `getProcessByTenantUnitAction` |
| `nuevo-proceso/index` | `getAvailableUnits`, `getUnitById`, `getPropertiesWithAvailableUnits`, `reserveUnit`, `getUnitsByProperty`, + `Action`-suffixed variants |
| `confirmacion-de-inicio-de-proceso/index` | `getProcessDetails`, `initializeContract`, `updateUserRegistrationToken`, + `Action` variants |
| `registro-con-token/index` | `validateRegistrationToken`, `completeUserRegistration` |
| `codeudor/index` | `sendCoDebtorConfirmationEmailsAction`, `confirmCoDebtorAction` |
| `gestion-de-inquilinos/index` | `getTenantsAction`, `getTenantByIdAction`, `createTenantAction`, `updateTenantAction`, `disableTenantAction`, `getTenantsStatsAction` |
| `notifications/index` | `getTenantNotificationsAction`, `getAdminNotificationsAction`, `markNotificationReadAction`, `sendNotificationAction`, `sendSystemNotificationAction` |
| `favorites/index` | `getTenantFavoriteUnitIdsAction`, `toggleTenantFavoriteUnitAction`, `getTenantFavoriteUnitsAction` |

---

## Architecture Layers

```
Client (React)
  → Server Actions ('use server')   ← All data mutations & queries
    → Prisma ORM                    ← SQLite (dev) / PostgreSQL (prod)
      → DB
```

### Redux Slices

| Slice | Stores | Persisted to localStorage? |
|-------|--------|---------------------------|
| `auth` | `isAuthenticated`, `loginState`, `registerState`, `codeVerificationState`, `authModalOpen`, `authModalTab`, `resetPasswordModalOpen`, `verificationExpiresAt` | Yes |
| `user` | `UserForRedux` (id, email, name, role, admin/tenant data) | Yes |
| `property` | Currently viewed property | Yes |
| `home` | `units[]`, `showFilters`, `searchQuery`, `filters` (priceMax, bedrooms, city) | Yes _(but `units` excluded on persist)_ |
| `process` | `processId`, `tenantId`, `unitId`, `profile`, `step`, `basicInfo`, `uploadedDocs`, `securityFields` | Yes _(but `uploadedDocs` excluded on persist)_ |

Persisted to `localStorage` key `"state"`. Rehydrated on Redux store init. Auth reset middleware auto-clears auth process state on `setIsAuthenticated`.

### Auth Flow

- **NextAuth v5** (`src/lib/auth.ts`) with `Credentials` provider (email + password)
- `authorize()` looks up user in Prisma, compares bcrypt hash, checks `disable` flag, sets `role` (`'admin'` if admin relation exists, else `'tenant'`)
- **JWT strategy**, 30-day maxAge. Token stores: `sub`, `role`, `adminLevel`, `email`, `name`
- `authorized` callback blocks `/dashboard/*` without session (proxy.ts adds additional HTTP-level guards)
- Session exposes: `session.user.id`, `.role`, `.adminLevel`, `.email`, `.name`
- Auth check pattern in Server Actions: `const session = await auth(); if (!session) return { success: false, error: 'Unauthorized' }`
- Client auth check: `useSession()` hook (fetches `/api/auth/session`) + `RequireAuth` wrapper component + Redux `isAuthenticated`

### Role System

**Admin levels** (stored in `Admin.adminLevel`): `SUPER_ADMIN` > `MANAGER` > `STANDARD` > `LIMITED`
**Tenant**: `'tenant'` role (no levels). Session `user.role` is `'tenant'` for tenants, `'admin'` for admins.

### Email System

Resend transactional emails (verify codes, password reset, tenant invites). **Test mode**: when `USING_TESTING_EMAIL=true`, all emails redirect to `RESEND_EMAIL_TEST` via `src/lib/email.ts:resolveEmailTargets()`.

### Database

Dual schema: `prisma/schema.sqlite.prisma` (dev), `prisma/schema.postgresql.prisma` (prod). Auto-selected by `src/lib/prisma.ts` detecting `DATABASE_URL` prefix (`file:` or `libsql` → SQLite; `postgres` → PostgreSQL). Prisma client is a singleton cached on `globalThis` in dev. 11 models: User, Admin, Tenant, Property, Unit, Contract, ContractDocument, Payment, Process, Notification, Reference.

---

## Key Conventions

1. **Server Action response shape**: All return `{ success: boolean; data?: T; error?: string }`. Functions suffixed `Action` guarantee this.
2. **Path alias**: `+/*` maps to `./src/*`. Import example: `import { prisma } from '+/lib/prisma'`.
3. **Language**: Code = English, UI labels = Spanish, docs = Spanish.
4. **File naming**: Action dirs = kebab-case (`nuevo-proceso/`), components = PascalCase (`LoginForm.tsx`), lib = camelCase (`prisma.ts`).
5. **Forms**: Use `useActionState` (React 19) directly with Server Actions. `react-hook-form` used in some admin forms.
6. **Auth in Server Actions**: Always `const session = await auth()` as first step, then role-check.
7. **Components**: Use `'use client'` only when necessary (state, events, browser APIs). Prefer Server Components for static content.
8. **No REST/GraphQL API**: Server Actions are the only backend contract. `/api/cron/*` are the only REST endpoints.
9. **No tests** in the project currently.

---

## Common Tasks for Agents

### Add a new page/route

1. Create directory under `src/app/<path>/` with `page.tsx`
2. If protected, the route is auto-guarded by `proxy.ts` (dashboard/process paths) or add logic
3. For tenant-facing dashboard pages, add to `/dashboard/tenant/`; for admin, `/dashboard/admin/`

### Add a new Server Action

1. Create `src/actions/<feature-name>/index.ts`
2. Add `'use server'` at top
3. Call `const session = await auth()` and validate role
4. Return `{ success: boolean, data?: T, error?: string }`
5. Export functions; use `Action` suffix for standard-response functions

### Add a new Redux slice

1. Create `src/redux/slices/<name>.ts` using `createSlice` from Redux Toolkit
2. Add to `src/redux/store.ts` initial state and `src/redux/index.ts` `combineReducers`
3. Add to persistence blacklist in `store.subscribe` if storing non-serializable data

### Add a new component

1. Create under `src/components/<Name>/index.tsx` for shared components
2. Use `'use client'` only if it needs hooks/state/events
3. Import Server Actions to trigger data mutations

### Database / Prisma commands

```bash
pnpm db:generate   # Generate Prisma client
pnpm db:push       # Sync schema to DB (no migrations — dev)
pnpm db:migrate    # Create & apply migration (prod)
pnpm db:studio     # Open Prisma Studio at localhost:5555
pnpm db:seed       # Seed with test data
pnpm db:reset      # Reset DB completely
```

When modifying schema: edit both `prisma/schema.sqlite.prisma` and `prisma/schema.postgresql.prisma`, then run `pnpm db:generate && pnpm db:push`.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | NextAuth v5 config (Credentials provider, JWT callbacks, session) |
| `src/proxy.ts` | Custom middleware: auth guard, role-based route access, env validation |
| `src/lib/prisma.ts` | Prisma singleton, auto-selects SQLite/PostgreSQL adapter |
| `src/lib/email.ts` | Email target resolution with test-mode redirect |
| `src/actions/auth/login.ts` | `authenticate` Server Action |
| `src/actions/auth/register.ts` | `registerUser`, `verifyEmailCode` |
| `src/redux/index.ts` | Redux store config, persistence, typed hooks |
| `src/redux/store.ts` | Initial state shape and types for all slices |
| `src/types/next-auth.d.ts` | Augments Session/User/JWT with `role` and `adminLevel` |
| `src/hooks/useSession.ts` | Client-side session fetch hook |
| `src/components/Header/index.tsx` | Nav bar with auth modal, role-based links |
| `src/app/layout.tsx` | Root layout (wraps with ReduxProvider) |
| `src/app/dashboard/layout.tsx` | Dashboard layout (wraps with RequireAuth) |
| `src/app/process/layout.tsx` | Process wizard layout (RequireAuth + StepProgress + SummarySidebar) |
| `src/lib/payments/alerts.ts` | Payment alert generation logic (cron jobs call this) |
| `prisma/schema.sqlite.prisma` | Prisma schema for SQLite development |
| `prisma/schema.postgresql.prisma` | Prisma schema for PostgreSQL production |
| `src/app/api/cron/payments/route.ts` | Monthly payment generation cron endpoint |
| `src/components/auth/RequireAuth.tsx` | Client auth guard (redirects to `/` if not authenticated) |
| `src/components/auth/AuthFormsPanel.tsx` | Login/Register tab panel with form switching |
