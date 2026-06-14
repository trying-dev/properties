# PropertyHub - Complete Data Flow Map

> Generated for AI agents to understand every data path in the application.
> All path aliases: `+/*` = `./src/*` (see `tsconfig.json:17`)

---

## 1. Request Lifecycle

### 1.1 Full Request Path (Browser → Response)

```
Browser
  │
  ├─ [Client-side hydration]
  │    └─ src/redux/Provider.tsx:10          ReduxProvider wraps entire app
  │         └─ src/redux/index.ts:45         configureStore with persisted state
  │              └─ src/redux/index.ts:23     loadPersistedState() from localStorage
  │              └─ src/redux/index.ts:60     subscribe() persists to localStorage
  │
  ├─ [Next.js middleware - runs on every route except /api, /_next/*, *.png]
  │    └─ src/proxy.ts:56-115                proxy() exported as default middleware
  │         │
  │         ├─ src/proxy.ts:57-66             Validate env vars (RESEND_API_KEY, FROM_EMAIL, NEXTAUTH_SECRET, NEXT_PUBLIC_APP_URL)
  │         ├─ src/proxy.ts:68               Get session via auth()
  │         ├─ src/proxy.ts:72-74            Skip .well-known and _next paths
  │         ├─ src/proxy.ts:81-84            If no session → redirect to / (for /dashboard/* and /process/*)
  │         └─ src/proxy.ts:87-112           Role-based route access check
  │              └─ src/proxy.ts:7-24        roleRouteAccess matrix (SUPER_ADMIN, MANAGER, STANDARD, LIMITED, tenant)
  │
  ├─ [Server Component render]
  │    │
  │    ├─ [Auth check via server-side hook]
  │    │    └─ src/hooks/getSession.ts:5-13  getSession() → auth() → NextAuth JWT check
  │    │
  │    ├─ [Data fetching via Server Actions]
  │    │    └─ src/actions/**/*.ts           All 'use server' modules
  │    │         │
  │    │         ├─ Auth check (if required):
  │    │         │    └─ src/lib/auth.ts:135 auth() from NextAuth
  │    │         │         └─ src/lib/auth.ts:80-108  JWT callback (reads token, falls back to DB)
  │    │         │         └─ src/lib/auth.ts:111-120 Session callback (populates user.id, role, adminLevel)
  │    │         │
  │    │         ├─ Prisma query:
  │    │         │    └─ src/lib/prisma.ts:21-31  Singleton PrismaClient
  │    │         │         ├─ Supports PostgreSQL (with PRISMA_DATABASE_URL/accelerateUrl)
  │    │         │         └─ Supports libSQL (via @prisma/adapter-libsql)
  │    │         │
  │    │         └─ Returns { success: true/false, data/error } shape
  │    │
  │    └─ [Client-side dispatch to Redux]
  │         └─ src/redux/slices/*.ts         Reducers updated from action results
  │
  └─ [Response]
       └─ Server Component renders HTML → browser
       └─ Client components hydrate → Redux state drives UI
```

### 1.2 Directory Reference

| Layer | Path | Purpose |
|-------|------|---------|
| Middleware | `src/proxy.ts` | Route protection, env validation |
| Auth Config | `src/lib/auth.ts` | NextAuth v5 + Credentials provider |
| Database | `src/lib/prisma.ts` | PrismaClient singleton (Postgres or libSQL) |
| Email Lib | `src/lib/email.ts` | resolveEmailTargets() - test/prod routing |
| Server Actions | `src/actions/*/` | All `'use server'` data mutations/queries |
| Redux Store | `src/redux/index.ts` | Store config, persistence, middleware |
| Redux Slices | `src/redux/slices/*.ts` | State shape + reducers |
| Hooks | `src/hooks/*.ts` | Client-side auth hooks |
| Cron Jobs | `src/app/api/cron/*/route.ts` | Payment generation & alerting |
| Utils | `src/utils/index.ts` | capitalize, serializeDate |

---

## 2. Complete Server Actions Catalog

### 2.1 `src/actions/auth/login.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `authenticate` | `(prevState: {success,errors}\|undefined, formData: FormData) => Promise<{success, errors?}>` | No (calls signIn) | None (uses signIn → auth.ts:29-66 → User) | No | `auth.loginState` (client-side dispatch) |

- **Flow**: `src/actions/auth/login.ts:17-18` Validates email/password → `:44-47` calls `signIn('credentials', {email,password,redirect:false})` → `src/lib/auth.ts:29-66` `authorize()` reads User from DB, checks disable flag, updates `lastLoginAt` → `:133-138` exports `auth`, `signIn`, `signOut`
- **Redux**: Client dispatches `setLoginState` (idle → loading → success) based on result

### 2.2 `src/actions/auth/register.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `registerUser` | `(prevState: RegisterActionState\|undefined, formData: FormData) => Promise<RegisterActionState>` | No | User (create), Tenant (create nested) | YES - sends verification code via Resend | `auth.registerState`, `auth.codeVerificationState`, `auth.verificationExpiresAt` |

- **Flow**: `src/actions/auth/register.ts:18-24` extracts fields from FormData → `:27-43` validates → `:46-56` checks for existing user → `:58-61` hashes password, generates 6-digit code → `:62-72` creates User + Tenant (nested create) → `:74-78` resolves email target → `:80-85` sends email via Resend
- **Prisma**: Creates `User` (`:62-72`) and `Tenant` (`:70`) in one query
- **Email**: Verification code email to the registering user (15-min expiry)

### 2.3 `src/actions/auth/verify-email.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `resendVerificationCode` | `(email: string) => Promise<{success, errors?}>` | No | User (update) | YES - resends verification code | `auth.verificationExpiresAt` |
| `verifyEmailCode` | `(email: string, code: string) => Promise<{success, errors?}>` | No | User (update) | No | `auth.codeVerificationState`, `user.emailVerified` |

- **Flow `resendVerificationCode`**: `src/actions/auth/verify-email.ts:18` validates email → `:22` finds user → `:25-26` generates new code + 15-min expiry → `:28-31` updates user DB → `:33-41` sends email
- **Flow `verifyEmailCode`**: `:46-48` validates email+code (6 digits) → `:53-64` finds user, checks expiry, compares code → `:66-73` sets `emailVerified`, clears verification fields

