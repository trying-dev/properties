# Componentes - Properties

## Resumen

El sistema usa React 19 con Next.js App Router. Los componentes se dividen en Server Components (renderizados en el servidor) y Client Components (interactivos, con estado).

---

## Jerarquia de Componentes

```
RootLayout (Server)
├── ReduxProvider (Client)
│   ├── Header (Client)
│   │   ├── AuthModal (Client)
│   │   │   ├── Modal (Client)
│   │   │   │   └── AuthFormsPanel (Client)
│   │   │   │       ├── LoginForm (Client)
│   │   │   │       ├── RegisterForm (Client)
│   │   │   │       └── AuthInfoPanel (Client)
│   │   │   └── SuccessAnimation (Client)
│   │   └── ResetPasswordModal (Client)
│   │       └── Modal (Client)
│   ├── Page Content (varia por ruta)
│   └── Footer (Server)
│
├── DashboardLayout (Client)
│   └── RequireAuth (Client)
│       └── [Dashboard Pages] (Client/Server)
│
└── ProcessLayout (Client)
    └── RequireAuth (Client)
        ├── Header (Client)
        ├── StepProgress (Client)
        ├── SummarySidebar (Client)
        ├── [Process Step Pages] (Client)
        └── Footer (Server)
```

---

## Componentes Compartidos (`src/components/`)

### Header

**Archivo**: `src/components/Header/index.tsx`  
**Tipo**: Client Component  
**Props**: Ninguna (autocontenido)

**Responsabilidad**: Barra de navegacion principal con branding, links y controles de autenticacion.

**Estado que maneja**:
- Lee `isAuthenticated` y `user` de Redux
- Usa `useSession()` para estado de sesion
- Muestra `AuthModal` si no autenticado
- Muestra avatar + dropdown con links al dashboard si autenticado
- El dropdown cambia segun `role` (`admin` o `tenant`)

**Sub-componentes**:
- `AuthModal`
- `ResetPasswordModal`

---

### Footer

**Archivo**: `src/components/Footer/index.tsx`  
**Tipo**: Server Component  
**Props**: Ninguna

**Responsabilidad**: Footer estatico con secciones de explorar, legal (terminos, privacidad) y contacto.

---

### Modal

**Archivo**: `src/components/Modal/index.tsx`  
**Tipo**: Client Component

**Props**:
```typescript
{
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  ariaLabel?: string
  disableClose?: boolean
  className?: string
}
```

**Responsabilidad**: Modal reutilizable con:
- Overlay con click para cerrar
- Animaciones CSS de entrada/salida
- Soporte de accesibilidad (`ariaLabel`)
- Opcion de deshabilitar cierre (`disableClose`, usado durante verificacion de codigo)

---

### ConfirmDeleteButton

**Archivo**: `src/components/ConfirmDeleteButton.tsx`  
**Tipo**: Client Component

**Props**:
```typescript
{
  isConfirming: boolean
  onConfirm: () => void
  onCancel: () => void
  onStart: () => void
  stopPropagation?: boolean
}
```

**Responsabilidad**: Boton de eliminacion con confirmacion en 3 estados:
1. Normal: Boton de eliminar
2. Confirmando: "Estas seguro?" con botones Si/No
3. Confirmado: Estado de carga/deshabilitado

**Uso**: En listados de admin para eliminar propiedades, unidades, etc.

---

## Componentes de Autenticacion (`src/components/auth/`)

### RequireAuth

**Archivo**: `src/components/auth/RequireAuth.tsx`  
**Tipo**: Client Component

**Props**:
```typescript
{ children: ReactNode }
```

**Responsabilidad**: Guarda de autenticacion. Si el usuario no esta autenticado, redirige a `/`. Renderiza children solo cuando `isAuthenticated === true`.

**Uso**: En `DashboardLayout` y `ProcessLayout`.

---

### AuthModal

**Archivo**: `src/components/auth/AuthModal.tsx`  
**Tipo**: Client Component  
**Props**: Ninguna (controlado por Redux)

**Responsabilidad**: Modal de autenticacion que envuelve `Modal` + `AuthFormsPanel`.

**Estado que maneja**:
- Lee `authModalOpen` y `authModalTab` de Redux
- Despacha `setAuthModalOpen({ open: false })` al cerrar
- Deshabilita cierre durante verificacion de codigo (`codeVerificationState === 'loading'`)

---

### AuthFormsPanel

**Archivo**: `src/components/auth/AuthFormsPanel.tsx`  
**Tipo**: Client Component  
**Props**: Ninguna (usa Redux + URL params)

**Responsabilidad**: Panel con tabs de Login / Registro.

**Estado que maneja**:
- Si la ruta es `/auth*`, sincroniza tab con URL search params
- En otros casos, usa `authModalTab` de Redux
- Renderiza `LoginForm` o `RegisterForm` condicionalmente
- Muestra `AuthInfoPanel` como panel lateral decorativo

