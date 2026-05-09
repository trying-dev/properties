# Arquitectura del Sistema - Properties

## Resumen

Properties es una aplicacion Next.js 16 (App Router) full-stack para gestion inmobiliaria. Sigue un patron de **Server Actions como capa de acceso a datos** combinado con **Redux para estado global del cliente** y **NextAuth v5 para autenticacion/autorizacion basada en roles**.

---

## Diagrama de Capas

```
┌─────────────────────────────────────────────────┐
│                 CLIENTE (Navegador)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Redux    │ │ React    │ │ react-hook-form  │ │
│  │ Store    │ │ Hooks    │ │ + Zod            │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────┤
│              NEXT.JS APP ROUTER                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Server Components / Client Components   │   │
│  │  (Pages, Layouts, Loading, Error)        │   │
│  └──────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│           SERVER ACTIONS ('use server')          │
│  ┌─────────┐ ┌────────┐ ┌──────────────────┐   │
│  │ auth/   │ │ admin/ │ │ property/        │   │
│  │ user/   │ │ units/ │ │ payments/        │   │
│  │ process │ │ nuevo- │ │ registro-con-    │   │
│  │ es/     │ │ proceso│ │ token/           │   │
│  │ notific │ │ codeu- │ │ gestion-de-      │   │
│  │ ations/ │ │ dor/   │ │ inquilinos/      │   │
│  │ favori- │ │ confir-│ │ messages/        │   │
│  │ tes/    │ │ macion │ │                  │   │
│  └─────────┘ └────────┘ └──────────────────┘   │
├─────────────────────────────────────────────────┤
│            CAPA DE DATOS                         │
│  ┌──────────────────┐ ┌────────────────────┐    │
│  │ NextAuth v5      │ │ Prisma ORM         │    │
│  │ (Credentials)    │ │ (SQLite/PostgreSQL) │    │
│  └──────────────────┘ └────────────────────┘    │
├─────────────────────────────────────────────────┤
│            SERVICIOS EXTERNOS                    │
│  ┌──────────────────┐ ┌────────────────────┐    │
│  │ Resend (emails)  │ │ Cron Jobs          │    │
│  └──────────────────┘ └────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## Capa 1: Cliente (Navegador)

### Redux Store
Gestiona 5 slices de estado global:

| Slice | Responsabilidad |
|-------|----------------|
| `auth` | Flujo de autenticacion (login/register/verification states), modal states |
| `user` | Datos del usuario autenticado (`UserForRedux`) |
| `property` | Propiedad actual en vista de detalle |
| `home` | Unidades disponibles, filtros de busqueda |
| `process` | Estado del wizard de aplicacion de alquiler (multi-paso) |

La store se persiste en `localStorage` (clave `"state"`) y se rehidrata al iniciar. Las slices `home.units` y `process.uploadedDocs` se excluyen de la persistencia.

### Hooks Cliente
- `useSession()`: Obtiene sesion del servidor via API interna, expone `isAuthenticated`, `role`, `user`
- `useAppRouter()`: Wrapper de navegacion con fallback a `window.location.assign` para evitar estados inconsistentes en transiciones React

---

## Capa 2: Next.js App Router

### Enrutamiento
Next.js App Router organiza las rutas por directorios bajo `src/app/`. Cada directorio con `page.tsx` es una ruta.

**Rutas publicas** (sin autenticacion):
- `/` - Landing page
- `/sobre-nosotros`, `/contacto`, `/terminos`, `/privacidad`
- `/units/[id]` - Detalle publico de unidad
- `/reset-password` - Recuperacion de contrasena
- `/registro-con-token` - Registro de inquilino via token
- `/codeudor/confirmar` - Confirmacion de co-deudor

**Rutas protegidas** (`/dashboard/*`, `/process/*`):
- Protegidas por el callback `authorized` de NextAuth (niega acceso si no hay sesion)
- `RequireAuth` (componente cliente) como guarda adicional con redireccion

**API Routes**:
- `/api/cron/alerts` - Genera alertas de pagos (protegido por `CRON_SECRET`)
- `/api/cron/payments` - Genera pagos mensuales automaticos

### Patron de Componentes
- **Server Components**: Layouts principales, paginas publicas estaticas
- **Client Components**: Componentes interactivos (formularios, modales, dashboards)
- Los componentes cliente usan Server Actions para mutaciones (no hay API routes REST tradicionales)

---

## Capa 3: Server Actions

Toda la logica de negocio y acceso a datos se implementa como **Server Actions** (`'use server'`). Cada modulo tiene su propio directorio bajo `src/actions/`.

### Convencion de Respuesta
```typescript
{ success: boolean; data?: T; error?: string }
```

### Modulos por Feature

| Modulo | Archivo | Funcion |
|--------|---------|---------|
| `auth/` | `login.ts`, `register.ts`, `verify-email.ts`, `reset-password.ts` | Autenticacion y verificacion |
| `user/` | `index.ts` | Consulta y actualizacion de perfil de usuario |
| `admin/` | `index.ts` | Creacion de administradores |
| `property/` | `index.ts` | CRUD de propiedades y unidades |
| `units/` | `index.ts` | Listado de unidades para admin |
| `payments/` | `index.ts` | Gestion de pagos (admin) |
| `processes/` | `index.ts` | CRUD de procesos de aplicacion |
| `nuevo-proceso/` | `index.ts` | Inicio de nuevo proceso de alquiler |
| `confirmacion-de-inicio-de-proceso/` | `index.ts`, `emailResend.ts` | Confirmacion e inicio de contrato |
| `registro-con-token/` | `index.ts` | Validacion de token y registro de inquilino |
| `codeudor/` | `index.ts` | Gestion de co-deudores |
| `gestion-de-inquilinos/` | `index.ts` | CRUD de inquilinos (admin) |
| `notifications/` | `index.ts` | Envio y consulta de notificaciones |
| `favorites/` | `index.ts` | Unidades favoritas del inquilino |
| `messages/` | (directorio) | Mensajeria (placeholder) |

### Seguridad
- Cada server action obtiene la sesion via `auth()` de NextAuth
- Verifica roles (`admin` vs `tenant`) y niveles (`SUPER_ADMIN`, `MANAGER`, etc.)
- Los datos se filtran por pertenencia (un tenant solo ve sus propios contratos)

---

## Capa 4: Datos

### Prisma ORM
- **Desarrollo**: SQLite con adaptador `@libsql/client`
- **Produccion**: PostgreSQL nativo
- **Seleccion de schema**: `prisma.config.ts` elige `schema.sqlite.prisma` o `schema.postgresql.prisma` segun `DATABASE_URL`
- Cliente singleton via `src/lib/prisma.ts` con caching global en desarrollo

### NextAuth v5
- **Provider**: Credentials (email + password)
- **Sesion**: Estrategia JWT, 30 dias de maxAge
- **Autorizacion**: Callback `authorized` bloquea `/dashboard/*` sin sesion
- **JWT**: Almacena `role` y `adminLevel` en el token
- **Session**: Expone `session.user.id`, `.role`, `.adminLevel`, `.email`, `.name`

### Modelos (11 tablas)
Ver [data-model.md](./data-model.md) para detalle completo.

---

## Capa 5: Servicios Externos

### Resend (Email Transaccional)
Envio de:
- Codigos de verificacion de email (6 digitos)
- Tokens de recuperacion de contrasena
- Invitaciones de registro para inquilinos (token link)
- Confirmaciones de co-deudor
- Notificaciones del sistema

**Modo testing**: Si `USING_TESTING_EMAIL=true`, todos los emails se redirigen a `RESEND_EMAIL_TEST` para evitar envios accidentales.

### Cron Jobs
Endpoints HTTP programables (via cron externo o Vercel Cron):
- `/api/cron/payments`: Genera registros de pago mensuales para contratos activos
- `/api/cron/alerts`: Detecta pagos vencidos y genera notificaciones/penalizaciones

Ambos protegidos por header `Authorization: Bearer <CRON_SECRET>`.

---

## Flujo de Datos Tipico

```
Usuario hace clic en "Login"
  → Client Component dispara server action authenticate()
    → Server Action valida credenciales contra Prisma
      → signIn('credentials') de NextAuth crea sesion JWT
        → Redux: setIsAuthenticated(true), setUser(data)
          → UI se actualiza reactivamente
```

```
Admin crea nueva propiedad
  → Client Component envia FormData a createPropertyAction()
    → Server Action verifica sesion y rol admin
      → Prisma create en tabla Property
        → Retorna { success: true, data: { id } }
          → Redux puede actualizarse si es necesario
            → UI muestra confirmacion
```

---

## Patrones Arquitectonicos

### 1. Server Actions como API
No hay capa REST/GraphQL separada. Las Server Actions son el unico contrato entre frontend y backend. Esto reduce boilerplate pero acopla el frontend al runtime de Next.js.

**Tradeoff**: Simplicidad y velocidad de desarrollo a cambio de portabilidad (no se puede exponer la misma API a clientes moviles sin wrapper adicional).

### 2. Estado Global vs Estado Local
- **Redux**: Flujo de auth, datos de usuario, estado de wizard multi-paso
- **Estado local React**: Formularios, UI transitoria, modales
- **URL/searchParams**: Filtros de busqueda, tab actual en modales

### 3. Multi-tenancy via Roles
No hay multi-tenancy a nivel de organizacion. El sistema usa roles jerarquicos:
- `SUPER_ADMIN` > `MANAGER` > `STANDARD` > `LIMITED`
- `TENANT` (rol separado para inquilinos)

### 4. Optimistic UI
Las mutaciones via Server Actions usan `useActionState` (React 19) que maneja estado de carga y errores nativamente, con revalidacion automatica del cache de Next.js.

---

## Puntos de Falla y Mitigaciones

| Componente | Riesgo | Mitigacion |
|-----------|--------|------------|
| Server Actions | Si Next.js falla, toda la app cae | Monolitico por diseno; hosting en Vercel mitiga |
| Prisma SQLite | Concurrencia limitada en escritura | PostgreSQL en produccion |
| NextAuth JWT | No hay revocacion de sesion sin invalidar secret | Rotacion de `NEXTAUTH_SECRET` para forzar logout global |
| Resend | Si el servicio de email falla, registros/recuperaciones se bloquean | No hay fallback implementado; riesgo aceptado en MVP |
| Cron jobs | Dependen de llamadas HTTP externas | Verificar que el scheduler este configurado (Vercel Cron) |
| localStorage | Si el storage se corrompe, la app puede fallar | Try/catch en hidratacion, reset manual limpia estado |

---

## Convenciones de Codigo

- **Idioma**: Codigo en ingles, UI y documentacion en espanol
- **Nombres de archivo**: kebab-case para directorios de acciones (`nuevo-proceso/`), camelCase para archivos de utilidad
- **Server Actions**: Archivo `index.ts` por feature, exporta funciones con sufijo `Action` para las que retornan `{ success, data?, error? }`
- **Tipos**: Definidos junto al codigo que los usa (no hay directorio central de tipos excepto `src/types/next-auth.d.ts`)
- **Formularios**: `useActionState` (React 19) en lugar de `react-hook-form` en la mayoria de casos; Zod para validacion en server

---

## Limitaciones Conocidas

1. **Sin API REST/GraphQL**: La app solo funciona como monolito Next.js; no hay endpoints para integraciones externas o apps moviles
2. **Sin tests**: No se encontraron archivos de test en el proyecto
3. **Sin manejo de errores global**: Cada server action maneja sus propios try/catch; no hay error boundary centralizado
4. **Estado de Redux no normalizado**: Los slices guardan objetos completos sin normalizacion (posible duplicacion de datos)
5. **Sin internacionalizacion real**: Solo espanol hardcodeado; el campo `language` en User no se usa para i18n
6. **Mensajeria (messages/)**: Directorio de acciones existe pero parece ser un placeholder sin implementacion