### 2.4 `src/actions/auth/reset-password.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `sendResetPasswordEmail` | `(email: string) => Promise<{success, message?}>` | No | User (update: resetPasswordToken, resetPasswordExpiresAt) | YES - sends reset link via Resend | `auth.resetPasswordModalOpen` |
| `validateResetToken` | `(token: string) => Promise<{valid, userId?, email?, message?}>` | No | User (read, update if expired) | No | None |
| `resetPassword` | `(token: string, newPassword: string) => Promise<{success, message?}>` | No | User (update: password, clear token) | No | None |

- **Flow `sendResetPasswordEmail`**: `src/actions/auth/reset-password.ts:17-19` validates email → `:23-24` finds user (returns success regardless for security) → `:32-45` generates 32-byte hex token + 1-hr expiry, stores on User → `:48` builds reset URL → `:52` resolves email target → `:66-265` sends HTML email via Resend
- **Flow `validateResetToken`**: `:285-322` finds user by token → checks expiry → checks `resetPasswordUsed` flag
- **Flow `resetPassword`**: `:324-362` validates token → hashes new password with bcrypt (10 rounds) → updates User (password, clears token, marks used)

### 2.5 `src/actions/registro-con-token/index.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `validateRegistrationToken` | `(token: string) => Promise<{success, error?, tenant?}>` | No | Tenant (read) | No | None |
| `completeUserRegistration` | `({token, password, agreeTerms}: {token, password, agreeTerms}) => Promise<{success, error?, message?}>` | Yes (calls signIn) | Tenant (update), User (update: password) | No | `user` (via post-login fetch) |

- **Flow `validateRegistrationToken`**: `src/actions/registro-con-token/index.ts:21-49` uses helper `findTenantByToken` (`:8-19`) → finds Tenant by registrationToken that hasn't expired
- **Flow `completeUserRegistration`**: `:51-150` validates password (min 8 chars, uppercase, lowercase, number) → `:101` finds tenant by token → `:110` hashes password → `:112-119` updates Tenant (clears token) + User (sets password) → `:121-125` calls `signIn('credentials', {redirect: false})` for auto-login

### 2.6 `src/actions/user/index.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `getUserTenant` | `() => Promise<UserTenant \| null>` | Yes (session) | User, Tenant, Contract, Unit, Property, Payment, Admin | No | `user` (setUser) |
| `getUserAfterLogin` | `({email}: {email: string}) => Promise<UserForRedux \| null>` | No (post-login) | User, Admin, Tenant | No | `user` (setUser) |
| `updateTenantProfile` | `({tenantId, data}: {tenantId, data: {profile}})` | No | Tenant (update) | No | `user.tenant.profile` (updateTenantProfile) |
| `updateUserBasicInfo` | `({data}: {data: BasicInfoUpdatePayload}) => Promise<{id} \| null>` | Yes (session) | User (update) | No | `user` (updateUserBasicInfo) |

- **Flow `getUserTenant`**: `src/actions/user/index.ts:44-76` calls `auth()` → finds User by session.user.id with deep include (tenant→contracts→unit→property, payments, admins)
- **Flow `getUserAfterLogin`**: `:80-119` finds User by email → determines `role` = admin/tenant → serializes dates → returns `UserForRedux`
- **Flow `updateUserBasicInfo`**: `:168-197` normalizes optional strings/dates/numbers → updates User by session id
- **Types**: `src/actions/user/types.ts:161-165` defines `UserForRedux` (extends userSelected with serialized dates + role + admin/tenant optional)

### 2.7 `src/actions/nuevo-proceso/index.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `getAvailableUnits` | `(filters?: {...}) => Promise<Unit[]>` | No | Unit, Property, Admin, User | No | `home.units` (setUnits) |
| `getAvailableUnitsForHome` | `() => Promise<HomeUnit[]>` | No | Unit, Property | No | `home.units` (setUnits) |
| `getUnitById` | `({id}: {id: string}) => Promise<UnitWithRelations>` | No | Unit, Property, Admin, User, Contract, Payment, AdditionalResident | No | None |
| `getPropertiesWithAvailableUnits` | `() => Promise<PropertyWithAvailableUnits[]>` | No | Property, Unit | No | None |
| `reserveUnit` | `({unitId}: {unitId: string}) => Promise<Unit>` | No | Unit (update status) | No | None |
| `getUnitsByProperty` | `({propertyId}: {propertyId: string}) => Promise<Unit[]>` | No | Unit, Property | No | None |
| `getAvailableUnitsAction` | (wrapper with success/error) | No | Same as getAvailableUnits | No | None |
| `getUnitByIdAction` | (wrapper with success/error) | No | Same as getUnitById | No | None |
| `getPropertiesWithAvailableUnitsAction` | (wrapper) | No | Same as getPropertiesWithAvailableUnits | No | None |
| `reserveUnitAction` | (wrapper + revalidatePath) | No | Same as reserveUnit | No | None |
| `getUnitsByPropertyAction` | (wrapper) | No | Same as getUnitsByProperty | No | None |

- **Key filter logic**: `src/actions/nuevo-proceso/index.ts:7-58` builds Prisma where clause from filter object (rent range, bedrooms, city, propertyType, etc.) → only `VACANT` status units
- **reserveUnit**: `:126-149` validates unit exists and is VACANT → updates status to RESERVED → `:236-237` revalidates `/dashboard/units` and `/dashboard/properties` paths
- **Exported types**: `:168-171` UnitWithRelations, AvailableUnit, HomeUnit, PropertyWithAvailableUnits

### 2.8 `src/actions/confirmacion-de-inicio-de-proceso/index.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `getProcessDetails` | `({unitId, tenantId}: {unitId, tenantId}) => Promise<{unit, tenant}>` | No | Unit, Property, Admin, User, Tenant | No | None |
| `initializeContract` | `({unitId, tenantId, adminId, notes?}) => Promise<Contract>` | No | Unit, Tenant, User, Admin, Contract (create) | No (see Action below) | None |
| `updateUserRegistrationToken` | `(tenantId, token) => Promise<Tenant>` | No | Tenant (update) | No | None |
| `getProcessDetailsAction` | (wrapper) | No | Same as getProcessDetails | No | None |
| `initializeContractAction` | (wrapper + sends emails) | No | Same as initializeContract + emails | **YES** - sends registration or continue email | `process.processId` |

