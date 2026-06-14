# Estado del Proyecto - Properties

## Resumen

Properties es una aplicacion Next.js 16 full-stack para gestion inmobiliaria. Stack: React 19, NextAuth v5 (Credentials/JWT), Redux Toolkit, Prisma (SQLite dev / PostgreSQL prod), Tailwind CSS 4, Resend (email).

Este documento describe el estado actual del proyecto: que esta completo, que esta parcialmente implementado, y que falta por construir.

---

## Inventario de Features

### Features Completas

| Feature | Ubicacion | Notas |
|---------|-----------|-------|
| Autenticacion (login/register) | `src/actions/auth/`, `src/lib/auth.ts` | NextAuth v5 Credentials, bcrypt, JWT 30 dias |
| Recuperacion de contrasena | `src/actions/auth/reset-password.ts` | Email -> token -> nueva contrasena |
| Registro con token de invitacion | `src/actions/registro-con-token/` | Token con expiracion 24h |
| Confirmacion de codeudor | `src/actions/codeudor/` | Token via email, confirmacion en payload |
| CRUD de propiedades | `src/actions/property/`, `/dashboard/admin/properties/` | Crear, editar, eliminar, listar |
| CRUD de unidades | `src/actions/property/`, `/dashboard/admin/units/` | Filtros, busqueda, tabla |
| Gestion de pagos | `src/actions/payments/`, `/dashboard/admin/payments/` | Listar, filtrar, confirmar, recibo |
| Gestion de inquilinos | `src/actions/gestion-de-inquilinos/` | CRUD, buscar, deshabilitar, referencias |
| Creacion de admins | `src/actions/admin/`, `/dashboard/admin/create-admin/` | Solo SUPER_ADMIN/MANAGER |
| Wizard de aplicacion (tenant) | `/process/*` (4 pasos) | Perfil, info basica, documentos, garantia |
| Nuevo proceso (admin) | `/dashboard/admin/nuevo-proceso/*` (3 pasos) | Seleccionar unidad, inquilino, confirmar |
| Notificaciones in-app | `src/actions/notifications/` | Inbox admin y tenant, marcar leido |
| Favoritos de unidades | `src/actions/favorites/` | Toggle, listar favoritos |
| Cron de pagos mensuales | `/api/cron/payments` | Genera pagos para contratos activos |
| Cron de alertas | `/api/cron/alerts` | Marca pagos vencidos, genera alertas |
| Landing page publica | `/` | Busqueda de unidades, modal de auth |
| Detalle publico de unidad | `/units/[id]` | Galeria, informacion |

### Features Parcialmente Implementadas

| Feature | Que existe | Que falta |
|---------|------------|-----------|
| **Revision de aplicaciones** | Schema (`ProcessDocument`, `ProcessReviewItem`), server actions en `application-review/index.ts` | UI admin, UI tenant, upload de archivos, auto-generacion de review items |
| **Perfil de tenant** | Vista y edicion basica | Preferencias de notificacion (toggle email/sms) |
| **Dashboard admin home** | 8 cards con contadores | Sin datos reales de procesos pendientes (no hay seed) |

### Features No Implementadas

| Feature | Notas |
|---------|-------|
| **Mensajeria tenant-admin** | Directorio `src/actions/messages/` existe pero vacio |
| **Subida de imagenes de unidad/propiedad** | Campo `images` existe en schema pero sin endpoint de upload |
| **Integracion SMS** | Campo `smsNotifications` en User sin backend |
| **Historial de estado de unidad** | Comentario en `occupancy/index.ts:101` menciona tabla futura `UnitStatusHistory` |

---

## Sistema de Revision de Aplicaciones - Estado Detallado

Este es el area de mayor prioridad actual. El sistema de revision permite que un admin revise la solicitud de un tenant, apruebe/rechace documentos individuales, solicite correcciones, y tome una decision final.

### Lo que YA existe (backend)

**Modelos en Prisma:**

