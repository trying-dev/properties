# API - Server Actions

Todas las operaciones del sistema se implementan como **Server Actions** de Next.js (`'use server'`). Cada modulo tiene su propio directorio bajo `src/actions/` con un archivo `index.ts` que exporta las funciones publicas.

## Convencion de Respuesta

Todas las acciones retornan el formato estandar:

```typescript
{ success: boolean; data?: T; error?: string }
```

Donde `data` es opcional (presente solo en `success: true`) y `error` es un mensaje descriptivo (presente solo en `success: false`).

---

## Modulo: auth/

### `authenticate(prevState, formData)`
Inicia sesion con email y contrasena.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `prevState` | `{ success, errors? }` | Estado previo del formulario |
| `formData` | `FormData` | Campos `email` y `password` |

**Retorna**: `{ success: boolean, errors?: Record<string, string[]> }`

**Errores**: `invalid_credentials`, `user_not_found`, `incorrect_password`, `user_disabled`

---

### `registerUser(prevState, formData)`
Registra un nuevo usuario como inquilino.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `prevState` | `RegisterActionState` | Estado previo |
| `formData` | `FormData` | `name`, `lastName`, `email`, `password`, `phone`, `agreeTerms` |

**Retorna**: `{ success, needsVerification?, errors? }`

**Comportamiento**: Crea User + Tenant, encripta password con bcrypt, genera codigo de verificacion de 6 digitos, envia email via Resend. Retorna `{ success: false, needsVerification: true }` para iniciar flujo de verificacion.

---

### `resendVerificationCode(email)`
Reenvia el codigo de verificacion.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `email` | `string` | Email del usuario |

**Retorna**: `{ success: boolean, errors?: Record<string, string[]> }`

---

### `verifyEmailCode(email, code)`
Verifica el codigo de 6 digitos.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `email` | `string` | Email del usuario |
| `code` | `string` | Codigo de 6 digitos |

**Retorna**: `{ success: boolean, errors?: Record<string, string[]> }`

**Efecto**: Marca `emailVerified` en el User.

---

### `sendResetPasswordEmail(email)`
Envia email con link de recuperacion de contrasena.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `email` | `string` | Email del usuario |

**Retorna**: `{ success: boolean, message?: string }`

**Efecto**: Genera token seguro, guarda en `resetPasswordToken` con expiracion de 1 hora, envia email via Resend.

---

### `validateResetToken(token)`
Valida un token de recuperacion.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `token` | `string` | Token del link de recuperacion |

**Retorna**: `{ valid: boolean, message: string, userId?: string, email?: string }`

---

### `resetPassword(token, newPassword)`
Cambia la contrasena usando un token valido.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `token` | `string` | Token validado |
| `newPassword` | `string` | Nueva contrasena |

**Retorna**: `{ success: boolean, message: string }`

**Efecto**: Encripta nueva contrasena con bcrypt, marca `resetPasswordUsed = true`.

---

## Modulo: user/

### `getUserTenant()`
Obtiene el usuario autenticado con sus datos de tenant.

**Retorna**: `UserTenant | null`

**Seguridad**: Requiere sesion activa. Filtra por el usuario de la sesion.

---

### `getUserAfterLogin({ email })`
Obtiene datos completos del usuario despues de login para poblar Redux.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `email` | `string` | Email del usuario |

**Retorna**: `UserForRedux | null`

**Tipo UserForRedux**:
```typescript
{
  id, email, name, lastName, phone, role: 'admin' | 'tenant',
  admin?: { id, adminLevel } | null,
  tenant?: { id, profile, ... } | null
}
```

---

### `updateTenantProfile({ tenantId, data })`
Actualiza el perfil del inquilino.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `tenantId` | `string` | ID del tenant |
| `data` | `{ profile: Profile \| null }` | Nuevo perfil |

**Retorna**: `Tenant`

---