- **Flow `initializeContractAction`**: `src/actions/confirmacion-de-inicio-de-proceso/index.ts:129-199`
  1. Creates contract (`:140-146`) with status `INITIATED`
  2. Fetches process details to get tenant info (`:148-151`)
  3. Checks if tenant has password → determines "new user" vs "existing user" (`:155`)
  4. **New user**: generates 32-byte registration token → updates Tenant (`:162-164`) → sends registration email (`:166-170`)
  5. **Existing user**: sends "continue" email (`:174-178`)
  6. Returns contract info + email status

### 2.9 `src/actions/confirmacion-de-inicio-de-proceso/emailResend.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `EmailService` (class) | Constructor takes no args | No | None | YES (via Resend) | None |
| `emailService.sendNewUserRegistrationEmail` | `({tenantEmail, tenantName, registrationToken})` | No | None | YES - registration link | None |
| `emailService.sendExistingUserContinueEmail` | `({tenantEmail, tenantName})` | No | None | YES - login link | None |

- **Singleton**: `src/actions/confirmacion-de-inicio-de-proceso/emailResend.ts:242` exports `emailService` as singleton
- **Testing**: Uses `src/lib/email.ts:11-32` `resolveEmailTargets()` to route to test email if `USING_TESTING_EMAIL=true`
- **Token URL**: `:21` builds URL as `${NEXT_PUBLIC_APP_URL}/registro-con-token?token=${registrationToken}`

### 2.10 `src/actions/codeudor/index.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `sendCoDebtorConfirmationEmailsAction` | `({processId, selectedSecurity, coDebtors}: {processId, selectedSecurity, coDebtors: CoDebtorInput[]})` | No | Process (read+update payload) | **YES** - sends confirmation to each co-debtor | `process.securityFields` |
| `confirmCoDebtorAction` | `({processId, token}: {processId, token})` | No | Process (read+update payload) | No | None |

- **Flow `sendCoDebtorConfirmationEmailsAction`**: `src/actions/codeudor/index.ts:57-139`
  1. Reads Process by processId (`:67-70`)
  2. Generates 24-byte hex token + 24-hr expiry for each co-debtor (`:76-82`)
  3. Updates Process.payload.security.coDebtors with tokens (`:84-99`)
  4. Sends email to each co-debtor via Resend (`:107-125`) with confirmation link: `${appUrl}/codeudor/confirmar?processId=...&token=...`

- **Flow `confirmCoDebtorAction`**: `:142-203`
  1. Reads Process payload → finds matching co-debtor by token → checks expiry → sets `confirmedAt`
  2. Updates Process.payload.security.coDebtors

### 2.11 `src/actions/processes/index.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `createProcessAction` | `(input: CreateProcessInput) => Promise<{success, data?, error?}>` | No | Tenant, Unit, Admin, Contract, Process (create) | No | `process.processId`, `process.tenantId`, `process.unitId` |
| `updateProcessAction` | `(input: UpdateProcessInput) => Promise<{success, error?}>` | No | Process (read+update), Tenant, Unit, Admin, Contract | No → but sends system notification on APPROVED/DISAPPROVED | `process` (setProcessState) |
| `getProcessAction` | `(processId: string) => Promise<{success, data?, error?}>` | No | Process (read) | No | None |
| `getProcessDetailsAction` | `(processId: string) => Promise<{success, data?, error?}>` | No | Process, Tenant, User, Unit, Property | No | None |
| `getTenantProcessesAction` | `(tenantId: string) => Promise<{success, data?, error?}>` | No | Process, Unit, Property | No | None |
| `getAdminProcessesAction` | `() => Promise<{success, data?, error?}>` | No | Process (filtered by active statuses) | No | None |
| `deleteTenantProcessAction` | `(processId, tenantId) => Promise<{success, error?}>` | No | Process (delete) | No | None |
| `getProcessByTenantUnitAction` | `(tenantId, unitId) => Promise<{success, data?, error?}>` | No | Process (findFirst) | No | None |

- **createProcessAction**: `src/actions/processes/index.ts:16-61` validates existence of related entities → checks for existing process (dedup) → creates with status `IN_PROGRESS`
- **updateProcessAction**: `:74-175` merges payload patches → updates relationships → on status change to `APPROVED` or `DISAPPROVED` (`:147-168`): sends system notification via `sendSystemNotificationAction()`
- **getAdminProcessesAction**: `:299-333` filters by [IN_PROGRESS, IN_EVALUATION, WAITING_FOR_FEEDBACK]
- **Exported types**: `:235-276` ProcessDetail, TenantProcessList, TenantProcessItem, AdminProcessList, AdminProcess, TenantUnitProcess

### 2.12 `src/actions/notifications/index.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `getTenantNotificationsAction` | `() => Promise<{success, data?, error?}>` | Yes (session → tenant) | Notification, Admin, User | No | None |
| `getAdminNotificationsAction` | `() => Promise<{success, data?, error?}>` | Yes (session → admin) | Notification, Tenant, User | No | None |
| `markNotificationReadAction` | `(notificationId: string) => Promise<{success, error?}>` | Yes (session) | Notification (update) | No | None |
| `sendNotificationAction` | `(input: {tenantId?, body, title?, type?, link?})` | Yes (session → sender role) | Notification (create) | No | None |
| `sendSystemNotificationAction` | `(input: {tenantId?, adminId?, body, title?, type?, link?})` | No (no auth required) | Notification (create) | No | None |

- **Auth model**: `src/actions/notifications/index.ts:12-28` three helpers:
  - `getSessionUserId()` (`:7-9`) calls `auth()` → returns user.id
  - `getTenantContext()` (`:12-19`) finds Tenant by userId
  - `getAdminContext()` (`:21-28`) finds Admin by userId
- **sendNotificationAction**: `:141-188` determines sender role (TENANT/ADMIN) → admins must specify a target tenantId → creates Notification
- **sendSystemNotificationAction**: `:199-239` no auth required → creates Notifications with `NotificationSenderRole.SYSTEM` → can send to both tenant AND admin simultaneously

### 2.13 `src/actions/favorites/index.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `getTenantFavoriteUnitIdsAction` | `() => Promise<{success, data}>` | Yes (session → tenant) | Tenant (read) | No | None |
| `toggleTenantFavoriteUnitAction` | `(unitId: string) => Promise<{success, data?, error?}>` | Yes (session → tenant) | Tenant (update: favoriteUnitIds) | No | None |
| `getTenantFavoriteUnitsAction` | `() => Promise<{success, data?, error?}>` | Yes (session → tenant) | Tenant, Unit, Property, Admin, User | No | None |

