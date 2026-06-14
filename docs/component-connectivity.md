# Component Connectivity Map

> **App**: Next.js 16 property management platform (App Router with SSR/Client boundaries)
> **State**: Redux Toolkit (persisted to localStorage) + URL search params + server action state
> **Auth**: NextAuth v5 via `src/hooks/getSession.ts` / `useSession.ts`

---

## 1. Full Component Tree

```
RootLayout [Server]  (src/app/layout.tsx)
├── ReduxProvider [Client]  (src/redux/Provider.tsx) — wraps all children in <Provider store={store}>
│   │
│   ├── / (HomePage) [Server → Client]  (src/app/page.tsx)
│   │   ├── Header [Client]  (src/components/Header/index.tsx)
│   │   │   ├── AuthModal [Client]  (src/components/auth/AuthModal.tsx)
│   │   │   │   └── Modal [Client]  (src/components/Modal/index.tsx)
│   │   │   │       └── AuthFormsPanel [Client]  (src/components/auth/AuthFormsPanel.tsx)
│   │   │   │           ├── LoginForm [Client]  (src/components/auth/LoginForm.tsx)
│   │   │   │           └── RegisterForm [Client]  (src/components/auth/RegisterForm.tsx)
│   │   │   └── ResetPasswordModal [Client]  (src/components/auth/ResetPasswordModal.tsx)
│   │   │       └── Modal [Client]  (src/components/Modal/index.tsx)
│   │   ├── HomeClient [Client]  (src/app/_/HomeClient.tsx)
│   │   │   ├── SearchSection [Client]  (src/app/_/SearchSection.tsx)
│   │   │   └── ResultsSection [Client]  (src/app/_/ResultsSection.tsx)
│   │   └── Footer [Server]  (src/components/Footer/index.tsx)
│   │
│   ├── /sobre-nosotros (AboutPage) [Server]
│   │   ├── Header [Client]
│   │   └── Footer [Server]
│   │
│   ├── /contacto (ContactPage) [Server]
│   │   ├── Header [Client]
│   │   └── Footer [Server]
│   │
│   ├── /terminos (TermsPage) [Server]
│   │   ├── Header [Client]
│   │   └── Footer [Server]
│   │
│   ├── /privacidad (PrivacyPage) [Server]
│   │   ├── Header [Client]
│   │   └── Footer [Server]
│   │
│   ├── /reset-password (ResetPasswordPage) [Client]
│   │   └── Suspense
│   │       └── ResetPasswordContent [Client] (self-contained form)
│   │
│   ├── /registro-con-token (RegisterWithToken) [Client]
│   │   └── Suspense
│   │       └── RegisterWithTokenContent [Client] (self-contained form)
│   │
│   ├── /codeudor/confirmar (ConfirmCoDebtorPage) [Server]
│   │   └── (inline result display, no nested components)
│   │
│   ├── /units/[id] (UnitDetailPage) [Server]
│   │   ├── Header [Client]
│   │   ├── UnitHero [Client?]  (src/app/units/[id]/_/UnitHero.tsx)
│   │   ├── Gallery [Client?]  (src/app/units/[id]/_/gallery.tsx)
│   │   ├── UnitSummaryAside [Client?]  (src/app/units/[id]/_/UnitSummaryAside.tsx)
│   │   ├── UnitFeatures [Client?]  (src/app/units/[id]/_/UnitFeatures.tsx)
│   │   ├── PopularServices [Client?]  (src/app/units/[id]/_/PopularServices.tsx)
│   │   ├── HighlightsSection [Client?]  (src/app/units/[id]/_/HighlightsSection.tsx)
│   │   └── Footer [Server]
│   │
│   ├── DashboardLayout [Client]  (src/app/dashboard/layout.tsx)
│   │   ├── RequireAuth [Client]  (src/components/auth/RequireAuth.tsx)
│   │   │   └── ErrorBoundary [Client]  (src/components/ErrorBoundary.tsx)
│   │   │       └── ErrorFallback (on error) [Client]  (src/components/ErrorFallback.tsx)
│   │   │           └── (children — page content...)
│   │   │
│   │   ├── /dashboard (DashboardLoading) [Client]  — role-based redirect to /dashboard/admin or /tenant
│   │   │
│   │   ├── /dashboard/admin (AdminDashboard) [Client]
│   │   │   └── Header [Client]
│   │   │
│   │   ├── /dashboard/admin/properties (AdminPropertiesPage) [Client]
│   │   │   ├── Header [Client]
│   │   │   ├── CardProperty [Client]  (src/app/dashboard/fragments/CardProperty.tsx)
│   │   │   └── Modal [Client]
│   │   │       └── PropertyForm [Client]  (src/app/dashboard/admin/properties/_/PropertyForm.tsx)
│   │   │
│   │   ├── /dashboard/admin/properties/[id] (AdminPropertyPage) [Server]
│   │   │   ├── Header [Client]
│   │   │   ├── PropertyActions [Client]  (src/app/.../properties/[id]/_/PropertyActions.tsx)
│   │   │   └── PropertyUnits [Client]  (src/app/.../properties/[id]/_/PropertyUnits.tsx)
│   │   │
│   │   ├── /dashboard/admin/units (AdminUnitsPage) [Client]
│   │   │   └── Header [Client]
│   │   │
│   │   ├── /dashboard/admin/units/[id] (AdminUnitPage) [Server]
│   │   │   ├── Header [Client]
│   │   │   ├── UnitActions [Client]  (src/app/.../units/[id]/_/UnitActions.tsx)
│   │   │   └── ContractPayments [Client]  (src/app/.../units/[id]/_/ContractPayments.tsx)
│   │   │
│   │   ├── /dashboard/admin/nuevo-proceso (NuevoProceso) [Client]
│   │   │   └── PriceRangeSlider (inline client component, same file)
│   │   │
│   │   ├── /dashboard/admin/nuevo-proceso/seleccion-de-usuario (SeleccionDeUsuario) [Client]
│   │   │   └── CreateTenantForm [Client]  (src/app/.../nuevo-proceso/seleccion-de-usuario/CreateTenantForm.tsx)
│   │   │
│   │   ├── /dashboard/admin/nuevo-proceso/confirmacion-de-inicio-de-proceso (ConfirmacionDeInicioDeProceso) [Client]
│   │   │   └── (self-contained form, no nested shared components)
│   │   │
│   │   ├── /dashboard/admin/applications (AdminApplicationsPage) [Client]
│   │   │   └── Header [Client]
│   │   │
│   │   ├── /dashboard/admin/applications/[id] (AdminApplicationDetailPage) [Client]
│   │   │   └── Header [Client]
│   │   │
│   │   ├── /dashboard/admin/payments (AdminPaymentsPage) [Client]
│   │   │   └── Header [Client]
│   │   │
│   │   ├── /dashboard/admin/notifications (AdminNotificationsPage) [Client]
│   │   │   ├── Header [Client]
│   │   │   └── Footer [Server]
│   │   │
│   │   ├── /dashboard/admin/gestion-de-inquilinos (TenantsManagement) [Client]
│   │   │   └── CreateTenantForm (inline client component, same file)
│   │   │
│   │   ├── /dashboard/admin/create-admin (AdminCreationForm) [Client]
│   │   │   └── (self-contained form with internal sub-components: FormField, Input, Select, FormSection)
│   │   │
│   │   ├── /dashboard/admin/administrators (AdminAdministratorsPage) [Client]
│   │   │   ├── Header [Client]
│   │   │   └── CardAdmin [Client]  (src/app/dashboard/fragments/CardAdmin.tsx)
│   │   │
│   │   ├── /dashboard/tenant (TenantDashboard) [Client]
│   │   │   ├── Header [Client]
│   │   │   └── Footer [Server]
│   │   │
│   │   ├── /dashboard/tenant/units (TenantUnitsPage) [Client]
│   │   │   ├── Header [Client]
│   │   │   └── Footer [Server]
│   │   │
│   │   ├── /dashboard/tenant/processes (TenantProcessesPage) [Client]
│   │   │   ├── Header [Client]
│   │   │   ├── CardProcess [Client]  (src/app/dashboard/tenant/processes/_/CardProcess.tsx)
│   │   │   ├── ProcessReviewModal [Client]  (src/app/.../processes/_/ProcessReviewModal.tsx)
│   │   │   └── Footer [Server]
│   │   │
│   │   ├── /dashboard/tenant/favoritos (TenantFavoritesPage) [Client]
│   │   │   ├── Header [Client]
│   │   │   ├── PropertyCard [Client]  (src/app/_/PropertyCard.tsx)
│   │   │   └── Footer [Server]
│   │   │
│   │   ├── /dashboard/tenant/perfil (TenantProfilePage) [Client]
│   │   │   ├── Header [Client]
│   │   │   ├── Modal [Client]
│   │   │   │   └── TenantCompleteForm [Client]  (src/app/.../formulario-de-tenant/TenantForm.tsx)
│   │   │   └── Footer [Server]
│   │   │
│   │   ├── /dashboard/tenant/formulario-de-tenant (TenantCompleteFormPage) [Client]
│   │   │   └── TenantCompleteForm [Client]  (same dir: ./TenantForm)
│   │   │
│   │   └── /dashboard/tenant/notifications (TenantNotificationsPage) [Client]
│   │       ├── Header [Client]
│   │       └── Footer [Server]
│   │
│   └── ApplicationLayout (process/*) [Client]  (src/app/process/layout.tsx)
│       ├── RequireAuth [Client]
│       │   └── Header [Client]
│       │       └── StepProgress [Client]  (src/app/process/_/StepProgress.tsx)
│       │       └── SummarySidebar [Client]  (src/app/process/_/SummarySidebar.tsx)
│       │       └── ErrorBoundary [Client]
│       │           └── (children — step page)
│       │           └── Footer [Server]
│       │
│       ├── /process → redirects to /process/profile
│       ├── /process/profile (ProfileStepPage) [Client]
│       │   └── Profile [Client]  (src/app/process/profile/_/Profile.tsx)
│       ├── /process/basicInformation (BasicInformationPage) [Client]
│       │   └── BasicInformation [Client]  (src/app/process/basicInformation/_/BasicInformation.tsx)
│       ├── /process/complementInfo (ComplementInfoPage) [Client]
│       │   └── StepComplementInfo [Client]  (src/app/process/complementInfo/_/StepComplementInfo.tsx)
│       └── /process/security (SecurityStepPage) [Client]
│           └── StepSecurity [Client]  (src/app/process/security/_/StepSecurity.tsx)
```

