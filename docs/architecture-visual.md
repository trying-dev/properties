# Architecture Visual — Properties

> Next.js 16 full-stack property management app. Server Actions as data-access layer, Redux for client state, NextAuth v5 for JWT-based role authorization.

---

## 1. System Architecture Diagram

```
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                             BROWSER                                      │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
 │  │ Redux Store  │  │ React Hooks  │  │ react-hook-  │  │ localStorage │ │
 │  │ (5 slices)   │  │ (useSession, │  │ form + Zod   │  │ (rehydrate)  │ │
 │  │              │  │  useAppRtr)  │  │              │  │              │ │
 │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
 └─────────┼─────────────────┼─────────────────┼─────────────────┼─────────┘
           │                 │                 │                 │
     ┌─────┴─────────────────┴─────────────────┴─────────────────┴─────┐
     │                      VERCEL EDGE                                │
     │  ┌───────────────────────────────────────────────────────────┐  │
     │  │  src/proxy.ts  (custom middleware)                        │  │
     │  │  • Validates env vars on cold start                       │  │
     │  │  • Redirects unauthenticated users from /dashboard,       │  │
     │  │    /process routes                                        │  │
     │  │  • Role-level route gating (SUPER_ADMIN → LIMITED)        │  │
     │  │  • matcher: all except api, _next/static, _next/image     │  │
     │  └───────────────────────────────────────────────────────────┘  │
     └─────┬───────────────────────────────────────────────────────────┘
           │
     ┌─────┴─────────────────────────────────────────────────────────────┐
     │                     NEXT.JS APP ROUTER (v16)                       │
     │                                                                    │
     │  ┌─────────────────────────┐   ┌─────────────────────────────┐    │
     │  │  Server Components      │   │  Client Components (RSC)     │    │
     │  │  • RootLayout (SC)      │   │  • DashboardLayout (`use     │    │
     │  │  • Landing page (SC +   │   │    client`)                  │    │
     │  │    unstable_cache)      │   │  • ProcessLayout (`use       │    │
     │  │  • /units/[id] (SC)     │   │    client`)                  │    │
     │  │  • Static pages (SC)    │   │  • All dashboard pages       │    │
     │  │                         │   │  • All process wizard pages  │    │
     │  └───────────┬─────────────┘   └──────────────┬──────────────┘    │
     │              │                                │                    │
     │  ┌───────────┴────────────────────────────────┴──────────────┐    │
     │  │                Server Actions (`'use server'`)             │    │
     │  │  auth/  │ admin/ │ property/ │ units/ │ payments/          │    │
     │  │  user/  │ process│ nuevo-proceso/  │ codeudor/            │    │
     │  │  notifications/ │ favorites/ │ gestion-de-inquilinos/     │    │
     │  │  registro-con-token/ │ confirmacion-de-inicio-de-proceso/ │    │
     │  │  messages/ (placeholder)                                   │    │
     │  │  Response: { success: boolean; data?: T; error?: string }  │    │
     │  └────────────────────────────┬───────────────────────────────┘    │
     │                               │                                    │
     │  ┌────────────────────────────┴───────────────────────────────┐    │
     │  │                  API Routes (Route Handlers)                │    │
     │  │  GET /api/cron/payments  → generateMonthlyPayments()       │    │
     │  │  GET /api/cron/alerts    → generatePaymentAlerts()         │    │
     │  │  Auth: Bearer <CRON_SECRET> header                          │    │
     │  └────────────────────────────────────────────────────────────┘    │
     └─────┬──────────────────────────────────────────────────────────────┘
           │
     ┌─────┴──────────────────────────────────────────────────────────────┐
     │                         DATA LAYER                                  │
     │  ┌─────────────────────────┐   ┌─────────────────────────────┐    │
     │  │  NextAuth v5 (auth.ts)  │   │  Prisma ORM (prisma.ts)     │    │
     │  │  • Credentials provider │   │  • Singleton + global cache │    │
     │  │  • JWT strategy (30d)   │   │  • LibSQL adapter OR        │    │
     │  │  • Role/AdminLevel in   │   │    native PostgreSQL        │    │
     │  │    JWT token            │   │  • Schema selection via     │    │
     │  │  • bcryptjs password    │   │    prisma.config.ts         │    │
     │  │    hashing              │   │  • Accelerate support       │    │
     │  └────────────┬────────────┘   └──────────────┬──────────────┘    │
     │               │                               │                    │
     │               └───────────────┬───────────────┘                    │
     │                               │                                    │
     │                    ┌──────────┴──────────┐                         │
     │                    │   SQLite (dev)       │                         │
     │                    │   PostgreSQL (prod)  │                         │
     │                    └─────────────────────┘                         │
     └────────────────────────────────────────────────────────────────────┘
           │
     ┌─────┴──────────────────────────────────────────────────────────────┐
     │                      EXTERNAL SERVICES                              │
     │  ┌─────────────────────────┐   ┌─────────────────────────────┐    │
     │  │  Resend (email)         │   │  Vercel Cron Jobs            │    │
     │  │  • Verification codes   │   │  • /api/cron/payments        │    │
     │  │  • Password reset       │   │  • /api/cron/alerts          │    │
     │  │  • Tenant invitations   │   │  (HTTP-triggered GET)        │    │
     │  │  • Co-debtor confirm.   │   │                              │    │
     │  │  • Test mode redirect   │   │                              │    │
     │  └─────────────────────────┘   └─────────────────────────────┘    │
     └────────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Route Map

### 2.1 Public Routes (No Auth)

| Route | Purpose | Auth | Layout | Type |
|-------|---------|------|--------|------|
| `/` | Landing page — property search + auth modals | No | RootLayout | Server Component (`unstable_cache`) |
| `/sobre-nosotros` | About us page | No | RootLayout | Server Component (static) |
| `/contacto` | Contact page | No | RootLayout | Server Component (static) |
| `/terminos` | Terms & conditions | No | RootLayout | Server Component (static) |
| `/privacidad` | Privacy policy | No | RootLayout | Server Component (static) |
| `/units/[id]` | Public unit detail view | No | RootLayout | Server Component |
| `/reset-password` | Password recovery form | No | RootLayout | Client Component |
| `/registro-con-token` | Tenant registration via email token | No | RootLayout | Client Component |
| `/codeudor/confirmar` | Co-debtor confirmation page | No | RootLayout | Client Component |

### 2.2 Protected Routes — Dashboard (Auth Required)

Protected by: `proxy.ts` redirect + `DashboardLayout` (`RequireAuth` wrapper)

| Route | Purpose | Auth | Roles Allowed | Layout | Type |
|-------|---------|------|---------------|--------|------|
| `/dashboard` | Dashboard hub (role-based redirect) | Yes | All | DashboardLayout | Client Component |
| `/dashboard/property/[id]` | Property detail in dashboard context | Yes | All | DashboardLayout | Client Component |
| `/dashboard/admin` | Admin landing / overview | Yes | SUPER_ADMIN, MANAGER, STANDARD, LIMITED | DashboardLayout | Client Component |
| `/dashboard/admin/units` | Units table — filter by status, city | Yes | SUPER_ADMIN, MANAGER, STANDARD | DashboardLayout | Client Component |
| `/dashboard/admin/units/[id]` | Single unit detail with contracts | Yes | SUPER_ADMIN, MANAGER, STANDARD | DashboardLayout | Client Component |
| `/dashboard/admin/properties` | Properties list / CRUD | Yes | STANDARD+ | DashboardLayout | Client Component |
| `/dashboard/admin/properties/[id]` | Single property detail with units | Yes | STANDARD+ | DashboardLayout | Client Component |
| `/dashboard/admin/payments` | Payments overview + confirm | Yes | SUPER_ADMIN, MANAGER, STANDARD | DashboardLayout | Client Component |
| `/dashboard/admin/applications` | Active rental applications list | Yes | SUPER_ADMIN, MANAGER, STANDARD | DashboardLayout | Client Component |
| `/dashboard/admin/applications/[id]` | Application detail + status update | Yes | SUPER_ADMIN, MANAGER, STANDARD | DashboardLayout | Client Component |
| `/dashboard/admin/notifications` | Admin notification inbox | Yes | SUPER_ADMIN, MANAGER, STANDARD | DashboardLayout | Client Component |
| `/dashboard/admin/nuevo-proceso` | Start new rental process (select property/unit) | Yes | SUPER_ADMIN, MANAGER, STANDARD | DashboardLayout | Client Component |
| `/dashboard/admin/nuevo-proceso/seleccion-de-usuario` | Select or create tenant for process | Yes | SUPER_ADMIN, MANAGER, STANDARD | DashboardLayout | Client Component |
| `/dashboard/admin/nuevo-proceso/confirmacion-de-inicio-de-proceso` | Review + confirm process initiation | Yes | SUPER_ADMIN, MANAGER, STANDARD | DashboardLayout | Client Component |
| `/dashboard/admin/gestion-de-inquilinos` | Tenant CRUD (list, create, edit, disable) | Yes | SUPER_ADMIN, MANAGER | DashboardLayout | Client Component |
| `/dashboard/admin/create-admin` | Create new admin user | Yes | SUPER_ADMIN | DashboardLayout | Client Component |
| `/dashboard/admin/administrators` | List administrators | Yes | SUPER_ADMIN | DashboardLayout | Client Component |
| `/dashboard/tenant` | Tenant dashboard overview | Yes | TENANT | DashboardLayout | Client Component |
| `/dashboard/tenant/units` | Available units — browse + apply | Yes | TENANT | DashboardLayout | Client Component |
| `/dashboard/tenant/processes` | My rental processes | Yes | TENANT | DashboardLayout | Client Component |
| `/dashboard/tenant/notifications` | My notifications | Yes | TENANT | DashboardLayout | Client Component |
| `/dashboard/tenant/favoritos` | Favorite units | Yes | TENANT | DashboardLayout | Client Component |
| `/dashboard/tenant/perfil` | Profile edit | Yes | TENANT | DashboardLayout | Client Component |
| `/dashboard/tenant/formulario-de-tenant` | Tenant application form | Yes | TENANT | DashboardLayout | Client Component |

### 2.3 Protected Routes — Process Wizard (Auth Required)

Protected by: `proxy.ts` redirect + `ProcessLayout` (`RequireAuth` wrapper)

| Route | Purpose | Auth | Roles Allowed | Layout | Type |
|-------|---------|------|---------------|--------|------|
| `/process` | Redirect to step 1 | Yes | TENANT | ProcessLayout | Server Component |
| `/process/profile` | Step 1: Select tenant profile | Yes | TENANT | ProcessLayout | Client Component |
| `/process/basicInformation` | Step 2: Basic personal info | Yes | TENANT | ProcessLayout | Client Component |
| `/process/complementInfo` | Step 3: Complementary info + docs | Yes | TENANT | ProcessLayout | Client Component |
| `/process/security` | Step 4: Security (guarantor / deposit) | Yes | TENANT | ProcessLayout | Client Component |

### 2.4 API Routes (Cron — Bearer Token Protected)

| Route | Purpose | Auth | Roles | Runtime |
|-------|---------|------|-------|---------|
| `GET /api/cron/payments` | Generate monthly payment records for active contracts | `Bearer <CRON_SECRET>` | — | `nodejs` |
| `GET /api/cron/alerts` | Detect overdue payments → mark overdue + send notifications | `Bearer <CRON_SECRET>` | — | `nodejs` |

---

## 3. Data Model ER Diagram

```
                            ┌──────────────────────────────────────────────────┐
                            │                    User                           │
                            │  id, email★, password, name, lastName            │
                            │  verificationCode, resetPasswordToken            │
                            │  phone, documentType, documentNumber★            │
                            │  gender, maritalStatus, profession, income       │
                            │  address, city, state, country, postalCode       │
                            │  disable, timezone, language, notifications      │
                            │  deletedAt, lastLoginAt, createdAt, updatedAt    │
                            └──────┬───────────────────┬───────────────────────┘
                                   │ 1:1               │ 1:1
                                   │ (Cascade)         │ (Cascade)
                    ┌──────────────┴──────┐   ┌────────┴──────────────────────┐
                    │       Admin         │   │           Tenant               │
                    │  id, userId★        │   │  id, userId★                   │
                    │  adminLevel (enum)  │   │  profile (enum)                │
                    │  createdById (self)  │   │  favoriteUnitIds (JSON)        │
                    └──┬───┬───┬────┬────┘   │  emergencyContact, income       │
                       │   │   │    │        │  registrationToken              │
           ┌───────────┘   │   │    │        └──┬──────┬──────┬──────┬────────┘
           │ (createdBy)   │   │    │           │      │      │      │
           │               │   │    │  ┌────────┘      │      │      │
  ┌────────┴────────┐      │   │    │  │ (references)  │      │      │
  │    Admin (self) │      │   │    │  │               │      │      │
  │   created[]     │      │   │    │  │      ┌────────┘      │      │
  └─────────────────┘      │   │    │  │      │ (contracts)   │      │
                           │   │    │  │      │               │      │
                ┌──────────┘   │    │  │ ┌────┴──────┐  ┌─────┴─────┐ ┌──┴──────┐
                │(assigned)    │    │  │ │ Reference │  │ Contract  │ │ Process │
                │              │    │  │ │ name      │  │           │ │         │
  ┌─────────────┴───────────┐  │    │  │ │ phone     │  │ (see below)│ │ tenantId│
  │        Property         │  │    │  │ │ relation  │  └─────┬─────┘ │ unitId  │
  │  name, street, number   │  │    │  │ └───────────┘        │       │ adminId │
  │  city, neighborhood     │  │    │  │                      │       │ status  │
  │  propertyType, floors   │  │    │  │                      │       │ payload │
  │  builtArea, age, parking │  │    │  │                      │       └─────────┘
  │  status, commonZones     │  │    │  │                      │
  └──────────┬──────────────┘  │    │  │                      │
             │ 1:N (Cascade)   │    │  │                      │
             │                 │    │  │                      │
  ┌──────────┴──────────────┐  │    │  │                      │
  │          Unit           │  │    │  │                      │
  │  unitNumber, floor      │  │    │  │                      │
  │  bedrooms, bathrooms    │  │    │  │                      │
  │  furnished, petFriendly │  │    │  │                      │
  │  baseRent, deposit      │  │    │  │                      │
  │  status (VACANT/...)    │  │    │  │                      │
  │  images (JSON array)    │  │    │  │                      │
  └──────────┬──────────────┘  │    │  │                      │
             │                 │    │  │                      │
             │ 1:N (Restrict)  │    │  │                      │
             │                 │    │  │                      │
             │    ┌────────────┘    │  │                      │
             │    │ (ContractAdmins)│  │                      │
             │    │                 │  │                      │
             └────┼─────────────────┘  │                      │
                  │                    │                      │
                  └────────────────────┴──────────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                 Contract                    │
                │  id, unitId, tenantId, adminId              │
                │  rent, deposit, securityDeposit             │
                │  lateFeePenalty, gracePeriodDays            │
                │  startDate, endDate                         │
                │  status (INITIATED → ACTIVE)                │
                │  priority, notes, terms                     │
                │  initiatedAt, reviewedAt, approvedAt        │
                │  signedAt, activatedAt, terminatedAt        │
                │  processDocuments (JSON string)             │
                └──┬───────────────┬───────────────┬──────────┘
                   │ 1:N (Cascade) │ 1:N (Cascade) │ M:N
                   │               │               │
       ┌───────────┴──────┐  ┌─────┴──────┐  ┌─────┴─────────────┐
       │  ContractDocument │  │  Payment   │  │ User (additional) │
       │  fileName         │  │  amount    │  │ via relation      │
       │  fileType         │  │  dueDate   │  │ AdditionalResid.  │
       │  filePath         │  │  paidDate  │  └───────────────────┘
       │  fileSize         │  │  paymentType│
       │  documentType     │  │  status    │
       └──────────────────┘  │  method    │
                             │  lateFee   │
                             └───────────┘

                ┌────────────────────────────────────┐
                │           Notification             │
                │  tenantId?  adminId?               │
                │  senderRole (TENANT/ADMIN/SYSTEM)  │
                │  senderUserId                      │
                │  type (GENERAL/APPROVAL/REJECTION  │
                │        PAYMENT_OVERDUE/REMINDER)   │
                │  title, body, link, metadata       │
                │  readAt                            │
                └──────┬──────────────────┬──────────┘
                       │ N:1 (Cascade)    │ N:1 (SetNull)
                       ▼                   ▼
                    Tenant              Admin
```

### Relationship Summary

| From | To | Cardinality | On Delete |
|------|----|-------------|-----------|
| User | Admin | 1:1 (`admin`/`adminId`) | Cascade |
| User | Tenant | 1:1 (`tenant`/`tenantId`) | Cascade |
| User | Contract | M:N (`additionalResidents`) | — |
| Admin | Admin | 1:N self-ref (`createdBy`/`created`) | SetNull |
| Admin | Property | M:N (`PropertyAdmins`) | — |
| Admin | Contract | M:N (`ContractAdmins`) | — |
| Admin | Process | 1:N (`ProcessAdmin`) | SetNull |
| Admin | Notification | 1:N | SetNull |
| Tenant | Contract | 1:N | Restrict |
| Tenant | Process | 1:N (`ProcessTenant`) | SetNull |
| Tenant | Notification | 1:N | Cascade |
| Tenant | Reference | 1:N | Cascade |
| Property | Unit | 1:N | Cascade |
| Unit | Contract | 1:N | Restrict |
| Unit | Process | 1:N (`ProcessUnit`) | SetNull |
| Contract | Process | 1:N (`ProcessContract`) | SetNull |
| Contract | Payment | 1:N | Cascade |
| Contract | ContractDocument | 1:N | Cascade |

---

## 4. Server Actions Module Map

| Module (src/actions/) | Primary Models | Secondary Models | External Services | Key Operations |
|------------------------|----------------|------------------|-------------------|----------------|
| **auth/login** | User, Admin | — | NextAuth `signIn()` | `authenticate()` |
| **auth/register** | User, Tenant | — | Resend (verification email) | `registerUser()` |
| **auth/verify-email** | User | — | — | Verify 6-digit code |
| **auth/reset-password** | User | — | Resend (reset token email) | Request reset, confirm reset |
| **user/** | User, Tenant, Admin | Contract, Unit, Property | — | `getUserAfterLogin()`, `getUserTenant()`, `updateUserBasicInfo()`, `updateTenantProfile()` |
| **admin/** | User, Admin | — | bcryptjs | `createAdmin()` — validated creation with transaction |
| **property/** | Property, Unit | Admin, Contract, Payment | — | CRUD: `createPropertyAction`, `updatePropertyAction`, `deletePropertyAction`, `createUnitAction`, `updateUnitAction`, `deleteUnitAction` |
| **units/** | Unit, Property | Contract, Tenant | — | `getAdminUnitsAction()` — list with filters (status, city, property) |
| **payments/** | Payment | Contract, Unit, Property, Tenant | — | `getAdminPaymentsAction()`, `confirmPaymentAction()`, `getPendingPaymentsCount()` |
| **processes/** | Process | Tenant, Unit, Admin, Contract | `actions/notifications` (sendSystem) | `createProcessAction`, `updateProcessAction`, `getProcessAction`, `getProcessDetailsAction`, `getTenantProcessesAction`, `getAdminProcessesAction`, `deleteTenantProcessAction` |
| **nuevo-proceso/** | Unit, Property | Admin, Contract, Payment, Tenant | — | `getAvailableUnitsAction`, `getUnitByIdAction`, `reserveUnitAction`, `getPropertiesWithAvailableUnitsAction` |
| **confirmacion-de-inicio-de-proceso/** | Contract, User, Tenant, Unit | Process, Admin | Resend (via EmailService), crypto (tokens) | `getProcessDetailsAction`, `initializeContractAction` — creates contract + sends registration/continue email |
| **registro-con-token/** | Tenant, User | — | NextAuth `signIn()`, bcryptjs | `validateRegistrationToken()`, `completeUserRegistration()` |
| **codeudor/** | Process (payload) | — | Resend (co-debtor confirmation) | `sendCoDebtorConfirmationEmailsAction()`, `confirmCoDebtorAction()` |
| **gestion-de-inquilinos/** | Tenant, User, Reference | Contract, Unit, Property, Payment | — | `getTenantsAction`, `createTenantAction`, `updateTenantAction`, `disableTenantAction`, `getTenantsStatsAction` |
| **notifications/** | Notification | Tenant, Admin | — | `getTenantNotificationsAction`, `getAdminNotificationsAction`, `markNotificationReadAction`, `sendNotificationAction`, `sendSystemNotificationAction` |
| **favorites/** | Tenant (favoriteUnitIds JSON) | Unit, Property | — | `getTenantFavoriteUnitIdsAction()`, `toggleTenantFavoriteUnitAction()`, `getTenantFavoriteUnitsAction()` |
| **messages/** | — | — | — | **Placeholder** — directory exists, no implementation |

---

## 5. Redux Store Slices

```
 ┌─────────────────────────────────────────────────────────────────┐
 │                      Redux Store                                 │
 │  Persisted to localStorage (key: "state")                       │
 │  Excluded from persistence: home.units, process.uploadedDocs    │
 ├─────────────────────────────────────────────────────────────────┤
 │                                                                  │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
 │  │   auth       │  │   user       │  │   property           │  │
 │  │ isAuth'd     │  │ UserForRedux │  │ Current detail view  │  │
 │  │ loginState   │  │ (nullable)   │  │ (object)             │  │
 │  │ registerState│  │              │  │                      │  │
 │  │ verifyState  │  │ from         │  │                      │  │
 │  │ modal open   │  │ getUserAfter │  │                      │  │
 │  │ modal tab    │  │ Login()      │  │                      │  │
 │  └──────────────┘  └──────────────┘  └──────────────────────┘  │
 │                                                                  │
 │  ┌──────────────┐  ┌──────────────────────────────────────────┐ │
 │  │   home       │  │   process (wizard state)                 │ │
 │  │ units[]      │  │ processId, tenantId, unitId              │ │
 │  │ showFilters  │  │ profile, step (1-4)                      │ │
 │  │ searchQuery  │  │ selectedSecurity, acceptedDeposit        │ │
 │  │ filters{}    │  │ basicInfo{} (name, email, phone...)      │ │
 │  │              │  │ uploadedDocs{}, securityFields{}          │ │
 │  └──────────────┘  └──────────────────────────────────────────┘ │
 └─────────────────────────────────────────────────────────────────┘
```

---

## 6. Auth Flow

```
 ┌──────────────────────────────────────────────────────────────────────┐
 │                           AUTH FLOW                                   │
 │                                                                       │
 │  LOGIN                    REGISTER                   TOKEN REGISTER   │
 │  ─────                    ────────                   ─────────────    │
 │  Form → authenticate()    Form → registerUser()     Token URL         │
 │    │                        │                         │                │
 │    ▼                        ▼                         ▼                │
 │  signIn('credentials')    User.create +             validateRegis-    │
 │    │                      Tenant.create              trationToken()   │
 │    ▼                        │                         │                │
 │  NextAuth authorize()     Resend.send(verifi-         ▼                │
 │    │                      cation code)             completeUser-      │
 │    ▼                        │                      Registration()     │
 │  bcrypt.compare()           ▼                        │                │
 │    │                      needsVerification          ▼                │
 │    ▼                        │                      bcrypt.hash()      │
 │  JWT callback               ▼                        │                │
 │    │                      verify-email Action        ▼                │
 │    ▼                        │                      signIn('creden-    │
 │  Session callback           ▼                      tials')            │
 │    │                      emailVerified = now         │                │
 │    ▼                        │                        ▼                │
 │  Redux dispatch            ▼                      JWT → session       │
 │  setUser() / setAuth()   can now login               │                │
 │                                                     ▼                │
 │                                               Redux dispatch          │
 │                                                                       │
 │  PROTECTION CHAIN:                                                    │
 │  ┌──────────┐    ┌──────────┐    ┌───────────────┐    ┌────────────┐ │
 │  │ proxy.ts │ →  │ NextAuth │ →  │ RequireAuth   │ →  │ Server     │ │
 │  │ matcher  │    │ callbacks│    │ component     │    │ Actions    │ │
 │  │ redirect │    │ auth'd() │    │ redirect if   │    │ auth()     │ │
 │  │ if no    │    │ checks   │    │ no session    │    │ check      │ │
 │  │ session  │    │ url      │    │               │    │            │ │
 │  └──────────┘    └──────────┘    └───────────────┘    └────────────┘ │
 └──────────────────────────────────────────────────────────────────────┘
```

---

## 7. Deployment Architecture (Vercel)

```
 ┌───────────────────────────────────────────────────────────────────────┐
 │                          VERCEL                                        │
 │                                                                        │
 │  ┌──────────────────────────────────────────────┐                     │
 │  │              Edge Network                     │                     │
 │  │  ┌────────────────────────────────────────┐  │                     │
 │  │  │  proxy.ts (middleware)                  │  │                     │
 │  │  │  • Runs on every matching request       │  │                     │
 │  │  │  • Env var validation (cold start)      │  │                     │
 │  │  │  • Auth gate: redirect /dashboard,      │  │                     │
 │  │  │    /process if no session               │  │                     │
 │  │  │  • Role route ACL (SUPER_ADMIN etc.)    │  │                     │
 │  │  └────────────────────────────────────────┘  │                     │
 │  └──────────────────────────────────────────────┘                     │
 │                                                                        │
 │  ┌──────────────────────┐    ┌──────────────────────────────────┐    │
 │  │  Serverless Functions │    │  Cron Jobs (Vercel Cron)         │    │
 │  │                       │    │                                  │    │
 │  │  • SSR pages          │    │  ┌────────────────────────────┐  │    │
 │  │  • Server Components  │    │  │ GET /api/cron/payments     │  │    │
 │  │  • Client Components  │    │  │ • Runs monthly (e.g.)      │  │    │
 │  │    (RSC payload)      │    │  │ • Generates payment rows   │  │    │
 │  │  • Server Actions     │    │  │   for active contracts     │  │    │
 │  │    (POST endpoints)   │    │  └────────────────────────────┘  │    │
 │  │  • API Route Handlers │    │  ┌────────────────────────────┐  │    │
 │  │                       │    │  │ GET /api/cron/alerts       │  │    │
 │  │  Runtime: nodejs      │    │  │ • Runs daily (e.g.)        │  │    │
 │  │                       │    │  │ • Marks payments overdue   │  │    │
 │  │                       │    │  │ • Creates notifications    │  │    │
 │  │                       │    │  └────────────────────────────┘  │    │
 │  └──────────────────────┘    └──────────────────────────────────┘    │
 │                                                                        │
 │  ┌──────────────────────────────────────────────────────────────────┐ │
 │  │                        Environment Variables                       │ │
 │  │  Required:  RESEND_API_KEY, FROM_EMAIL, NEXT_PUBLIC_APP_URL,      │ │
 │  │             NEXTAUTH_SECRET, DATABASE_URL                         │ │
 │  │  Optional:  CRON_SECRET, PRISMA_DATABASE_URL (Accelerate),        │ │
 │  │             USING_TESTING_EMAIL, RESEND_EMAIL_TEST                │ │
 │  └──────────────────────────────────────────────────────────────────┘ │
 │                                                                        │
 │  ┌──────────────────────────────────────────────────────────────────┐ │
 │  │                        Database                                    │ │
 │  │  Development: SQLite (libsql:// or file:)                          │ │
 │  │  Production:  PostgreSQL (postgres://)                             │ │
 │  │  Schema auto-selection via DATABASE_URL prefix                     │ │
 │  │  Prisma Accelerate optional for connection pooling                 │ │
 │  └──────────────────────────────────────────────────────────────────┘ │
 └───────────────────────────────────────────────────────────────────────┘
```

---

## 8. Dependency Graph

```
                    ┌──────────────────────────────────┐
                    │         next@16.0.10              │
                    │         react@19.2.3              │
                    │         react-dom@19.2.3          │
                    └──────────────┬───────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
    ┌─────┴─────┐          ┌──────┴──────┐          ┌──────┴──────┐
    │ NextAuth  │          │   Prisma    │          │    Redux    │
    │ v5 beta   │          │ ORM + LibSQL│          │  Toolkit    │
    │ JWT auth  │          │   adapter   │          │ + React-    │
    └─────┬─────┘          └──────┬──────┘          │  Redux      │
          │                       │                 └──────┬──────┘
    ┌─────┴─────┐          ┌──────┴──────┐                 │
    │  bcryptjs │          │ SQLite (dev)│           ┌─────┴─────┐
    │ password  │          │ PostgreSQL  │           │  @reduxjs │
    │  hashing  │          │   (prod)    │           │  /toolkit │
    └───────────┘          └─────────────┘           └───────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
    ┌─────┴─────┐          ┌──────┴──────┐          ┌──────┴──────┐
    │  Resend   │          │  Tailwind   │          │ react-hook- │
    │  Emails   │          │  CSS v4     │          │ form + Zod  │
    │  (prod)   │          │  + Sass     │          │ + resolvers │
    └───────────┘          └─────────────┘          └─────────────┘
                                   │
                          ┌────────┴────────┐
                          │   @ariakit/     │
                          │   react (UI)    │
                          │   lucide-react  │
                          │   date-fns      │
                          │   jsonwebtoken  │
                          └─────────────────┘
```

---

## 9. Key Architectural Patterns

```
 ┌────────────────────────────────────────────────────────────────────┐
 │ PATTERN 1: Server Actions as API                                    │
 │ • No REST/GraphQL layer                                             │
 │ • Client components call `import { xAction } from '+/actions/...'` │
 │ • React 19 `useActionState` for loading/error handling             │
 │ • Server-only code stays server-only (no bundle bloat)             │
 └────────────────────────────────────────────────────────────────────┘

 ┌────────────────────────────────────────────────────────────────────┐
 │ PATTERN 2: Dual State (Redux + local)                              │
 │ • Redux: auth flow, user data, wizard state, persisted             │
 │ • React local state: forms, modals, UI transients                  │
 │ • URL searchParams: search filters, active tabs                   │
 │ • localStorage: persistence + rehydration with excluded keys       │
 └────────────────────────────────────────────────────────────────────┘

 ┌────────────────────────────────────────────────────────────────────┐
 │ PATTERN 3: Multi-Layer Auth Gating                                 │
 │ 1. proxy.ts middleware → redirects unauthenticated                 │
 │ 2. NextAuth `authorized` callback → blocks /dashboard              │
 │ 3. RequireAuth component → client-side guard                       │
 │ 4. Server Action `auth()` call → verifies session before mutation  │
 └────────────────────────────────────────────────────────────────────┘

 ┌────────────────────────────────────────────────────────────────────┐
 │ PATTERN 4: Dynamic DB Provider                                     │
 │ • prisma.config.ts reads DATABASE_URL prefix                       │
 │ • libsql:// or file: → schema.sqlite.prisma + LibSQL adapter       │
 │ • postgres:// → schema.postgresql.prisma (native)                  │
 │ • Prisma Accelerate optional for production connection pooling     │
 └────────────────────────────────────────────────────────────────────┘

 ┌────────────────────────────────────────────────────────────────────┐
 │ PATTERN 5: Contract Lifecycle State Machine                        │
 │ Process Phase:         Contract Phase:       Terminal:             │
 │ INITIATED              DRAFT                 EXPIRED               │
 │   ↓                    PENDING               RENEWED               │
 │ UNDER_REVIEW           ACTIVE                TERMINATED            │
 │   ↓                                          CANCELLED             │
 │ DOCUMENTATION                                REJECTED              │
 │   ↓                                                                 │
 │ APPROVED → transitions to Contract Phase                           │
 └────────────────────────────────────────────────────────────────────┘
```

---

## 10. File Structure (src/)

```
src/
├── actions/                    ← Server Actions (business logic)
│   ├── admin/index.ts          → Admin CRUD
│   ├── auth/                   → login, register, verify-email, reset-password
│   ├── codeudor/index.ts       → Co-debtor management
│   ├── confirmacion-de-inicio-de-proceso/
│   │   ├── index.ts            → Contract initiation
│   │   └── emailResend.ts      → Resend email templates (EmailService class)
│   ├── favorites/index.ts      → Favorite units toggle
│   ├── gestion-de-inquilinos/  → Tenant CRUD
│   ├── messages/               ← Placeholder
│   ├── notifications/index.ts  → Notification send/read
│   ├── nuevo-proceso/index.ts  → Available units, reservation
│   ├── payments/index.ts       → Payment listing, confirmation
│   ├── processes/index.ts      → Process CRUD + lifecycle
│   ├── property/index.ts       → Property + Unit CRUD
│   ├── registro-con-token/     → Token-based tenant registration
│   ├── units/index.ts          → Admin unit listing
│   └── user/index.ts           → User profile, post-login data
│
├── app/                        ← Next.js App Router pages
│   ├── layout.tsx              → RootLayout (RSC, Geist fonts, ReduxProvider)
│   ├── page.tsx                → Landing (RSC + unstable_cache)
│   ├── globals.css             → Tailwind v4 imports
│   ├── error.tsx               → Global error boundary
│   ├── global-error.tsx        → Root error boundary
│   ├── not-found.tsx           → 404 page
│   ├── api/cron/               → Cron job route handlers
│   │   ├── payments/route.ts   → GET — generate monthly payments
│   │   └── alerts/route.ts     → GET — detect overdue + notify
│   ├── dashboard/              → Protected area
│   │   ├── layout.tsx          → RequireAuth wrapper (client)
│   │   ├── page.tsx            → Role-based redirect hub
│   │   ├── admin/              → Admin routes (see route table)
│   │   └── tenant/             → Tenant routes (see route table)
│   ├── process/                → Application wizard (protected)
│   │   ├── layout.tsx          → StepProgress + SummarySidebar (client)
│   │   ├── page.tsx            → Redirect to step 1 (RSC)
│   │   ├── profile/            → Step 1
│   │   ├── basicInformation/   → Step 2
│   │   ├── complementInfo/     → Step 3
│   │   └── security/           → Step 4
│   └── [public pages]/         → /units/[id], /reset-password, etc.
│
├── lib/                        ← Shared library code
│   ├── auth.ts                 → NextAuth v5 config + exports
│   ├── prisma.ts               → PrismaClient singleton (auto-adapter)
│   ├── email.ts                → resolveEmailTargets (test mode redirect)
│   └── payments/               → Cron job logic
│       ├── monthly.ts          → generateMonthlyPaymentsForActiveContracts()
│       └── alerts.ts           → generatePaymentAlerts()
│
├── proxy.ts                    ← Edge middleware (auth gate + role ACL)
│
├── redux/                      ← Client state management
│   ├── store.ts                → InitialState type + default state
│   ├── Provider.tsx            → Redux <Provider> + localStorage persistence
│   ├── index.ts                → Typed hooks (useDispatch, useSelector)
│   └── slices/                 → 5 slices: auth, user, property, home, process
│
├── components/                 ← Shared UI components
├── hooks/                      ← Custom hooks (useSession, useAppRouter)
├── types/                      ← TypeScript type extensions
├── utils/                      ← Utility functions
└── middleware.ts               ← Empty / legacy (proxy.ts is the active one)
```