- **Auth helper**: `src/actions/favorites/index.ts:11-18` `getTenantBySession()` calls `auth()` → finds Tenant by userId
- **Normalization**: `:6-9` `normalizeFavoriteIds()` ensures `favoriteUnitIds` is always a string array

### 2.14 `src/actions/units/index.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `getAdminUnits` | `(filters?: {status?, propertyId?, city?}) => Promise<Unit[]>` | No | Unit, Property, Contract, Tenant, User | No | None |
| `getAdminUnitsAction` | (wrapper with success/error) | No | Same | No | None |

### 2.15 `src/actions/property/index.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `getProperties` | `() => Promise<Property[]>` | No | Property | No | `property` (setProperty) |
| `getProperty` | `({id}) => Promise<PropertyWithRelations>` | No | Property, Admin, User, Unit, Contract, Payment, AdditionalResident | No | None |
| `getPropertyLite` | `({id}) => Promise<Property>` | No | Property | No | None |
| `getPropertyWithUnits` | `({id}) => Promise<PropertyWithUnits>` | No | Property, Unit | No | None |
| `createPropertyAction` | `(input: CreatePropertyInput) => Promise<{success, data?, error?}>` | **Yes** (session → admin check) | Admin, Property (create) | No | None |
| `createUnitAction` | `(input: CreateUnitInput) => Promise<{success, error?}>` | **Yes** (session → admin check) | Admin, Property, Unit (create) | No | None |
| `updateUnitAction` | `(unitId, input) => Promise<{success, error?}>` | **Yes** (session → admin → property ownership check) | Admin, Unit (update) | No | None |
| `deleteUnitAction` | `(unitId) => Promise<{success, error?}>` | **Yes** (session → admin → property ownership check) | Admin, Unit (delete) | No | None |
| `updatePropertyAction` | `(propertyId, input) => Promise<{success, error?}>` | **Yes** (session → admin → property ownership check) | Admin, Property (update) | No | None |
| `deletePropertyAction` | `(propertyId) => Promise<{success, error?}>` | **Yes** (session → admin → property ownership check) | Admin, Property (delete) | No | None |

- **Auth pattern for mutations**: `src/actions/property/index.ts:125-128` template:
  1. `auth()` → get userId
  2. Find admin by userId
  3. Verify admin owns the property (via `admins: {some: {id: admin.id}}`)
- **Exported types**: `:44` PropertyWithRelations, `:57` PropertyLite, `:73` PropertyWithUnits, `:75-97` CreatePropertyInput, `:99-123` CreateUnitInput

### 2.16 `src/actions/payments/index.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `getAdminPayments` | `() => Promise<Payment[]>` | No | Payment, Contract, Unit, Property, Tenant, User | No | None |
| `getAdminPaymentsAction` | (wrapper) | No | Same | No | None |
| `getPendingPaymentsCount` | `() => Promise<number>` | No | Payment (count) | No | None |
| `confirmPaymentAction` | `(input: {paymentId, receiptNumber?, reference?, notes?, transactionId?})` | No | Payment (update) | No | None |

- **confirmPaymentAction**: `src/actions/payments/index.ts:54-88` updates payment to `PAID` status → sets `paidDate` → revalidates `/dashboard/admin/payments`

### 2.17 `src/actions/gestion-de-inquilinos/index.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `getTenantsAction` | `(filters?: {search?, city?, documentType?, profile?, page?, pageSize?})` | No | Tenant, User, Reference, Contract, Unit, Property | No | None |
| `getTenantByIdAction` | `(tenantId: string)` | No | Tenant, User, Reference, Contract, Unit, Property, Payment | No | None |
| `createTenantAction` | `(tenantData: CreateTenantSubmit)` | No | User, Tenant, Reference (create) | No | None |
| `updateTenantAction` | `(tenantId, updateData)` | No | Tenant, User (update) | No | None |
| `disableTenantAction` | `(tenantId)` | No | Tenant (read), User (update: disable+deletedAt) | No | None |
| `getTenantsStatsAction` | `()` | No | Tenant (aggregate), Contract (count), User (groupBy) | No | None |

- **createTenantAction**: `src/actions/gestion-de-inquilinos/index.ts:116-162` checks for duplicate email/document → creates Tenant with nested User + References → revalidates `/dashboard/tenants`
- **updateTenantAction**: `:164-260` uses `prisma.$transaction` → updates User fields + Tenant fields separately → revalidates tenant paths
- **disableTenantAction**: `:262-294` soft-disables by setting `disable: true` + `deletedAt: new Date()`
- **getTenantsStatsAction**: `:296-345` returns `{totalTenants, activeContracts, citiesDistribution}` (note: line 337 has unreachable double-return bug)

### 2.18 `src/actions/admin/index.ts`

| Export | Signature | Auth | Prisma Models | Emails | Redux Affected |
|--------|-----------|------|---------------|--------|----------------|
| `createAdminCommand` | `(data: CreateAdminInput) => Promise<Admin>` | No | User, Admin (create in transaction) | No | None |
| `createAdmin` | `(data: CreateAdminInput) => Promise<{success, data?, error?, message?}>` | No | Same as above | No | None |

- **createAdmin**: `src/actions/admin/index.ts:103-148` validates required fields, email format, password length → calls `createAdminCommand` (`:34-101`) which uses `prisma.$transaction` to create User + Admin atomically → handles P2002 unique constraint violations → revalidates `/admin/users`, `/admin/admins`
- **CreateAdminInput**: `:8-32` includes full user profile fields + `adminLevel` + `temporaryPassword`

---

## 3. Redux State Map

### 3.1 Store Configuration (`src/redux/index.ts`)

- **Store**: `configureStore` at `:45-56`
- **Persistence**: Loads from `localStorage` key `'state'` at `:23-35` → subscribes to persist at `:60-79` (strips `home.units` and `process.uploadedDocs` before saving)
- **Middleware**: Custom `authResetMiddleware` at `:37-43` - when `setIsAuthenticated` fires, dispatches `resetAuthProcess`
- **RootReducer**: Combines `auth`, `user`, `property`, `home`, `process` at `:13-19`

### 3.2 Auth Slice (`src/redux/slices/auth.ts`)