### `updateUserBasicInfo({ data })`
Actualiza informacion basica del usuario autenticado.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `data` | `BasicInfoUpdatePayload` | Campos parciales del usuario |

**BasicInfoUpdatePayload**: `name?`, `lastName?`, `phone?`, `birthDate?`, `birthPlace?`, `documentType?`, `documentNumber?`, `gender?`, `maritalStatus?`, `profession?`, `monthlyIncome?`

**Retorna**: `{ id: string } | null`

---

## Modulo: admin/

### `createAdmin(data)`
Crea un nuevo administrador.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `data` | `CreateAdminInput` | Datos del nuevo admin |

**CreateAdminInput**: `email`, `adminLevel`, `temporaryPassword`, `createdById?`, `name`, `lastName`, `phone?`, `birthDate?`, `birthPlace?`, `profession?`, `gender`, `maritalStatus`, `documentType`, `documentNumber`, `address?`, `city?`, `state?`, `country`, `postalCode?`, `timezone`, `language`, `emailNotifications`, `smsNotifications`

**Retorna**: `{ success: boolean, data?: Admin, error?: string }`

**Seguridad**: Solo SUPER_ADMIN o MANAGER pueden crear admins. No se puede crear un SUPER_ADMIN desde aqui (solo seed).

---

## Modulo: property/

### `getProperties()`
Obtiene todas las propiedades.

**Retorna**: `Property[]`

---

### `getProperty({ id })`
Obtiene una propiedad con todas sus relaciones.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | `string` | ID de la propiedad |

**Retorna**: `PropertyWithRelations | null`

---

### `getPropertyLite({ id })`
Obtiene una propiedad sin relaciones (datos basicos).

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | `string` | ID de la propiedad |

**Retorna**: `Property | null`

---

### `getPropertyWithUnits({ id })`
Obtiene una propiedad con sus unidades.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | `string` | ID de la propiedad |

**Retorna**: `PropertyWithUnits | null`

---

### `createPropertyAction(input)`
Crea una nueva propiedad.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `input` | `CreatePropertyInput` | Datos de la propiedad |

**Retorna**: `{ success: boolean, data?: { id: string }, error?: string }`

---

### `updatePropertyAction(propertyId, input)`
Actualiza una propiedad existente.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `propertyId` | `string` | ID de la propiedad |
| `input` | `CreatePropertyInput` | Datos actualizados |

**Retorna**: `{ success: boolean, error?: string }`

---

### `deletePropertyAction(propertyId)`
Elimina una propiedad (y sus unidades en cascada).

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `propertyId` | `string` | ID de la propiedad |

**Retorna**: `{ success: boolean, error?: string }`

---

### `createUnitAction(input)`
Crea una unidad dentro de una propiedad.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `input` | `CreateUnitInput` | Datos de la unidad (incluye `propertyId`) |

**Retorna**: `{ success: boolean, error?: string }`

---

### `updateUnitAction(unitId, input)`
Actualiza una unidad.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `unitId` | `string` | ID de la unidad |
| `input` | `CreateUnitInput & { propertyId }` | Datos actualizados |

**Retorna**: `{ success: boolean, error?: string }`

---

### `deleteUnitAction(unitId)`
Elimina una unidad.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `unitId` | `string` | ID de la unidad |

**Retorna**: `{ success: boolean, error?: string }`

---

## Modulo: units/

### `getAdminUnits(filters?)`
Obtiene unidades para el panel de administrador.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `filters` | `{ status?, propertyId?, city? }` | Filtros opcionales |

**Retorna**: `AdminUnitRow[]` (incluye propiedad, conteo de contratos, ultimo contrato con inquilino)

---

### `getAdminUnitsAction(filters?)`
Version con respuesta estandar.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `filters` | `{ status?, propertyId?, city? }` | Filtros opcionales |

**Retorna**: `{ success: boolean, data?: AdminUnitRow[], error?: string }`

---

## Modulo: payments/

### `getAdminPayments()`
Obtiene todos los pagos para administracion.