- **Process** — `status`: IN_PROGRESS, IN_EVALUATION, WAITING_FOR_FEEDBACK, APPROVED, DISAPPROVED. Campos `payload` (Json), `notes`, `approvalConditions`.
- **ProcessDocument** — versionado de documentos: `documentType`, `label`, `fileName`, `filePath`, `fileType`, `fileSize`, `version`, `isLatest`, `uploadedByRole`, `uploadedByUserId`.
- **ProcessReviewItem** — checklist atomico: `targetType` (SECTION/DOCUMENT/FIELD), `targetId`, `status` (PENDING/APPROVED/NEEDS_FEEDBACK/REJECTED), `adminComment`, `tenantResponse`, `reviewedByAdminId`, `reviewedAt`.

**Server Actions en `src/actions/application-review/index.ts`:**

| Accion | Linea | Funcion |
|--------|-------|---------|
| `createProcessDocumentVersionAction` | 182 | Crea registros ProcessDocument con versionado, marca `isLatest: false` en versiones anteriores |
| `getProcessReviewBundleAction` | 247 | Obtiene proceso + documentos + review items (bundle completo para UI de revision) |
| `upsertProcessReviewItemAction` | 315 | Admin crea/actualiza revision de un item (SECTION/DOCUMENT/FIELD) |
| `submitTenantReviewResponseAction` | 374 | Tenant responde a feedback, auto-transiciona a IN_EVALUATION si todo resuelto |
| `requestProcessFeedbackAction` | 431 | Admin solicita cambios, cambia estado a WAITING_FOR_FEEDBACK, envia email + notificacion |
| `setProcessDecisionAction` | 493 | Admin aprueba/desaprueba con condiciones opcionales, envia notificacion |

### La capa de storage: el eslabon perdido

El backend de `application-review` ya sabe manejar versionado de documentos en DB (`createProcessDocumentVersionAction` con `version`, `isLatest`, asociacion al proceso) y permitir revision/admin feedback. Pero falta construir el flujo que toma el `File` del formulario del tenant, lo sube a un storage, y devuelve ese `filePath`.

**Opciones de storage:**

| Opcion | Entorno | Ventajas |
|--------|---------|----------|
| `uploads/` o `public/uploads/` local | Dev / MVP | Cero configuracion, sirve para desarrollo |
| S3 / Cloudflare R2 / Supabase Storage | Produccion | Escalable, seguro, URLs firmadas |
| UploadThing u otro servicio | Produccion | Integracion mas rapida en Next.js, menos boilerplate |

**Flujo completo esperado:**

1. Tenant selecciona archivo en el input del wizard (ej. `rut.pdf`)
2. El archivo se sube a storage via endpoint `POST /api/upload`
3. Storage devuelve URL/ruta segura (`filePath`)
4. Se llama `createProcessDocumentVersionAction` con esa metadata (fileName, filePath, fileType, fileSize, documentType)
5. DB registra: "para este proceso, el documento `rut`, version 1, esta en `filePath = /uploads/abc123-rut.pdf`"
6. Admin puede ver/descargar el PDF real desde el endpoint `GET /api/documents/[id]`

Sin esta capa, se pueden registrar documentos "teoricos" en DB, pero no ver/descargar el archivo real.

**Estado actual:** La metadata en DB funciona. El pipeline de upload a storage no existe. Los archivos del wizard viven solo en Redux y se pierden al refrescar.

### Lo que FALTA

| # | Que falta | Severidad | Detalle |
|---|-----------|-----------|---------|
| 1 | **Storage de archivos** | Critico | No hay endpoint de upload, no hay servicio de storage (S3/local). Los archivos del wizard viven solo en Redux (`uploadedDocs`) y se pierden al refrescar la pagina. `ProcessDocument.filePath` espera un path pero nada lo genera. |
| 2 | **UI de revision admin** | Critico | `ApplicationDetail.tsx` (182 lineas) es solo lectura, muestra `Process.payload` como JSON crudo. No usa `getProcessReviewBundleAction`. No tiene botones de aprobar/rechazar/pedir feedback. |
| 3 | **UI de respuesta tenant** | Alto | No existe pagina para que el tenant vea el feedback del admin y responda. `submitTenantReviewResponseAction` existe pero no se llama desde ninguna UI. |
| 4 | **Auto-generacion de review items** | Alto | Cuando el tenant envia el paso 4 y el proceso entra en `IN_EVALUATION`, no se crean `ProcessReviewItem`. El admin no tendria nada que revisar. Se necesita una funcion que cree items por cada tipo de documento del perfil y cada campo de garantia. |
| 5 | **Endpoint de descarga de documentos** | Medio | No hay ruta API para servir archivos subidos. El admin no puede ver/previsualizar documentos. |
| 6 | **Seed data de procesos** | Medio | Cero registros `Process`, `ProcessDocument`, o `ProcessReviewItem` en el seed. El flujo de revision no se puede testear. |
| 7 | **UI de procesos del tenant** | Medio | `/dashboard/tenant/processes` lista procesos pero no muestra estado de revision, feedback pendiente, ni documentos. |