---

## 2. Page-to-Component Matrix

| Route Path | Header | Footer | RequireAuth | ErrorBoundary | Modal | AuthForms Panel | Login Form | Register Form | ResetPwd Modal | Home Client | Property Card | Tenant CompleteForm | StepProgress / SummarySidebar | ConfirmDelete Button |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` (home) | ✓ | ✓ |   |   | (*via Header*) | (*via Header*) | (*via Header*) | (*via Header*) | (*via Header*) | ✓ |   |   |   |   |
| `/sobre-nosotros` | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |   |   |
| `/contacto` | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |   |   |
| `/terminos` | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |   |   |
| `/privacidad` | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |   |   |
| `/reset-password` |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| `/registro-con-token` |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| `/codeudor/confirmar` |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| `/units/[id]` | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |   |   |
| `/dashboard` | *(redirect)* |   | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin` | ✓ |   | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/properties` | ✓ |   | ✓ | ✓ | ✓ |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/properties/[id]` | ✓ | ✓ | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/units` | ✓ |   | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/units/[id]` | ✓ |   | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/nuevo-proceso` |   |   | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/nuevo-proceso/seleccion-de-usuario` |   |   | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/nuevo-proceso/confirmacion-de-inicio-de-proceso` |   |   | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/applications` | ✓ |   | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/applications/[id]` | ✓ |   | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/payments` | ✓ |   | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/notifications` | ✓ | ✓ | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/gestion-de-inquilinos` |   |   | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/create-admin` |   |   | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/admin/administrators` | ✓ |   | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/tenant` | ✓ | ✓ | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/tenant/units` | ✓ | ✓ | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/dashboard/tenant/processes` | ✓ | ✓ | ✓ | ✓ |   |   |   |   |   |   |   |   |   | ✓ (*via CardProcess*) |
| `/dashboard/tenant/favoritos` | ✓ | ✓ | ✓ | ✓ |   |   |   |   |   |   | ✓ |   |   |   |
| `/dashboard/tenant/perfil` | ✓ | ✓ | ✓ | ✓ | ✓ |   |   |   |   |   |   | ✓ (*in modal*) |   |   |
| `/dashboard/tenant/formulario-de-tenant` |   |   | ✓ | ✓ |   |   |   |   |   |   |   | ✓ |   |   |
| `/dashboard/tenant/notifications` | ✓ | ✓ | ✓ | ✓ |   |   |   |   |   |   |   |   |   |   |
| `/process/profile` | ✓ | ✓ | ✓ | ✓ |   |   |   |   |   |   |   |   | ✓ |   |
| `/process/basicInformation` | ✓ | ✓ | ✓ | ✓ |   |   |   |   |   |   |   |   | ✓ |   |
| `/process/complementInfo` | ✓ | ✓ | ✓ | ✓ |   |   |   |   |   |   |   |   | ✓ |   |
| `/process/security` | ✓ | ✓ | ✓ | ✓ |   |   |   |   |   |   |   |   | ✓ |   |

---

## 3. Component Dependency Graph

### Shared Components (`src/components/`)

#### `Header` (`src/components/Header/index.tsx`) — **Client**
- **Hooks**: `useSession()`, `useDispatch()`, `useSelector()`, `useRouter()`, `useRef`, `useState`, `useEffect`
- **Redux reads**: `state.auth.isAuthenticated`, `state.user`
- **Redux writes**: `setIsAuthenticated`, `setAuthModalOpen`, `setAuthVerificationExpires`, `setUser(null)`
- **Server actions**: `logout()` from `+/hooks/getSession`
- **Child components**: `AuthModal`, `ResetPasswordModal`
- **Props**: _none_

#### `Footer` (`src/components/Footer/index.tsx`) — **Server** (no 'use client')
- **Hooks**: _none_
- **Redux**: _none_
- **Server actions**: _none_
- **Child components**: _none_ (just `<Link>` elements)
- **Props**: _none_

#### `Modal` (`src/components/Modal/index.tsx`) — **Client**
- **Hooks**: `useState`, `useEffect`
- **Redux**: _none_
- **Server actions**: _none_
- **Child components**: `{children}` (any)
- **Props**: `{ isOpen: boolean, onClose: () => void, children: ReactNode, ariaLabel?: string, disableClose?: boolean, className?: string }`

#### `ErrorBoundary` (`src/components/ErrorBoundary.tsx`) — **Client** (class component)
- **Hooks**: _not applicable (class)_
- **Redux**: _none_
- **Server actions**: _none_ — calls `classifyError()` and `logError()` from `+/lib/error-logger`
- **Child components**: `ErrorFallback` (on error), otherwise `{children}`
- **Props**: `{ children: ReactNode, fallback?: ReactNode, onError?: (error, info) => void, resetKeys?: unknown[] }`

#### `ErrorFallback` (`src/components/ErrorFallback.tsx`) — **Client**
- **Hooks**: _none (stateless display)_
- **Redux**: _none_
- **Server actions**: _none_
- **Child components**: _none_ (just `<Link>` and inline buttons)
- **Props**: `{ errorType?: ErrorType, message?: string, onReset?: () => void }`

#### `ConfirmDeleteButton` (`src/components/ConfirmDeleteButton.tsx`) — **Client**
- **Hooks**: _none_
- **Redux**: _none_
- **Server actions**: _none_
- **Child components**: _none_
- **Props**: `{ isConfirming: boolean, onConfirm: () => void, onCancel: () => void, onStart: () => void, stopPropagation?: boolean }`

### Auth Components (`src/components/auth/`)

#### `RequireAuth` (`src/components/auth/RequireAuth.tsx`) — **Client**
- **Hooks**: `useSession()`, `useSelector()`, `useRouter()`, `useEffect`
- **Redux reads**: `state.auth.isAuthenticated`
- **Redux writes**: _none_
- **Server actions**: _none_
- **Child components**: `{children}` (pass-through or null or spinner)
- **Props**: `{ children: ReactNode }`

#### `AuthModal` (`src/components/auth/AuthModal.tsx`) — **Client**
- **Hooks**: `useDispatch()`, `useSelector()`, `useEffect`
- **Redux reads**: `state.auth.authModalOpen`, `state.auth.authModalTab`, `state.auth.codeVerificationState`
- **Redux writes**: `setAuthModalOpen`, `setLoginState`, `setRegisterState`, `setCodeVerificationState`
- **Server actions**: _none_
- **Child components**: `Modal` → `AuthFormsPanel`
- **Props**: _none_

#### `AuthFormsPanel` (`src/components/auth/AuthFormsPanel.tsx`) — **Client**
- **Hooks**: `useDispatch()`, `useSelector()`, `usePathname()`, `useRouter()`, `useSearchParams()`, `useMemo`
- **Redux reads**: `state.auth.authModalTab`
- **Redux writes**: `setAuthModalOpen`
- **Server actions**: _none_
- **Child components**: `LoginForm`, `RegisterForm` (conditional on tab)
- **Props**: _none_

#### `LoginForm` (`src/components/auth/LoginForm.tsx`) — **Client**
- **Hooks**: `useActionState(authenticate)`, `useDispatch()`, `useRouter()`, `useState`, `useEffect`, `startTransition`
- **Redux writes**: `setAuthVerificationExpires`, `setLoginState`, `setIsAuthenticated`, `setUser`, `setAuthModalOpen`, `setResetPasswordModalOpen`
- **Server actions**: `authenticate()` from `+/actions/auth/login`, `getUserAfterLogin()` from `+/actions/user`
- **Child components**: _none_ (inline form)
- **Props**: `{ className?: string }`

#### `RegisterForm` (`src/components/auth/RegisterForm.tsx`) — **Client**
- **Hooks**: `useActionState(registerUser)`, `useDispatch()`, `useSelector()`, `useRouter()`, `useState`, `useEffect`, `useMemo`, `useTransition`, `startTransition`
- **Redux writes**: `setAuthVerificationExpires`, `setCodeVerificationState`, `setIsAuthenticated`, `setRegisterState`
- **Redux reads**: `state.auth.verificationExpiresAt`
- **Server actions**: `registerUser()` from `+/actions/auth/register`, `authenticate()` from `+/actions/auth/login`, `resendVerificationCode()`, `verifyEmailCode()` from `+/actions/auth/verify-email`
- **Child components**: _none_ (inline form with 3-phase rendering)
- **Props**: `{ className?: string }`

#### `ResetPasswordModal` (`src/components/auth/ResetPasswordModal.tsx`) — **Client**
- **Hooks**: `useDispatch()`, `useSelector()`, `useState`, `useEffect`
- **Redux reads**: `state.auth.resetPasswordModalOpen`
- **Redux writes**: `setResetPasswordModalOpen`
- **Server actions**: `sendResetPasswordEmail()` from `+/actions/auth/reset-password`
- **Child components**: `Modal`
- **Props**: _none_

#### `SuccessAnimation` (`src/components/auth/SuccessAnimation.tsx`) — **Client**
- **Hooks**: _none_ (stateless display)
- **Redux**: _none_
- **Server actions**: _none_
- **Child components**: _none_
- **Props**: _none_

#### `AuthInfoPanel` (`src/components/auth/AuthInfoPanel.tsx`) — **Client**
- **Hooks**: _none_ (stateless display with Image)
- **Redux**: _none_
- **Server actions**: _none_
- **Child components**: `Image` (next/image)
- **Props**: _none_

#### `users.ts` — data file (not a component)
- Exports `demoUsers` array of dummy admin/tenant credentials

#### `types.ts` — type definitions (not a component)
- `AuthActionState`, `authInitialState`

---

## 4. State Flow Diagram

### Redux Slice Overview

The Redux store has 5 slices, persisted to `localStorage` under key `"state"`:

```
store.getState() = {
  auth: {
    isAuthenticated: boolean,
    loginState: 'idle'|'start'|'loading'|'success',
    registerState: 'idle'|'start'|'loading'|'success',
    codeVerificationState: 'idle'|'start'|'loading'|'success',
    resetPasswordModalOpen: boolean,
    authModalOpen: boolean,
    authModalTab: 'login'|'register',
    verificationExpiresAt: number|null
  },
  user: UserForRedux|null,
  property: Record<string, any>,
  home: {
    units: HomeUnit[],
    showFilters: boolean,
    searchQuery: string,
    filters: { priceMax, bedrooms, city }
  },
  process: {
    processId: string|null,
    tenantId: string|null,
    unitId: string|null,
    profile: string,
    step: number,
    selectedSecurity: string,
    acceptedDeposit: boolean,
    basicInfo: { name, lastName, email, phone, birthDate, birthPlace, documentType, documentNumber, gender, maritalStatus, profession, monthlyIncome },
    uploadedDocs: Record<string, FileList|File[]|undefined>,
    securityFields: Record<string, SecurityFieldValue>
  }
}
```

### Which Pages Dispatch Redux Actions

| Page | Slice | Actions Dispatched |
|---|---|---|
| `HomePage → HomeClient` | `home` | `setUnits(initialUnits)` |
| `LoginForm` (in Header/AuthModal) | `auth`, `user` | `setLoginState('loading')`, `setIsAuthenticated(true)`, `setUser(user)`, `setAuthModalOpen({open:false})`, `setAuthVerificationExpires(null)` |
| `RegisterForm` (in Header/AuthModal) | `auth` | `setRegisterState('loading')`, `setRegisterState('success')`, `setCodeVerificationState('start')`, `setAuthVerificationExpires(ts)`, `setCodeVerificationState('loading')`, `setIsAuthenticated(true)` |
| `ResetPasswordModal` (in Header) | `auth` | `setResetPasswordModalOpen(false)` |
| `Header` (global) | `auth`, `user` | `setAuthModalOpen({open,tab})`, `setIsAuthenticated(false)`, `setUser(null)`, `setAuthVerificationExpires(null)` |
| `TenantProcessesPage` | `process` | `setProcessState({ processId, tenantId, unitId, step, profile, basicInfo })` |
| `Profile (process)` | `process` | `setProcessState({ selectedSecurity, acceptedDeposit })` |
| `BasicInformation (process)` | `process` | `updateBasicInfo(partial)` |
| `StepComplementInfo (process)` | `process` | `setUploadedDocs(docs)`, `setProcessState({...})` |
| `SecurityStepPage (process)` | `process` | `setSecurityFields(fields)`, `setUploadedDocs(docs)`, `setProcessState({...})` |
| `ApplicationLayout` | `process` | `setProcessState({ step })` (from route→step mapping) |

### Which Components Consume Redux State

| Component | Slices Read |
|---|---|
| `Header` | `auth.isAuthenticated`, `user.*` |
| `RequireAuth` | `auth.isAuthenticated` |
| `AuthModal` | `auth.authModalOpen`, `auth.authModalTab`, `auth.codeVerificationState` |
| `AuthFormsPanel` | `auth.authModalTab` |
| `RegisterForm` | `auth.verificationExpiresAt` |
| `ResetPasswordModal` | `auth.resetPasswordModalOpen` |
| `HomeClient` | writes to `home.units` |
| `SearchSection` / `ResultsSection` | likely reads `home.units`, `home.filters` |
| `SecurityStepPage` | `process.*` (entire process state) |
| `Profile`, `BasicInformation`, `StepComplementInfo` | `process.*` |
| `StepProgress` / `SummarySidebar` | `process.step`, `process.profile` |

### Server Actions Called Directly

| Server Action | Called From | Purpose |
|---|---|---|
| `authenticate()` | `LoginForm`, `RegisterForm` | Login / post-verification login |
| `registerUser()` | `RegisterForm` | Create new account |
| `verifyEmailCode()` | `RegisterForm` | Confirm email verification code |
| `resendVerificationCode()` | `RegisterForm` | Resend verification code |
| `sendResetPasswordEmail()` | `ResetPasswordModal` | Initiate password reset |
| `validateResetToken()` | `/reset-password` page | Validate token on mount |
| `resetPassword()` | `/reset-password` page | Submit new password |
| `validateRegistrationToken()` + `completeUserRegistration()` | `/registro-con-token` page | Token-based registration |
| `confirmCoDebtorAction()` | `/codeudor/confirmar` page | Co-debtor confirmation |
| `getAvailableUnitsForHome()` / `getUnitByIdAction()` | `/` page, `/units/[id]` page | Unit data fetching |
| `getProperties()` / `getPropertyWithUnits()` | Admin property pages | Property CRUD |
| `getAdminUnitsAction()` | Admin units page | Unit listing with filters |
| `getProcessDetailsAction()` / `getAdminProcessesAction()` | Admin applications page | Process/application listing |
| `getTenantProcessesAction()` / `deleteTenantProcessAction()` / `getProcessAction()` | `TenantProcessesPage` | Tenant process management |
| `updateProcessAction()` | `SecurityStepPage` | Final submission of process |
| `getUserTenant()` / `getUserAfterLogin()` | Multiple pages/forms | User data |
| `getAdminPaymentsAction()` / `confirmPaymentAction()` | Admin payments page | Payment management |
| `getAdminNotificationsAction()` / `markNotificationReadAction()` / `sendNotificationAction()` | Admin notifications page | Notification CRUD |
| `getTenantNotificationsAction()` | Tenant notifications page | Notification reading |
| `getTenantFavoriteUnitIdsAction()` / `getTenantFavoriteUnitsAction()` / `toggleTenantFavoriteUnitAction()` | Tenant favorites page | Favorites management |
| `createAdmin()` | `/dashboard/admin/create-admin` page | Admin creation |
| `logout()` from `getSession.ts` | `Header` | Sign out |

### Form Data Flow

```
User Input → Component State (useState)
  → Redux Dispatch (for process forms, auth state)
  → Server Action Call (FormData or typed params)
    → Database (Prisma)
    → Server Action returns success/error
  → Component updates local state / Redux state / navigates
