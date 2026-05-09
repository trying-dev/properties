# Flujos de Negocio - Properties

## Resumen

Este documento describe los flujos de negocio principales del sistema de gestion inmobiliaria Properties, desde la perspectiva del usuario y del administrador.

---

## 1. Proceso de Nuevo Inquilino (Flujo Principal)

Este es el flujo mas complejo del sistema. Cubre desde que un admin identifica un potencial inquilino hasta que el contrato esta activo.

### Diagrama de Estados

```
UNIDAD VACANTE
    │
    ▼
[Admin inicia proceso desde unidad disponible]
    │
    ├── Selecciona unidad
    ├── Selecciona/crea inquilino
    └── Confirma inicio de proceso
    │
    ▼
TOKEN GENERADO ─── Email enviado al inquilino
    │
    ▼
[Inquilino se registra con token]
    │
    ├── Valida token (expiracion limitada)
    ├── Completa formulario de registro
    └── Elige contrasena
    │
    ▼
PROCESO DE APLICACION (Wizard 4 pasos)
    │
    ├── Paso 1: Seleccion de perfil (empleado, independiente, etc.)
    ├── Paso 2: Informacion basica (datos personales, ingresos)
    ├── Paso 3: Informacion complementaria (documentos)
    └── Paso 4: Garantia/seguridad (co-deudores, deposito)
    │
    ▼
ENVIADO A REVISION
    │
    ▼
[Admin revisa aplicacion]
    │
    ├── Revisa documentos
    ├── Verifica datos
    └── Decide: APROBAR o RECHAZAR
    │
    ├── RECHAZADO → Notificacion al inquilino con motivo (FIN)
    │
    ▼ APROBADO
CONTRATO GENERADO (DRAFT)
    │
    ├── Admin configura terminos (canon, deposito, fechas)
    └── Contrato pasa a PENDING
    │
    ▼
CONTRATO ACTIVO
    │
    ├── Unidad cambia a OCCUPIED
    ├── Pagos mensuales programados
    └── Inquilino puede ver dashboard
```

### 1.1 Inicio del Proceso (Admin)

**Ruta**: `/dashboard/admin/nuevo-proceso`

1. Admin navega a "Nuevo Proceso"
2. Ve lista de unidades disponibles (VACANT)
3. Selecciona una unidad
4. Busca o crea un inquilino (via `gestion-de-inquilinos`)
5. Confirma el inicio en `/dashboard/admin/nuevo-proceso/confirmacion-de-inicio-de-proceso`
6. Sistema genera token de registro unico para el inquilino
7. Sistema envia email con link de registro al inquilino (Resend)

**Server Actions involucradas**:
- `nuevo-proceso/getAvailableUnits`
- `confirmacion-de-inicio-de-proceso/initializeContract`
- `confirmacion-de-inicio-de-proceso/updateUserRegistrationToken`

### 1.2 Registro del Inquilino (Token)

**Ruta**: `/registro-con-token?token=xxx`

1. Inquilino recibe email con link
2. Accede a la pagina de registro con token
3. Sistema valida el token (expiracion, ya usado, etc.)
4. Inquilino completa: nombre, apellido, telefono, contrasena
5. Acepta terminos y condiciones
6. Cuenta creada, puede iniciar sesion

**Server Actions involucradas**:
- `registro-con-token/validateRegistrationToken`
- `registro-con-token/completeUserRegistration`

### 1.3 Aplicacion de Alquiler (Wizard del Inquilino)

**Ruta**: `/process/*`

El inquilino completa un wizard de 4 pasos. El estado se persiste en Redux (`process` slice) y se sincroniza con el servidor.

**Paso 1 - Perfil** (`/process/profile`):
- Selecciona tipo de perfil: EMPLEADO, INDEPENDIENTE, INVERSOR, ESTUDIANTE, etc.
- Cada perfil determina que documentos se pediran despues

**Paso 2 - Informacion Basica** (`/process/basicInformation`):
- Datos personales: nombre, email, telefono, fecha de nacimiento
- Documento de identidad: tipo, numero
- Genero, estado civil, profesion
- Ingresos mensuales