### Flujo de revision esperado

```
Tenant completa wizard (pasos 1-4)
  │
  ▼
IN_EVALUATION ─── Se crean ProcessReviewItem para cada documento/campo/seccion
  │
  ▼
Admin revisa en UI de expediente
  │
  ├── Todo OK → APPROVED (con condiciones opcionales)
  │
  └── Falta algo → Marca items como NEEDS_FEEDBACK
        │
        ▼
      WAITING_FOR_FEEDBACK ─── Email + notificacion al tenant
        │
        ▼
      Tenant ve feedback, responde por item, re-sube documentos
        │
        ▼
      IN_EVALUATION (admin revisa de nuevo)
```

### Orden de implementacion recomendado

1. **Storage + upload endpoint** — `src/lib/storage.ts` (filesystem local para MVP) + `POST /api/upload`
2. **Conectar wizard al upload** — modificar paso 3 (`complementInfo`) y paso 4 (`security`) para subir archivos y llamar `createProcessDocumentVersionAction`
3. **Auto-generar review items** — al transicionar a `IN_EVALUATION`, crear `ProcessReviewItem` por cada tipo de documento del perfil y campo de garantia
4. **UI admin de revision** — reescribir `ApplicationDetail.tsx` usando `getProcessReviewBundleAction`, renderizar checklist con acciones
5. **UI tenant de respuesta** — nueva pagina o expandir `/dashboard/tenant/processes/[id]`
6. **Endpoint de descarga** — `GET /api/documents/[id]` con control de acceso
7. **Seed data** — 2-3 procesos en estados IN_EVALUATION y WAITING_FOR_FEEDBACK con documentos y review items


## Arquitectura de Roles

### Niveles de Admin

| Nivel | Acceso |
|-------|--------|
| **SUPER_ADMIN** | Todo: dashboard admin completo, crear admins, gestionar propiedades, pagos, procesos |
| **MANAGER** | Dashboard admin, crear admins, gestionar usuarios, pagos (sin acceso a rutas SUPER_ADMIN especificas) |
| **STANDARD** | Dashboard admin, propiedades, pagos |
| **LIMITED** | Solo dashboard base (sin sub-rutas admin) |

### Tenant

Acceso a `/dashboard/tenant/*` y `/process/*`. No puede acceder a rutas admin.

### Patron de auth en Server Actions

```typescript
const session = await auth()
if (!session) return { success: false, error: 'Unauthorized' }
// + role check segun corresponda
```

### Rutas protegidas que NO existen aun

El proxy (`src/proxy.ts`) referencia estas rutas que no tienen pagina implementada:
- `/dashboard/admin/super`
- `/dashboard/admin/manager`
- `/dashboard/admin/users`
- `/dashboard/admin/settings`


## Sistema de Email y Notificaciones

### Emails implementados (Resend)

| Flujo | Trigger |
|-------|---------|
| Codigo de verificacion | Registro de usuario |
| Reset de contrasena | Usuario solicita recuperacion |
| Invitacion a inquilino (nuevo) | Admin inicia proceso para nuevo tenant |
| Continuacion de proceso (existente) | Admin inicia proceso para tenant existente |
| Confirmacion de codeudor | Aplicacion con garantia de codeudor |
| Solicitud de feedback | Admin pide correcciones en aplicacion |