**Retorna**: `AdminPaymentRow[]` (incluye contrato → unidad → propiedad → inquilino → usuario)

---

### `getAdminPaymentsAction()`
Version con respuesta estandar.

**Retorna**: `{ success: boolean, data?: AdminPaymentRow[], error?: string }`

---

### `getPendingPaymentsCount()`
Cuenta pagos pendientes.

**Retorna**: `number`

---

### `confirmPaymentAction(input)`
Confirma/registra un pago.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `input.paymentId` | `string` | ID del pago |
| `input.receiptNumber?` | `string` | Numero de recibo |
| `input.reference?` | `string` | Referencia |
| `input.notes?` | `string` | Notas |
| `input.transactionId?` | `string` | ID de transaccion externa |

**Retorna**: `{ success: boolean, data?: Payment, error?: string }`

---

## Modulo: processes/

### `createProcessAction(input)`
Crea un nuevo proceso de aplicacion.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `input` | `CreateProcessInput` | Datos del proceso |

**Retorna**: `{ success: boolean, data?: { id: string }, error?: string }`

---

### `updateProcessAction(input)`
Actualiza un proceso existente. Si se aprueba/rechaza, envia notificaciones automaticamente.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `input` | `UpdateProcessInput` | Datos actualizados |

**Retorna**: `{ success: boolean, error?: string }`

---

### `getProcessAction(processId)`
Obtiene un proceso por ID.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `processId` | `string` | ID del proceso |

**Retorna**: `{ success: boolean, data?: Process, error?: string }`

---

### `getProcessDetailsAction(processId)`
Obtiene detalles completos de un proceso.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `processId` | `string` | ID del proceso |

**Retorna**: `{ success: boolean, data?: ProcessDetail, error?: string }`

---

### `getTenantProcessesAction(tenantId)`
Obtiene los procesos de un inquilino.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `tenantId` | `string` | ID del tenant |

**Retorna**: `{ success: boolean, data?: TenantProcessList, error?: string }`

---

### `deleteTenantProcessAction(processId, tenantId)`
Elimina un proceso de inquilino.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `processId` | `string` | ID del proceso |
| `tenantId` | `string` | ID del tenant (verifica pertenencia) |

**Retorna**: `{ success: boolean, error?: string }`

---

### `getAdminProcessesAction()`
Obtiene todos los procesos para administracion.

**Retorna**: `{ success: boolean, data?: AdminProcessList, error?: string }`

---

### `getProcessByTenantUnitAction(tenantId, unitId)`
Busca proceso por inquilino y unidad.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `tenantId` | `string` | ID del tenant |
| `unitId` | `string` | ID de la unidad |

**Retorna**: `{ success: boolean, data?: TenantUnitProcess, error?: string }`

---

## Modulo: notifications/

### `getTenantNotificationsAction()`
Obtiene notificaciones del inquilino autenticado.

**Retorna**: `{ success: boolean, data?: TenantNotificationList, error?: string }`

---

### `getAdminNotificationsAction()`
Obtiene notificaciones para administradores.

**Retorna**: `{ success: boolean, data?: AdminNotificationList, error?: string }`

---

### `markNotificationReadAction(notificationId)`
Marca una notificacion como leida.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `notificationId` | `string` | ID de la notificacion |

**Retorna**: `{ success: boolean, error?: string }`

---

### `sendNotificationAction(input)`
Envia una notificacion manual.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `input` | `SendNotificationInput` | Destino y contenido |

**Retorna**: `{ success: boolean, data?: { notificationId: string }, error?: string }`

---

### `sendSystemNotificationAction(input)`
Envia notificaciones del sistema (multidestino).

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `input` | `SendSystemNotificationInput` | Destinos y contenido |

**Retorna**: `{ success: boolean, data?: { notificationIds: string[] }, error?: string }`

---

## Modulo: favorites/

### `getTenantFavoriteUnitIdsAction()`
Obtiene IDs de unidades favoritas del inquilino.