**Paso 3 - Informacion Complementaria** (`/process/complementInfo`):
- Subida de documentos segun perfil seleccionado
- Ej: empleado → carta laboral, extractos bancarios
- Ej: independiente → declaraciones de renta, certificados

**Paso 4 - Garantia** (`/process/security`):
- Seleccion de tipo de garantia
- Co-deudores (opcional): nombre, documento, email
- Aceptacion de deposito

**Al finalizar**: El proceso se envia a revision del admin.

**Server Actions involucradas**:
- `processes/createProcessAction`
- `processes/updateProcessAction`
- `user/updateUserBasicInfo`

### 1.4 Revision del Admin

**Ruta**: `/dashboard/admin/applications` y `/dashboard/admin/applications/[id]`

1. Admin ve lista de aplicaciones pendientes
2. Revisa cada aplicacion: datos personales, documentos, perfil
3. Puede aprobar o rechazar:
   - **Aprobar**: Genera contrato en estado DRAFT
   - **Rechazar**: Notifica al inquilino con motivo

**Server Actions involucradas**:
- `processes/getAdminProcessesAction`
- `processes/updateProcessAction` (cambia status a APPROVED/DISAPPROVED)

---

## 2. Gestion de Contratos

### 2.1 Ciclo de Vida del Contrato

```
INITIATED → UNDER_REVIEW → DOCUMENTATION → APPROVED
                                                │
                                                ▼
                                    DRAFT → PENDING → ACTIVE
                                                          │
                                    ┌─────────────────────┤
                                    ▼                     ▼
                                  EXPIRED              TERMINATED
                                    │
                                    ▼
                                  RENEWED
```

**Cancelaciones posibles en cualquier estado**: CANCELLED, REJECTED

### 2.2 Activacion de Contrato

1. Admin configura terminos finales:
   - Canon mensual (`rent`)
   - Deposito (`deposit`)
   - Deposito de seguridad (`securityDeposit`)
   - Fecha de inicio y fin
   - Penalizacion por mora (`lateFeePenalty`)
   - Dias de gracia (`gracePeriodDays`)
2. Contrato pasa a `PENDING` (pendiente de firma/inicio)
3. Al activar (`ACTIVE`):
   - Unidad cambia a `OCCUPIED`
   - Se generan los pagos mensuales automaticamente

---

## 3. Gestion de Pagos

### 3.1 Generacion Automatica de Pagos

**Cron Job**: `GET /api/cron/payments` (protegido por `CRON_SECRET`)

- Se ejecuta periodicamente (diario recomendado)
- Para cada contrato `ACTIVE`:
  - Calcula los pagos mensuales desde `startDate` hasta `endDate`
  - Crea registros en `Payment` con `dueDate` correspondiente
  - Tipo: `CANON` (canon de arrendamiento)

### 3.2 Alertas de Pagos Vencidos

**Cron Job**: `GET /api/cron/alerts` (protegido por `CRON_SECRET`)

- Detecta pagos con `status = PENDING` y `dueDate < now()`
- Aplica penalizacion por mora (`lateFeePenalty`) si excede `gracePeriodDays`
- Cambia status a `OVERDUE`
- Genera notificaciones para admin e inquilino

```typescript
// Logica en src/lib/payments/alerts.ts
generatePaymentAlerts() → marca pagos vencidos, aplica penalizaciones
generateMonthlyPaymentsForActiveContracts() → crea pagos mensuales
```

### 3.3 Confirmacion de Pago (Admin)

**Ruta**: `/dashboard/admin/payments`

1. Admin ve lista de pagos con filtros
2. Selecciona un pago pendiente
3. Registra confirmacion:
   - Metodo de pago (efectivo, transferencia, etc.)
   - Numero de recibo
   - Referencia
4. Pago pasa a `PAID`
5. Si es pago parcial: `PARTIAL`

**Server Actions involucradas**:
- `payments/getAdminPaymentsAction`
- `payments/confirmPaymentAction`

### 3.4 Estados de Pago

| Estado | Significado |
|--------|-------------|
| `PENDING` | Pendiente de pago |
| `PAID` | Pagado completamente |
| `OVERDUE` | Vencido, con o sin penalizacion |
| `PARTIAL` | Pago parcial recibido |
| `CANCELLED` | Pago cancelado |