---

### LoginForm

**Archivo**: `src/components/auth/LoginForm.tsx`  
**Tipo**: Client Component

**Props**:
```typescript
{ className?: string }
```

**Responsabilidad**: Formulario de inicio de sesion con:
- Campos: email, password
- Usa `useActionState` con server action `authenticate`
- Dropdown de autocompletado con usuarios demo (solo en desarrollo)
- Validacion de errores del servidor con mensajes en espanol
- En exito: dispara `setIsAuthenticated(true)` en Redux + carga `UserForRedux` via `getUserAfterLogin`
- Boton "Olvidaste tu contrasena?" abre `ResetPasswordModal`

**Estado que maneja**:
- `loginState` de Redux (loading, success, etc.)
- Errores de validacion locales

---

### RegisterForm

**Archivo**: `src/components/auth/RegisterForm.tsx`  
**Tipo**: Client Component

**Props**:
```typescript
{ className?: string }
```

**Responsabilidad**: Formulario de registro multi-fase:
1. **Fase 1 - Registro**: name, lastName, email, password, phone, agreeTerms
2. **Fase 2 - Verificacion**: Ingreso de codigo de 6 digitos con countdown timer
3. **Fase 3 - Completado**: `SuccessAnimation`

**Estado que maneja**:
- `registerState` y `codeVerificationState` de Redux
- Timer de reenvio de codigo (con `verificationExpiresAt`)
- Auto-login despues de verificacion exitosa

**Server Actions usadas**:
- `registerUser`, `verifyEmailCode`, `resendVerificationCode`

---

### ResetPasswordModal

**Archivo**: `src/components/auth/ResetPasswordModal.tsx`  
**Tipo**: Client Component  
**Props**: Ninguna

**Responsabilidad**: Modal para solicitar recuperacion de contrasena:
- Campo: email
- Envia `sendResetPasswordEmail`
- Muestra estado de exito con instrucciones

**Estado local**:
- `resetEmail`: string
- `isSubmitting`: boolean
- `isSuccess`: boolean
- `error`: string

---

### AuthInfoPanel

**Archivo**: `src/components/auth/AuthInfoPanel.tsx`  
**Tipo**: Client Component  
**Props**: Ninguna

**Responsabilidad**: Panel lateral decorativo en modales de auth con imagen de branding. Sin logica de negocio.

---

### SuccessAnimation

**Archivo**: `src/components/auth/SuccessAnimation.tsx`  
**Tipo**: Client Component  
**Props**: Ninguna

**Responsabilidad**: Overlay fullscreen con animacion de checkmark verde y efecto bounce al completar registro/verificacion.

---

## Layouts de Ruta

### RootLayout (`src/app/layout.tsx`)
- Server Component
- Configura HTML metadata (OpenGraph, Twitter)
- Wraps toda la app con `<ReduxProvider>`
- Carga `globals.css`

### DashboardLayout (`src/app/dashboard/layout.tsx`)
- Client Component
- Solo wrappea con `<RequireAuth>`
- Sin chrome visual (sin sidebar, etc.)

### ProcessLayout (`src/app/process/layout.tsx`)
- Client Component
- Wraps con `<RequireAuth>`, `<Header>`, `<Footer>`
- Incluye `<StepProgress>` (barra de progreso de 4 pasos)
- Incluye `<SummarySidebar>` (resumen lateral del proceso)
- Sincroniza el paso actual con la URL (mapea pathname a `step`)

---

## Estado de Componentes

### Redux (Estado Global)

| Slice | Consumidores principales |
|-------|--------------------------|
| `auth` | Header, AuthModal, AuthFormsPanel, LoginForm, RegisterForm |
| `user` | Header, Dashboard pages, Process pages |
| `property` | Dashboard property detail pages |
| `home` | Landing page, unit listing |
| `process` | ProcessLayout, todos los Process Step pages |

### Estado Local (useState/useReducer)

Usado en:
- Formularios individuales (valores de campos)
- Modales (open/close no controlado por Redux)
- UI transitoria (tooltips, dropdowns, animaciones)

### URL como Estado

Usado para:
- Tab actual en auth modal (search params en `/auth*`)
- Paso actual del wizard (`/process/profile`, `/process/basicInformation`, etc.)
- Filtros de busqueda en listados

---

## Patrones de Comunicacion

### Padre → Hijo: Props
Tipo de datos, configuraciones, callbacks.

### Hijo → Padre: Server Actions
El hijo dispara una Server Action, el padre reacciona al cambio de estado en Redux o al resultado de `useActionState`.

### Entre hermanos: Redux
Componentes que no comparten padre directo se comunican via Redux store.

### Cliente → Servidor: Server Actions
Toda mutacion de datos va a traves de Server Actions. No hay llamadas fetch directas a APIs.