```

**Process Form Flow** (multi-step wizard):
```
1. Profile → dispatch(setProcessState({profile, ...}))
2. BasicInfo → dispatch(updateBasicInfo({...}))
3. ComplementInfo → dispatch(setUploadedDocs({...}))
4. Security → dispatch(setSecurityFields({...}))
   → updateProcessAction(processId, currentStep:4, payloadPatch, status:'IN_EVALUATION')
   → redirect /dashboard/tenant
```

**Auth Flow**:
```
Login:
  Header click → dispatch(setAuthModalOpen({open:true, tab:'login'}))
  → AuthModal opens → AuthFormsPanel renders LoginForm
  → User fills form → formAction(authenticate)
  → on success: dispatch(setIsAuthenticated(true)), getUserAfterLogin() → dispatch(setUser(user))
  → router.push('/dashboard')

Register:
  Header click → dispatch(setAuthModalOpen({open:true, tab:'register'}))
  → AuthModal opens → AuthFormsPanel renders RegisterForm
  → User fills form → formAction(registerUser)
  → If needsVerification: show code input → verifyEmailCode() → authenticate()
  → router.push('/dashboard')
```

---

## 5. Layout Chain

```
RootLayout (src/app/layout.tsx) [Server]
└── ReduxProvider (src/redux/Provider.tsx) [Client]
    └── {children}