| Field | Initial Value | Type |
|-------|---------------|------|
| `isAuthenticated` | `false` | `boolean` |
| `loginState` | `'idle'` | `'idle' \| 'start' \| 'loading' \| 'success'` |
| `registerState` | `'idle'` | `'idle' \| 'start' \| 'loading' \| 'success'` |
| `codeVerificationState` | `'idle'` | `'idle' \| 'start' \| 'loading' \| 'success'` |
| `resetPasswordModalOpen` | `false` | `boolean` |
| `authModalOpen` | `false` | `boolean` |
| `authModalTab` | `'login'` | `'login' \| 'register'` |
| `verificationExpiresAt` | `null` | `number \| null` |

| Reducer | Payload | Set By |
|---------|---------|--------|
| `setIsAuthenticated` | `boolean` | Client after login/logout |
| `setLoginState` | `AuthStepState` | During `authenticate()` call lifecycle |
| `setRegisterState` | `AuthStepState` | During `registerUser()` call lifecycle |
| `setCodeVerificationState` | `AuthStepState` | During `verifyEmailCode()` / `resendVerificationCode()` |
| `resetAuthProcess` | none | After `setIsAuthenticated` (via middleware) or manually |
| `setResetPasswordModalOpen` | `boolean` | Opening/closing reset password modal |
| `setAuthModalOpen` | `{open, tab?}` | Opening/closing auth modal |
| `setAuthVerificationExpires` | `number \| null` | After `registerUser()` sets expiry |

### 3.3 User Slice (`src/redux/slices/user.ts`)

| Field | Initial Value | Type |
|-------|---------------|------|
| `user` | `null` | `UserForRedux \| null` |

| Reducer | Payload | Set By |
|---------|---------|--------|
| `setUser` | `UserForRedux \| null` | After `getUserAfterLogin()` or `getUserTenant()` |
| `updateUserBasicInfo` | `Partial<UserForRedux>` | After `updateUserBasicInfo()` |
| `updateTenantProfile` | `string` | After `updateTenantProfile()` |

### 3.4 Home Slice (`src/redux/slices/home.ts`)

| Field | Initial Value | Type |
|-------|---------------|------|
| `units` | `[]` | `HomeUnit[]` |
| `showFilters` | `false` | `boolean` |
| `searchQuery` | `''` | `string` |
| `filters.priceMax` | `''` | `string` |
| `filters.bedrooms` | `''` | `string` |
| `filters.city` | `''` | `string` |

| Reducer | Payload | Set By |
|---------|---------|--------|
| `setUnits` | `HomeUnit[]` | After `getAvailableUnitsForHome()` or `getAvailableUnitsAction()` |
| `setShowFilters` | `boolean` | UX toggle |
| `setSearchQuery` | `string` | Search input |
| `setFilters` | `{priceMax, bedrooms, city}` | Filter panel |
| `resetFilters` | none | Reset all filter/search state |

### 3.5 Process Slice (`src/redux/slices/process.ts`)

| Field | Initial Value | Type |
|-------|---------------|------|
| `processId` | `null` | `string \| null` |
| `tenantId` | `null` | `string \| null` |
| `unitId` | `null` | `string \| null` |
| `profile` | `''` | `ProfileId \| ''` |
| `step` | `1` | `number` |
| `selectedSecurity` | `''` | `string` |
| `acceptedDeposit` | `false` | `boolean` |
| `basicInfo.name` | `''` | `string` |
| `basicInfo.lastName` | `''` | `string` |
| `basicInfo.email` | `''` | `string` |
| `basicInfo.phone` | `''` | `string` |
| `basicInfo.birthDate` | `''` | `string` |
| `basicInfo.birthPlace` | `''` | `string` |
| `basicInfo.documentType` | `undefined` | `DocumentType \| undefined` |
| `basicInfo.documentNumber` | `''` | `string` |
| `basicInfo.gender` | `undefined` | `Gender \| undefined` |
| `basicInfo.maritalStatus` | `undefined` | `MaritalStatus \| undefined` |
| `basicInfo.profession` | `''` | `string` |
| `basicInfo.monthlyIncome` | `''` | `string` |
| `uploadedDocs` | `{}` | `Record<string, FileList \| File[] \| undefined>` |
| `securityFields` | `{}` | `Record<string, SecurityFieldValue>` |

| Reducer | Payload | Set By |
|---------|---------|--------|
| `initProcess` | `{unitId}` | Starting a new process (resets to initial state + sets unitId) |
| `setProcessState` | `Partial<ProcessState>` | After `createProcessAction()`, `updateProcessAction()`, loading from DB |
| `updateBasicInfo` | `Partial<BasicInfo>` | Multi-step form field updates |
| `setUploadedDocs` | `Record<string, FileList \| File[]>` | Document upload step |
| `setSecurityFields` | `Record<string, SecurityFieldValue>` | Security/co-debtor form step |
| `resetProcess` | none | Exiting/canceling process |

### 3.6 Property Slice (`src/redux/slices/property.ts`)

| Field | Initial Value | Type |
|-------|---------------|------|
| `property` | `{}` | `any` |

| Reducer | Payload | Set By |
|---------|---------|--------|
| `setProperty` | `any` | After `getProperties()` or any property fetch |
| `cleanproperty` | none | Clearing property state |

---

## 4. Auth Flow Diagram

### 4.1 Login Flow (Step by Step)

```
1. Browser renders login form
   └─ src/app/page.tsx (or wherever auth modal/form lives)

2. User submits credentials
   └─ Form action → src/actions/auth/login.ts:7 authenticate()
        │
        ├─ :17-18    Extract email, password from FormData
        ├─ :26-39    Validate (email regex, password min 6 chars)
        ├─ :43-47    signIn('credentials', {email, password, redirect: false})
        │            └─ src/lib/auth.ts:133-138  NextAuth.signIn
        │                 └─ Calls authorize() at src/lib/auth.ts:29-66
        │                      ├─ :33           prisma.user.findUnique({email})
        │                      ├─ :47           bcrypt.compare(password, user.password)
        │                      ├─ :51           Check user.disable flag
        │                      ├─ :53           Update lastLoginAt
        │                      └─ :55-61        Return user object {id, email, name, role, adminLevel}
        │
        ├─ [JWT Callback] src/lib/auth.ts:80-108
        │    ├─ :82-91    On first login (user param present): writes role, adminLevel, email, name to token
        │    └─ :94-106   On subsequent calls (no user param): if role missing on token, reads DB by token.sub
        │
        ├─ [Session Callback] src/lib/auth.ts:111-120
        │    └─ :112-118  Writes token.sub→session.user.id, token.role→session.user.role, token.adminLevel, email, name
        │
        └─ :58-60    authenticate() returns {success: true}
```