**Retorna**: `{ success: boolean, data: string[], error?: string }`

---

### `toggleTenantFavoriteUnitAction(unitId)`
Agrega o remueve una unidad de favoritos.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `unitId` | `string` | ID de la unidad |

**Retorna**: `{ success: boolean, data?: { favoriteUnitIds: string[], isFavorite: boolean }, error?: string }`

---

### `getTenantFavoriteUnitsAction()`
Obtiene las unidades favoritas con datos completos.

**Retorna**: `{ success: boolean, data?: Unit[], error?: string }`

---

## Modulo: nuevo-proceso/

### `getAvailableUnits(filters?)`
Busca unidades disponibles para iniciar proceso de alquiler.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `filters` | `{ priceMax?, bedrooms?, city?, ... }` | Filtros opcionales |

**Retorna**: `AvailableUnit[]`

---

### `getUnitById({ id })`
Obtiene detalle de una unidad con todas sus relaciones.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | `string` | ID de la unidad |

**Retorna**: `UnitWithRelations | null`

---

### `getPropertiesWithAvailableUnits()`
Lista propiedades que tienen unidades disponibles.

**Retorna**: `PropertyWithAvailableUnits[]`

---

### `reserveUnit({ unitId })`
Reserva una unidad (cambia status a RESERVED).

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `unitId` | `string` | ID de la unidad |

**Retorna**: `Unit`

---

### `getUnitsByProperty({ propertyId })`
Obtiene unidades de una propiedad especifica.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `propertyId` | `string` | ID de la propiedad |

**Retorna**: `Unit[]`

---

### `getAvailableUnitsAction(filters?)`
Version con respuesta estandar de `getAvailableUnits`.

**Retorna**: `{ success: boolean, data?: AvailableUnit[], error?: string }`

---

### `getUnitByIdAction(unitId)`
Version con respuesta estandar de `getUnitById`.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `unitId` | `string` | ID de la unidad |

**Retorna**: `{ success: boolean, data?: UnitWithRelations, error?: string }`

---

### `getPropertiesWithAvailableUnitsAction()`
Version con respuesta estandar.

**Retorna**: `{ success: boolean, data?: PropertyWithAvailableUnits[], error?: string }`

---

### `reserveUnitAction(unitId)`
Version con respuesta estandar de `reserveUnit`.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `unitId` | `string` | ID de la unidad |

**Retorna**: `{ success: boolean, data?: Unit, error?: string }`

---

### `getUnitsByPropertyAction(propertyId)`
Version con respuesta estandar de `getUnitsByProperty`.

**Retorna**: `{ success: boolean, data?: Unit[], error?: string }`

---

## Modulo: confirmacion-de-inicio-de-proceso/

### `getProcessDetails({ unitId, tenantId })`
Obtiene detalles para confirmar inicio de proceso.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `unitId` | `string` | ID de la unidad |
| `tenantId` | `string` | ID del inquilino |

**Retorna**: `{ unit, tenant }`

---

### `initializeContract({ unitId, tenantId, adminId, notes? })`
Inicia un contrato desde un proceso confirmado.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `unitId` | `string` | ID de la unidad |
| `tenantId` | `string` | ID del inquilino |
| `adminId` | `string` | ID del admin responsable |
| `notes?` | `string` | Notas opcionales |

**Retorna**: `Contract`

---

### `updateUserRegistrationToken(tenantId, registrationToken)`
Asigna token de registro a un inquilino para invitacion por email.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `tenantId` | `string` | ID del tenant |
| `registrationToken` | `string` | Token generado |

**Retorna**: `Tenant`

---

### `getProcessDetailsAction(unitId, tenantId)`
Version con respuesta estandar de `getProcessDetails`.

**Retorna**: `{ success: boolean, data?: ProcessDetails, error?: string }`

---

### `initializeContractAction({ unitId, tenantId, adminId, notes? })`
Version con respuesta estandar de `initializeContract`.