For public pages:
  RootLayout → ReduxProvider → Page
  Pages: /, /sobre-nosotros, /contacto, /terminos, /privacidad,
         /reset-password, /registro-con-token, /codeudor/confirmar, /units/[id]

For dashboard routes:
  RootLayout → ReduxProvider → DashboardLayout [Client]
    ├── RequireAuth [Client]
    │   └── ErrorBoundary [Client]
    │       └── Page
  Pages: /dashboard, /dashboard/admin, /dashboard/tenant, and all sub-routes

For process routes:
  RootLayout → ReduxProvider → ApplicationLayout [Client]
    ├── RequireAuth [Client]
    │   ├── Header [Client]
    │   ├── StepProgress [Client]
    │   ├── SummarySidebar [Client]
    │   └── ErrorBoundary [Client]
    │       └── Page (Profile | BasicInformation | ComplementInfo | Security)
    │   └── Footer [Server]
  Pages: /process/profile, /process/basicInformation, /process/complementInfo, /process/security

Note: DashboardLayout renders NO Header/Footer — each dashboard page includes Header/Footer independently.
      ApplicationLayout renders Header/Footer once for ALL process/* pages.
```

### Client vs Server Boundary Summary

| Component / File | Type |
|---|---|
| `RootLayout` (`src/app/layout.tsx`) | Server |
| `ReduxProvider` (`src/redux/Provider.tsx`) | Client |
| `DashboardLayout` (`src/app/dashboard/layout.tsx`) | Client |
| `ApplicationLayout` (`src/app/process/layout.tsx`) | Client |
| `Footer` (`src/components/Footer/index.tsx`) | Server |
| `Header` (`src/components/Header/index.tsx`) | Client |
| `Modal` (`src/components/Modal/index.tsx`) | Client |
| `ErrorBoundary` (`src/components/ErrorBoundary.tsx`) | Client |
| `ErrorFallback` (`src/components/ErrorFallback.tsx`) | Client |
| `RequireAuth` (`src/components/auth/RequireAuth.tsx`) | Client |
| `AuthModal` (`src/components/auth/AuthModal.tsx`) | Client |
| `AuthFormsPanel` (`src/components/auth/AuthFormsPanel.tsx`) | Client |
| `LoginForm` (`src/components/auth/LoginForm.tsx`) | Client |
| `RegisterForm` (`src/components/auth/RegisterForm.tsx`) | Client |
| `ResetPasswordModal` (`src/components/auth/ResetPasswordModal.tsx`) | Client |
| `SuccessAnimation` (`src/components/auth/SuccessAnimation.tsx`) | Client |
| `AuthInfoPanel` (`src/components/auth/AuthInfoPanel.tsx`) | Client |
| `ConfirmDeleteButton` (`src/components/ConfirmDeleteButton.tsx`) | Client |
| Pages under `/dashboard/` | All Client (`'use client'`) |
| Pages under `/process/` | All Client (`'use client'`) |
| `/`, `/sobre-nosotros`, `/contacto`, `/terminos`, `/privacidad` | Server (async components) |
| `/reset-password`, `/registro-con-token` | Client |
| `/units/[id]` | Server (async) |
| `/codeudor/confirmar` (page.tsx) | Server (`'use server'`) |