### 4.2 Registration Flow

```
1. User fills registration form
   └─ → src/actions/auth/register.ts:18 registerUser()
        ├─ :18-42   Validate fields (name, lastName, email, password, agreeTerms)
        ├─ :46-56   Check existing user by email
        ├─ :58-60   Hash password (bcrypt, 10 rounds) + generate 6-digit verification code
        ├─ :62-72   prisma.user.create({...userData, tenant: {create: {}}})
        ├─ :74-85   Send verification email via Resend (15-min expiry)
        └─ :87      Return {success: false, needsVerification: true}

2. User enters verification code
   └─ → src/actions/auth/verify-email.ts:46 verifyEmailCode()
        ├─ :46-48   Validate email + 6-digit numeric code
        ├─ :53-64   Find user → check code expiry → compare code
        └─ :66-73   Set emailVerified, clear verificationCode/ExpiresAt

3. (Alternative) Resend code
   └─ → src/actions/auth/verify-email.ts:18 resendVerificationCode()
        ├─ :28-31   Generate new code, update user
        └─ :33-41   Send email
```

### 4.3 Token-Based Registration (Admin-initiated)

```
1. Admin initializes contract for new tenant
   └─ → src/actions/confirmacion-de-inicio-de-proceso/index.ts:129 initializeContractAction()
        ├─ :162-164  Generate 32-byte hex token, update Tenant with expiry (24 hrs)
        └─ :166-170  Send email via emailService.sendNewUserRegistrationEmail()
                      └─ src/actions/confirmacion-de-inicio-de-proceso/emailResend.ts:11-58
                           ├─ Build URL: NEXT_PUBLIC_APP_URL/registro-con-token?token=...
                           └─ Send via Resend

2. Tenant clicks email link
   └─ → src/actions/registro-con-token/index.ts:21 validateRegistrationToken()
        ├─ :8-19   findTenantByToken() - finds Tenant by registrationToken, checks not expired
        └─ :38-41  Returns tenant info {id, userId, user: {name, lastName, email, password}}

3. Tenant sets password
   └─ → src/actions/registro-con-token/index.ts:51 completeUserRegistration()
        ├─ :62-99   Validate password (min 8, uppercase, lowercase, number), confirm terms
        ├─ :110     Hash password (bcrypt, 10 rounds)
        ├─ :112-119 Update Tenant (clear token) + User (set password)
        └─ :121-125 Auto-login via signIn('credentials')
```

### 4.4 Password Reset Flow

```
1. User requests reset
   └─ → src/actions/auth/reset-password.ts:17 sendResetPasswordEmail()
        ├─ :23-24   Find user by email (returns success even if not found - security)
        ├─ :32      Generate 32-byte hex token
        ├─ :36-45   Store on User: resetPasswordToken, resetPasswordExpiresAt (+1hr), resetPasswordUsed=false
        ├─ :66-265  Send HTML email via Resend with reset link
        └─ Link:    NEXT_PUBLIC_APP_URL/reset-password?token=...

2. Validate token on reset page
   └─ → src/actions/auth/reset-password.ts:285 validateResetToken()
        └─ :287-321   Find user → check expiry → check not already used

3. Set new password
   └─ → src/actions/auth/reset-password.ts:324 resetPassword()
        ├─ :327     validateResetToken() first
        ├─ :338     Hash new password (bcrypt, 10 rounds)
        └─ :341-349 Update user (password, clear resetToken/ExpiresAt, set resetPasswordUsed=true)
```

### 4.5 Session & Auth State on Client

```
src/hooks/getSession.ts:5  getSession()
   └─ :7    auth() → NextAuth JWT session check
        └─ src/lib/auth.ts:80-108   JWT callback (reads/writes token)
        └─ src/lib/auth.ts:111-120  Session callback (populates session.user)

src/hooks/getSession.ts:15 getUserRole()
   └─ :17    auth() → session.user.role

src/hooks/getSession.ts:25 logout()
   └─ :27    signOut({redirectTo: '/', redirect: false})

src/hooks/useSession.ts:34 useSession()   [Client-side React hook]
   ├─ :38-54   refreshSession(): calls getSession() → updates state
   ├─ :56-59   clearSession(): sets session to null
   └─ :61-91   useEffect(): calls getSession() on mount
       Returns: {session, status, isLoading, isAuthenticated, user, role, refreshSession, clearSession}
```

### 4.6 Proxy Middleware Auth Gate

```
src/proxy.ts:56  proxy(request: NextRequest)
   ├─ :57-66  Validate env vars (required for all requests)
   ├─ :68     auth() → get session (JWT token check)
   ├─ :81-84  No session + path="/dashboard/*" or "/process/*" → redirect to "/"
   └─ :87-112 Session exists + path="/dashboard/*"
        ├─ :88     Read user.role
        ├─ :92-93  If admin: read adminLevel → get allowed routes from roleRouteAccess matrix
        ├─ :95-96  If tenant: use tenant routes
        └─ :98-109 If no access → redirect to "/"
```

---

## 5. Email Flow

### 5.1 Email Infrastructure

| Component | File | Purpose |
|-----------|------|---------|
| Email target resolver | `src/lib/email.ts:11-32` | Routes emails to test address if `USING_TESTING_EMAIL=true` |
| Resend client | Multiple files (singleton per module) | `new Resend(process.env.RESEND_API_KEY)` |
| EmailService class | `src/actions/confirmacion-de-inicio-de-proceso/emailResend.ts:4-242` | Registration/continue email templates |

**Env vars**: `RESEND_API_KEY`, `FROM_EMAIL`, `RESEND_EMAIL_TEST` (test mode), `USING_TESTING_EMAIL` (flag), `NEXT_PUBLIC_APP_URL`

### 5.2 All Email Triggers