---

## 4. Gestion de Propiedades y Unidades

### 4.1 Crear Propiedad

**Ruta**: `/dashboard/admin/properties`

1. Admin completa formulario con:
   - Nombre, direccion, tipo de propiedad
   - Caracteristicas fisicas (area, pisos, antiguedad)
   - Zonas comunes, parqueaderos
   - Imagenes
2. Propiedad se crea con status `ACTIVE`

### 4.2 Crear Unidad

**Ruta**: `/dashboard/admin/units` o desde detalle de propiedad

1. Admin selecciona propiedad padre
2. Completa datos de la unidad:
   - Numero de unidad, piso, area
   - Habitaciones, banos
   - Amenidades (amoblado, balcon, mascotas, etc.)
   - Canon base y deposito sugerido
   - Imagenes
3. Unidad se crea con status `VACANT`

### 4.3 Estados de Unidad

| Estado | Significado |
|--------|-------------|
| `VACANT` | Disponible para alquiler |
| `OCCUPIED` | Tiene contrato activo |
| `RESERVED` | Reservada durante proceso |
| `MAINTENANCE` | En mantenimiento |
| `UNAVAILABLE` | No disponible |

---

## 5. Autenticacion y Registro

### 5.1 Registro Directo (sin token)

**Ruta**: Modal de registro en la landing page

1. Usuario completa formulario: nombre, email, password
2. Sistema crea User + Tenant
3. Genera codigo de verificacion de 6 digitos
4. Envia codigo por email (Resend)
5. Usuario ingresa codigo en pantalla de verificacion
6. Email verificado, puede iniciar sesion

### 5.2 Login

**Ruta**: Modal de login

1. Usuario ingresa email y password
2. Sistema valida credenciales via `signIn('credentials')`
3. NextAuth crea sesion JWT (30 dias)
4. Redux actualiza estado: `isAuthenticated = true`, `user = data`
5. Redirige al dashboard segun rol (`/dashboard/admin` o `/dashboard/tenant`)

### 5.3 Recuperacion de Contrasena

**Ruta**: `/reset-password`

1. Usuario ingresa email
2. Sistema genera token con expiracion de 1 hora
3. Envia email con link: `/reset-password?token=xxx`
4. Usuario ingresa nueva contrasena
5. Token se marca como usado

### 5.4 Roles y Permisos

| Rol | Acceso |
|-----|--------|
| `SUPER_ADMIN` | Acceso total, crea otros admins |
| `MANAGER` | Gestion de propiedades, contratos, inquilinos |
| `STANDARD` | Gestion de propiedades asignadas |
| `LIMITED` | Acceso minimo (portero) |
| `TENANT` | Solo su perfil, contratos, pagos, notificaciones |

---

## 6. Notificaciones

### 6.1 Tipos de Notificacion

| Tipo | Gatillo |
|------|---------|
| `APPROVAL` | Admin aprueba una aplicacion |
| `REJECTION` | Admin rechaza una aplicacion |
| `PAYMENT_OVERDUE` | Pago vence sin ser pagado |
| `REMINDER` | Recordatorio de pago proximo |
| `GENERAL` | Notificacion manual o del sistema |

### 6.2 Flujo de Notificacion

1. Evento del sistema o accion manual activa `sendSystemNotificationAction`
2. Se crean registros en tabla `Notification` para los destinatarios
3. Destinatarios ven notificaciones en su dashboard
4. Pueden marcar como leidas

---

## 7. Flujo de Datos entre Componentes

### Patron General

```
Usuario interactua con UI
    │
    ▼
Client Component dispara Server Action (via useActionState o llamada directa)
    │
    ▼
Server Action:
  1. Obtiene sesion (auth())
  2. Verifica permisos (rol, nivel)
  3. Ejecuta operacion Prisma
  4. Retorna { success, data?, error? }
    │
    ▼
Client Component:
  1. Si success: actualiza Redux o estado local
  2. Si error: muestra mensaje
  3. Next.js revalida cache automaticamente
    │
    ▼
UI se actualiza reactivamente
```