### Notificaciones in-app

| Tipo | Disparador |
|------|-----------|
| APPROVAL / REJECTION | Proceso aprobado/rechazado |
| PAYMENT_OVERDUE | Pago vencido (cron) |
| REMINDER | Recordatorio de pago (3 dias antes), solicitud de feedback |
| GENERAL | Admin envia manualmente |

### Lo que falta en notificaciones

- No hay emails para alertas de pago vencido (solo notificaciones in-app)
- No hay UI de preferencias de notificacion (`emailNotifications`, `smsNotifications` en User sin toggle)
- No hay integracion SMS


## Documentos del Wizard - Estado Actual

### Donde se almacenan hoy

Los documentos recolectados en el wizard de aplicacion (pasos 3 y 4) se almacenan **unicamente en Redux** como objetos `FileList` / `File[]` en `process.uploadedDocs`. Este estado:
- Se excluye explicitamente de la persistencia a localStorage (`src/redux/index.ts:67`)
- Se pierde al cerrar/refrescar la pestana
- Nunca se envia al servidor
- `Process.payload` solo guarda metadata (basicInfo, profile, security), no referencias a archivos

### Tipos de documento por perfil

Definidos en `src/app/process/_/profiles.ts` (346 lineas, 9 perfiles, 5 opciones de garantia). Cada perfil define campos requeridos con `type: 'file'`, `accept`, y `multiple`.

### Upload mechanism

**No existe.** No hay:
- Endpoint de upload (`/api/upload` o similar)
- Servicio de storage (S3, filesystem, Vercel Blob)
- Integracion con `multer`, `formidable`, o similar
- `createProcessDocumentVersionAction` espera un `filePath` ya resuelto pero nada lo provee


## Base de Datos

### Modelos actuales (11)

User, Admin, Tenant, Property, Unit, Contract, ContractDocument, Payment, Process, Notification, Reference

### Modelos de revision (3 adicionales, YA en schema)

ProcessDocument, ProcessReviewItem (ambos con relaciones a Process). Estos ya existen en ambos schemas (SQLite y PostgreSQL) pero no se usan desde ninguna UI.

### Seed data

- 9 admins (todos los niveles), 14 tenants
- 4 propiedades, ~23 unidades
- 15 contratos activos con historial de pagos
- Notificaciones de aprobacion, rechazo, mantenimiento, pagos vencidos
- **Cero** registros de Process, ProcessDocument, ProcessReviewItem

### Comandos utiles

```bash
pnpm db:generate   # Generar Prisma client
pnpm db:push       # Sincronizar schema a DB
pnpm db:studio     # Prisma Studio en localhost:5555
pnpm db:seed       # Sembrar datos de prueba
pnpm db:reset      # Reset completo de DB
```


## Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `src/actions/application-review/index.ts` | Backend completo de revision (553 lineas) |
| `src/app/dashboard/admin/applications/[id]/_/ApplicationDetail.tsx` | UI de detalle de aplicacion (182 lineas, solo lectura) |
| `src/app/process/_/profiles.ts` | Perfiles de aplicacion y tipos de documento (346 lineas) |
| `src/app/process/security/page.tsx` | Paso 4 del wizard - garantia y envio final (342 lineas) |
| `src/app/process/complementInfo/_/StepComplementInfo.tsx` | Paso 3 del wizard - documentos (145 lineas) |
| `src/actions/processes/index.ts` | CRUD de procesos (368 lineas) |
| `src/lib/auth.ts` | Configuracion NextAuth v5 (138 lineas) |
| `src/proxy.ts` | Middleware custom de auth y roles (119 lineas) |
| `src/lib/email.ts` | Servicio de email con Resend (32 lineas) |
| `src/lib/prisma.ts` | Cliente Prisma singleton, auto-detecta SQLite/PostgreSQL (36 lineas) |
| `src/redux/slices/process.ts` | Slice Redux del wizard de aplicacion (36 lineas) |
| `prisma/schema.sqlite.prisma` | Schema para desarrollo local |
| `prisma/schema.postgresql.prisma` | Schema para produccion |