| # | Trigger Action | File:Line | Sends To | Email Type | Subject |
|---|----------------|-----------|----------|------------|---------|
| 1 | `registerUser()` | `src/actions/auth/register.ts:80-85` | Newly registered user | Verification code | "Código de verificación" |
| 2 | `resendVerificationCode()` | `src/actions/auth/verify-email.ts:36-41` | User who requested resend | Verification code | "Tu código de verificación" |
| 3 | `sendResetPasswordEmail()` | `src/actions/auth/reset-password.ts:66-265` | User (or test email) | Password reset link | "Resetea tu Contraseña - PropertyHub" |
| 4 | `initializeContractAction()` → new user | `src/actions/confirmacion-de-inicio-de-proceso/index.ts:166-170` | Tenant (new user) via `emailService.sendNewUserRegistrationEmail()` | Registration link with token | "¡Bienvenido! Completa tu registro para continuar" |
| 5 | `initializeContractAction()` → existing user | `src/actions/confirmacion-de-inicio-de-proceso/index.ts:174-178` | Tenant (existing user) via `emailService.sendExistingUserContinueEmail()` | Login link | "Continúa con tu proceso de alquiler" |
| 6 | `sendCoDebtorConfirmationEmailsAction()` | `src/actions/codeudor/index.ts:107-125` | Each co-debtor | Confirmation link | "Confirma tu participacion como codeudor" |

### 5.3 Email Sending Diagram

```
Server Action
  │
  ├─ Build email content (HTML template)
  ├─ resolveEmailTargets(targetEmail)  ← src/lib/email.ts:11
  │    │
  │    ├─ USING_TESTING_EMAIL=true?
  │    │    └─ YES → from=FROM_EMAIL, to=RESEND_EMAIL_TEST, isTestMode=true
  │    │    └─ NO  → from=FROM_EMAIL, to=targetEmail, isTestMode=false
  │    │
  │    └─ Returns {ok, from, to, isTestMode} or {ok:false, error}
  │
  └─ resend.emails.send({from, to, subject, html})
       └─ Resend API → email delivered
```

### 5.4 Registration Token URLs

| Purpose | URL Pattern | Token Expiry |
|---------|-------------|--------------|
| New user registration | `${APP_URL}/registro-con-token?token=${32-byte-hex}` | 24 hours |
| Password reset | `${APP_URL}/reset-password?token=${32-byte-hex}` | 1 hour |
| Co-debtor confirmation | `${APP_URL}/codeudor/confirmar?processId=...&token=${24-byte-hex}` | 24 hours |

---

## 6. Cron Job Flows

### 6.1 Payment Generation Cron (`GET /api/cron/payments`)

**File**: `src/app/api/cron/payments/route.ts`

```
1. Request arrives at GET /api/cron/payments
   └─ src/app/api/cron/payments/route.ts:7-22
        │
        ├─ :10    Log start
        ├─ :10-17 Check CRON_SECRET auth (Bearer token)
        │         └─ If secret configured and auth fails → 401
        └─ :19    Call generateMonthlyPaymentsForActiveContracts()

2. generateMonthlyPaymentsForActiveContracts(date?)
   └─ src/lib/payments/monthly.ts:12-68
        │
        ├─ :13    getMonthWindow(date) → {dueDate, dueDateEnd}
        │         └─ :4-10   dueDate = 5th of current month, dueDateEnd = 6th
        │
        ├─ :15-23 Find ALL contracts with status='ACTIVE'
        │         └─ Select: id, rent
        │
        ├─ :30-36 Find existing payments in this month's window
        │         └─ WHERE contractId IN [...], dueDate >= dueDate AND < dueDateEnd
        │
        ├─ :38    Build Set of contractIds that already have payments (dedup)
        │
        ├─ :39-46 Determine payment type:
        │         └─ Check rent history: has this contract ever had a CANON/RENT payment?
        │              └─ YES → PaymentType.RENT (ongoing)
        │              └─ NO  → PaymentType.CANON (first payment)
        │
        ├─ :48-57 Build payment records to create
        │         └─ {contractId, amount: contract.rent, dueDate: 5th, paymentType, status: PENDING, notes}
        │
        └─ :63-65 prisma.payment.createMany(data: paymentsToCreate)

3. Response
   └─ :21    Return {created: N, skipped: N}
```

**Key facts**:
- Runs on the 5th of each month (window: dueDate=5th, dueDateEnd=6th)
- Creates one `PENDING` payment per active contract per month
- First payment per contract is `CANON` type, subsequent are `RENT` type
- Idempotent: skips contracts that already have a payment for the current window

### 6.2 Payment Alerts Cron (`GET /api/cron/alerts`)

**File**: `src/app/api/cron/alerts/route.ts`

```
1. Request arrives at GET /api/cron/alerts
   └─ src/app/api/cron/alerts/route.ts:7-24
        ├─ :10-17 Check CRON_SECRET auth
        └─ :19    Call generatePaymentAlerts()

2. generatePaymentAlerts(date?)
   └─ src/lib/payments/alerts.ts:12-167
        │
        ├─ [Phase 1: Mark overdue payments] :16-38
        │    ├─ :16-30   Find PENDING payments where dueDate < today
        │    └─ :34-37   Update their status to OVERDUE
        │
        ├─ [Phase 2: Notify tenants about overdue] :40-103
        │    ├─ :40     Build links for each overdue payment
        │    ├─ :41-48  Find existing OVERDUE notifications (dedup check)
        │    └─ :60-103 For each overdue payment:
        │         ├─ :65    Skip if notification already exists for this tenant+link
        │         ├─ :72-83 Create Notification for tenant:
        │         │    └─ type: PAYMENT_OVERDUE
        │         │    └─ senderRole: SYSTEM
        │         │    └─ title: "Pago vencido"
        │         │    └─ body: "tu pago de arriendo para {property} ({unit}) venció el {date}."
        │         │    └─ metadata: {paymentId}
        │         └─ :86-103 Create Notification for admins (per payment's contract admins):
        │              └─ Same type + "Pago vencido sin registrar" title
        │
        └─ [Phase 3: Send payment reminders] :106-159
             ├─ :106-119  Find PENDING/PARTIAL payments due within next 3 days
             ├─ :121-131  Find existing REMINDER notifications (dedup)
             └─ :134-159  For each reminder payment:
                  ├─ :139    Skip if notification already exists
                  └─ :146-156 Create Notification for tenant:
                       └─ type: REMINDER
                       └─ title: "Recordatorio de pago"
                       └─ body: "tu pago... vence el {date}."

3. Response
   └─ :21-23  Return {overdueUpdated: N, overdueNotified: N, remindersSent: N}
```