**Retorna**: `{ success: boolean, data?: { unitId, tenantId, adminId, contractId }, error?: string }`

---

### `resendProcessEmail({ processId })` (emailResend.ts)
Reenvia email de confirmacion de proceso.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `processId` | `string` | ID del proceso |

**Retorna**: `{ success: boolean, error?: string }`

---

## Modulo: registro-con-token/

### `validateRegistrationToken(token)`
Valida un token de registro de inquilino.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `token` | `string` | Token del link de invitacion |

**Retorna**: `{ success: boolean, tenant?: TenantValidationRegistrationToken, error?: string }`

---

### `completeUserRegistration({ token, password, agreeTerms })`
Completa el registro del inquilino con contrasena.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `token` | `string` | Token validado |
| `password` | `string` | Contrasena elegida |
| `agreeTerms` | `boolean` | Acepto de terminos |

**Retorna**: `{ success: boolean, message?: string, error?: string }`

---

## Modulo: codeudor/

### `sendCoDebtorConfirmationEmailsAction({ processId, selectedSecurity, coDebtors })`
Envia emails de confirmacion a co-deudores.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `processId` | `string` | ID del proceso |
| `selectedSecurity` | `string` | Tipo de garantia seleccionada |
| `coDebtors` | `CoDebtorInput[]` | Lista de co-deudores |

**CoDebtorInput**: `{ name, lastName, birthDate, documentNumber, email, phone }`

**Retorna**: `{ success: boolean, error?: string }`

---

### `confirmCoDebtorAction({ processId, token })`
Confirma participacion de un co-deudor via token.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `processId` | `string` | ID del proceso |
| `token` | `string` | Token de confirmacion |

**Retorna**: `{ success: boolean, error?: string }`

---

## Modulo: gestion-de-inquilinos/

### `getTenantsAction(filters?)`
Lista inquilinos con filtros y paginacion.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `filters.search?` | `string` | Busqueda por texto |
| `filters.city?` | `string` | Filtro por ciudad |
| `filters.documentType?` | `string` | Filtro por tipo de documento |
| `filters.profile?` | `string` | Filtro por perfil |
| `filters.page?` | `number` | Pagina (paginacion) |
| `filters.pageSize?` | `number` | Tamano de pagina |

**Retorna**: `{ success: boolean, data?: TenantListItem[], error?: string }`

---

### `getTenantByIdAction(tenantId)`
Obtiene un inquilino por ID.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `tenantId` | `string` | ID del tenant |

**Retorna**: `{ success: boolean, data?: Tenant, error?: string }`

---

### `createTenantAction(tenantData)`
Crea un nuevo inquilino (admin).

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `tenantData` | `CreateTenantSubmit` | Datos completos del inquilino |

**Retorna**: `{ success: boolean, data?: Tenant, error?: string }`

---

### `updateTenantAction(tenantId, updateData)`
Actualiza datos de un inquilino.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `tenantId` | `string` | ID del tenant |
| `updateData` | `object` | Campos a actualizar |

**Retorna**: `{ success: boolean, data?: object, error?: string }`

---

### `disableTenantAction(tenantId)`
Deshabilita un inquilino (soft delete).

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `tenantId` | `string` | ID del tenant |

**Retorna**: `{ success: boolean, message?: string, error?: string }`

---

### `getTenantsStatsAction()`
Obtiene estadisticas de inquilinos.

**Retorna**: `{ success: boolean, data?: object, error?: string }`

---

## API Routes (REST)

Ademas de las Server Actions, existen dos endpoints REST para cron jobs:

### `GET /api/cron/payments`
Genera pagos mensuales para contratos activos.  
**Headers**: `Authorization: Bearer <CRON_SECRET>`

### `GET /api/cron/alerts`
Genera alertas de pagos vencidos y recordatorios.  
**Headers**: `Authorization: Bearer <CRON_SECRET>`