**Key facts**:
- Should run daily (typically via cron schedule)
- **Idempotent**: Uses existing notification links as dedup mechanism (doesn't double-notify)
- Three phases: mark overdue → notify tenants+admins of overdue → remind about upcoming
- Reminder window: payments due within next 3 days from run date
- Creates `NotificationType.PAYMENT_OVERDUE` and `NotificationType.REMINDER` notifications

### 6.3 Cron Security

Both cron endpoints use the same auth pattern:
```
Authorization: Bearer <CRON_SECRET>
```
- If `CRON_SECRET` env var is set → requires matching Bearer token
- If `CRON_SECRET` is not set → no auth required (open)

---

## Appendix A: Prisma Models Referenced

Inferred from the codebase imports (from `@prisma/client`):

| Model | Key Fields (inferred) |
|-------|----------------------|
| **User** | id, email, name, lastName, password, phone, birthDate, birthPlace, address, city, state, country, postalCode, documentType, documentNumber, gender, maritalStatus, profession, monthlyIncome, profileImage, disable, deletedAt, timezone, language, emailNotifications, smsNotifications, emailVerified, phoneVerified, verificationCode, verificationCodeExpiresAt, resetPasswordToken, resetPasswordExpiresAt, resetPasswordUsed, createdAt, updatedAt, lastLoginAt |
| **Admin** | id, userId, adminLevel (SUPER_ADMIN/MANAGER/STANDARD/LIMITED), createdById |
| **Tenant** | id, userId, profile, emergencyContact, emergencyContactPhone, monthlyIncome, registrationToken, registrationTokenExpires, favoriteUnitIds, references |
| **Property** | id, name, description, street, number, city, neighborhood, state, postalCode, country, propertyType, builtArea, age, floors, totalLandArea, gpsCoordinates, yardOrGarden, parking, parkingLocation, balconiesAndTerraces, recreationalAreas, commonZones, status (ACTIVE/etc.), admins |
| **Unit** | id, propertyId, unitNumber, floor, area, bedrooms, bathrooms, furnished, balcony, parking, storage, petFriendly, smokingAllowed, internet, cableTV, waterIncluded, gasIncluded, status (VACANT/RESERVED/OCCUPIED), baseRent, deposit, description, images, highlights, lastInspectionDate |
| **Contract** | id, unitId, tenantId, adminId, status (ACTIVE/PENDING/INITIATED), rent, deposit, notes, startDate, endDate, initiatedAt, admins, additionalResidents |
| **Payment** | id, contractId, amount, dueDate, paymentType (CANON/RENT), status (PENDING/PAID/OVERDUE/PARTIAL), paidDate, receiptNumber, reference, transactionId, notes |
| **Process** | id, tenantId, unitId, adminId, contractId, status (IN_PROGRESS/IN_EVALUATION/WAITING_FOR_FEEDBACK/APPROVED/DISAPPROVED), currentStep, payload (JSON), createdAt, updatedAt |
| **Notification** | id, tenantId, adminId, senderRole (TENANT/ADMIN/SYSTEM), senderUserId, type (GENERAL/APPROVAL/REJECTION/PAYMENT_OVERDUE/REMINDER), title, body, link, readAt, metadata (JSON) |
| **Reference** | id, tenantId, name, phone, relationship |
| **AdditionalResident** | (included in Contract relations) |

---

## Appendix B: Key File Reference Index

| File | Lines | Purpose |
|------|-------|---------|
| `src/proxy.ts` | 1-119 | Next.js middleware - env validation + route auth |
| `src/lib/auth.ts` | 1-138 | NextAuth v5 config - credentials provider, JWT callbacks |
| `src/lib/prisma.ts` | 1-36 | PrismaClient singleton (Postgres + libSQL support) |
| `src/lib/email.ts` | 1-32 | Email target resolver (test/prod routing) |
| `src/lib/payments/monthly.ts` | 1-68 | Generate monthly payments for active contracts |
| `src/lib/payments/alerts.ts` | 1-167 | Payment overdue detection + notification creation |
| `src/actions/auth/login.ts` | 1-89 | authenticate() - credentials login |
| `src/actions/auth/register.ts` | 1-92 | registerUser() - self-registration |
| `src/actions/auth/verify-email.ts` | 1-76 | Email verification (code send + verify) |
| `src/actions/auth/reset-password.ts` | 1-362 | Password reset (request + validate + reset) |
| `src/actions/registro-con-token/index.ts` | 1-153 | Token-based registration (validate + complete) |
| `src/actions/user/index.ts` | 1-197 | User profile queries + mutations |
| `src/actions/user/types.ts` | 1-165 | UserForRedux type + selection objects |
| `src/actions/nuevo-proceso/index.ts` | 1-264 | Available units + reservation |
| `src/actions/confirmacion-de-inicio-de-proceso/index.ts` | 1-200 | Contract initialization + email sending |
| `src/actions/confirmacion-de-inicio-de-proceso/emailResend.ts` | 1-242 | EmailService class (registration/continue emails) |
| `src/actions/codeudor/index.ts` | 1-204 | Co-debtor confirmation flow |
| `src/actions/processes/index.ts` | 1-361 | Process CRUD + status-change notifications |
| `src/actions/notifications/index.ts` | 1-239 | Notification read/write (user + system) |
| `src/actions/favorites/index.ts` | 1-89 | Favorites toggle (per-tenant unit favorite list) |
| `src/actions/units/index.ts` | 1-43 | Admin unit listing |
| `src/actions/property/index.ts` | 1-391 | Property + Unit CRUD with admin auth |
| `src/actions/payments/index.ts` | 1-88 | Payment listing + confirmation |
| `src/actions/gestion-de-inquilinos/index.ts` | 1-345 | Tenant CRUD + stats |
| `src/actions/admin/index.ts` | 1-148 | Admin user creation |
| `src/redux/index.ts` | 1-84 | Redux store config + persistence |
| `src/redux/Provider.tsx` | 1-12 | Redux Provider wrapper |
| `src/redux/slices/auth.ts` | 1-54 | Auth state (login/register/reset states) |
| `src/redux/slices/user.ts` | 1-32 | User state (logged-in user + profile) |
| `src/redux/slices/home.ts` | 1-44 | Home state (units list, filters, search) |
| `src/redux/slices/process.ts` | 1-36 | Process state (multi-step form data) |
| `src/redux/slices/property.ts` | 1-15 | Property state (generic property data) |
| `src/hooks/useSession.ts` | 1-103 | Client-side session hook |
| `src/hooks/getSession.ts` | 1-28 | Server-side session + logout helpers |
| `src/app/api/cron/payments/route.ts` | 1-23 | Payment generation cron endpoint |
| `src/app/api/cron/alerts/route.ts` | 1-25 | Payment alerts cron endpoint |
| `src/utils/index.ts` | 1-9 | capitalize(), serializeDate() |
