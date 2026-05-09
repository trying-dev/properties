# Modelo de Datos - Properties

## Resumen

El modelo de datos usa **Prisma ORM** con 11 modelos/entidades. Soporta dos proveedores de base de datos seleccionados dinamicamente: SQLite (desarrollo) y PostgreSQL (produccion). El archivo de configuracion `prisma.config.ts` selecciona el schema apropiado segun el prefijo de `DATABASE_URL`.

---

## Diagrama de Relaciones

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│   User   │1─────1│  Admin   │1─────*│ Property │
│          │       │          │       │          │
│          │1─────1│  Tenant  │       │        1│
└──────────┘       └──────────┘       └──────────┘
                                             │
                                             │1
                                        ┌────┴─────┐
                                        │   Unit   │
                                        │          │
                                        └────┬─────┘
                                             │1
                    ┌──────────┐       ┌─────┴──────┐
                    │ Payment  │*─────1│  Contract  │
                    │          │       │            │
                    └──────────┘       └─────┬──────┘
                                        │1        │*
                                   ┌────┴────┐   │
                                   │Contract │   │
                                   │Document │   │
                                   └─────────┘   │
                                             ┌────┴──────┐
                                             │  Process  │
                      ┌──────────┐           │           │
                      │Reference │*─────────1│           │
                      │          │           └───────────┘
                      └──────────┘
                      
┌────────────────┐
│  Notification  │───*── Admin
│                │───*── Tenant
└────────────────┘
```

---

## 1. User

**Tabla**: `users`  
**Descripcion**: Usuario base del sistema. Contiene datos personales, de contacto y configuracion. Puede tener rol de Admin o Tenant (relaciones 1-a-1).

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | String | Si | `@id @default(cuid())` |
| `email` | String | Si | `@unique`, indice |
| `emailVerified` | DateTime? | No | Fecha de verificacion |
| `phone` | String? | No | Telefono |
| `phoneVerified` | DateTime? | No | |
| `password` | String? | No | Hash bcrypt |
| `resetPasswordToken` | String? | No | Token de recuperacion |
| `resetPasswordExpiresAt` | DateTime? | No | Expiracion 1 hora |
| `resetPasswordUsed` | Boolean | Si | `@default(false)` |
| `verificationCode` | String? | No | Codigo 6 digitos |
| `verificationCodeExpiresAt` | DateTime? | No | |
| `name` | String | Si | Nombre |
| `lastName` | String | Si | Apellido |
| `birthDate` | DateTime? | No | Fecha de nacimiento |
| `birthPlace` | String? | No | Lugar de nacimiento |
| `address` | String? | No | Direccion |
| `city` | String? | No | Ciudad |
| `state` | String? | No | Departamento/Estado |
| `country` | String? | No | Pais |
| `postalCode` | String? | No | Codigo postal |
| `documentType` | DocumentType? | No | Enum: CC, CE, TI, PASSPORT, NIT, OTHER |
| `documentNumber` | String? | No | `@unique`, indice |
| `gender` | Gender? | No | MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY |
| `maritalStatus` | MaritalStatus? | No | SINGLE, MARRIED, DIVORCED, WIDOWED, SEPARATED, COMMON_LAW |
| `profession` | String? | No | Profesion u ocupacion |
| `monthlyIncome` | Float? | No | Ingresos mensuales |
| `profileImage` | String? | No | URL de imagen |
| `disable` | Boolean | Si | `@default(false)`, deshabilitacion |
| `timezone` | String | Si | `@default("America/Bogota")` |
| `language` | String | Si | `@default("es")` |
| `emailNotifications` | Boolean | Si | `@default(true)` |
| `smsNotifications` | Boolean | Si | `@default(false)` |
| `createdAt` | DateTime | Si | `@default(now())`, indice |
| `updatedAt` | DateTime | Si | `@updatedAt` |
| `deletedAt` | DateTime? | No | Soft delete, indice |
| `lastLoginAt` | DateTime? | No | Ultimo login, indice |

**Relaciones**:
- `admin`: 1-a-1 con Admin
- `tenant`: 1-a-1 con Tenant
- `additionalContracts`: Contract[] via `"AdditionalResidents"` (residentes adicionales en un contrato)

---

## 2. Admin

**Tabla**: `admins`  
**Descripcion**: Extension de User para administradores con nivel jerarquico.

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | String | Si | `@id @default(cuid())` |
| `userId` | String | Si | `@unique`, FK a User |
| `adminLevel` | AdminLevel | Si | `@default(STANDARD)` |
| `createdById` | String? | No | FK autorreferenciada, quien creo este admin |

**Enum AdminLevel**:
- `SUPER_ADMIN` - Acceso completo, puede crear otros admins
- `MANAGER` - Gestion de usuarios y propiedades
- `STANDARD` - Gestion de propiedades asignadas
- `LIMITED` - Acceso limitado (ej: portero)

**Relaciones**:
- `user`: 1-a-1 con User (Cascade delete)
- `createdBy`: 1-a-1 autorreferenciada `"AdminCreatedBy"`
- `created`: Admin[] inversa
- `propertiesAssigned`: Property[] via `"PropertyAdmins"`
- `contracts`: Contract[] via `"ContractAdmins"`
- `processes`: Process[] via `"ProcessAdmin"`
- `notifications`: Notification[]

---

## 3. Tenant

**Tabla**: `tenants`  
**Descripcion**: Extension de User para inquilinos con datos adicionales.

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | String | Si | `@id @default(cuid())` |
| `userId` | String | Si | `@unique`, FK a User |
| `profile` | Profile? | No | Perfil: EMPLOYED, INDEPENDENT, RETIRED, ENTREPRENEUR, INVESTOR, STUDENT, FOREIGN, NOMAD, UNEMPLOYED |
| `favoriteUnitIds` | Json? | No | Array JSON de IDs de unidades favoritas |
| `emergencyContact` | String? | No | Nombre contacto emergencia |
| `emergencyContactPhone` | String? | No | Telefono contacto emergencia |
| `monthlyIncome` | Float? | No | Ingresos mensuales declarados |
| `registrationToken` | String? | No | Token para registro via email |
| `registrationTokenExpires` | DateTime? | No | Expiracion del token |

**Relaciones**:
- `user`: 1-a-1 con User (Cascade delete)
- `contracts`: Contract[] (contratos como inquilino principal)
- `processes`: Process[] via `"ProcessTenant"`
- `notifications`: Notification[]
- `references`: Reference[]

---

## 4. Property

**Tabla**: `properties`  
**Descripcion**: Propiedad inmobiliaria (edificio, casa, local comercial, etc.)

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | String | Si | `@id @default(cuid())` |
| `name` | String | Si | Nombre de la propiedad |
| `description` | String? | No | Descripcion |
| `street` | String | Si | Calle |
| `number` | String | Si | Numero |
| `city` | String | Si | Ciudad |
| `neighborhood` | String | Si | Barrio |
| `state` | String | Si | Departamento |
| `postalCode` | String | Si | Codigo postal |
| `gpsCoordinates` | String? | No | Formato `"lat,lng"` |
| `country` | String | Si | `@default("Colombia")` |
| `propertyType` | PropertyType | Si | HOUSE, BUILDING, APARTMENT, COMMERCIAL_SPACE, OFFICE, LAND |
| `totalLandArea` | Float? | No | Area total del terreno (m²) |
| `builtArea` | Float | Si | Area construida (m²) |
| `floors` | Int | Si | `@default(1)`, numero de pisos |
| `age` | Int | Si | Antiguedad en anios |
| `yardOrGarden` | String? | No | Descripcion de patio/jardin |
| `parking` | Int | Si | `@default(0)`, espacios de parqueo |
| `parkingLocation` | String? | No | Ubicacion del parqueadero |
| `balconiesAndTerraces` | String? | No | Balcones y terrazas |
| `recreationalAreas` | String? | No | Areas recreativas |
| `commonZones` | String? | No | Zonas comunes (JSON string) |
| `status` | PropertyStatus | Si | `@default(ACTIVE)`: ACTIVE, INACTIVE, MAINTENANCE, SOLD |

**Relaciones**:
- `admins`: Admin[] via `"PropertyAdmins"` (muchos-a-muchos)
- `units`: Unit[] (1-a-muchos)

---

## 5. Unit

**Tabla**: `units`  
**Descripcion**: Unidad individual dentro de una propiedad (apartamento, local, oficina). `@unique([propertyId, unitNumber])`.

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | String | Si | `@id @default(cuid())` |
| `propertyId` | String | Si | FK a Property |
| `unitNumber` | String | Si | Numero de unidad |
| `floor` | Int? | No | Piso |
| `area` | Float? | No | Area en m² |
| `bedrooms` | Int | Si | `@default(0)`, habitaciones |
| `bathrooms` | Float | Si | `@default(0)`, banios |
| `furnished` | Boolean | Si | `@default(false)`, amoblado |
| `balcony` | Boolean | Si | `@default(false)` |
| `parking` | Boolean | Si | `@default(false)`, parqueadero incluido |
| `storage` | Boolean | Si | `@default(false)`, deposito |
| `petFriendly` | Boolean | Si | `@default(false)`, mascotas permitidas |
| `smokingAllowed` | Boolean | Si | `@default(false)` |
| `internet` | Boolean | Si | `@default(false)` |
| `cableTV` | Boolean | Si | `@default(false)` |
| `waterIncluded` | Boolean | Si | `@default(false)`, agua incluida |
| `gasIncluded` | Boolean | Si | `@default(false)`, gas incluido |
| `kitchen` | Boolean | Si | `@default(false)`, cocina privada |
| `sharedKitchen` | Boolean | Si | `@default(false)`, cocina compartida |
| `bathroom` | Boolean | Si | `@default(false)`, bano privado |
| `sharedBathroom` | Boolean | Si | `@default(false)`, bano compartido |
| `laundry` | Boolean | Si | `@default(false)`, lavanderia privada |
| `sharedLaundry` | Boolean | Si | `@default(false)`, lavanderia compartida |
| `livingRoom` | Boolean | Si | `@default(false)`, sala privada |
| `diningRoom` | Boolean | Si | `@default(false)`, comedor privado |
| `livingDiningRoom` | Boolean | Si | `@default(false)`, sala-comedor privado |
| `sharedLivingDiningRoom` | Boolean | Si | `@default(false)`, sala-comedor compartido |
| `status` | UnitStatus | Si | `@default(VACANT)` |
| `baseRent` | Float? | No | Canon base |
| `deposit` | Float? | No | Deposito requerido |
| `description` | String? | No | Descripcion |
| `images` | String | Si | JSON array de URLs de imagenes |
| `highlights` | Json? | No | Caracteristicas destacadas |
| `lastInspectionDate` | DateTime? | No | Ultima inspeccion |

**Enum UnitStatus**: `VACANT`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`, `UNAVAILABLE`

**Relaciones**:
- `property`: Property (Cascade delete)
- `contracts`: Contract[]
- `processes`: Process[] via `"ProcessUnit"`

---

## 6. Contract

**Tabla**: `contracts`  
**Descripcion**: Contrato de arrendamiento entre un inquilino y una unidad. Tiene un ciclo de vida con multiples estados. `@unique([unitId, startDate])`.

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | String | Si | `@id @default(cuid())` |
| `unitId` | String | Si | FK a Unit |
| `tenantId` | String | Si | FK a Tenant |
| `adminId` | String | Si | FK a Admin responsable |
| `rent` | Float | Si | Canon mensual |
| `deposit` | Float | Si | Deposito |
| `utilitiesIncluded` | Boolean | Si | `@default(false)`, servicios incluidos |
| `securityDeposit` | Float? | No | Deposito de seguridad |
| `lateFeePenalty` | Float? | No | % de penalizacion por mora |
| `gracePeriodDays` | Int | Si | `@default(5)`, dias de gracia |
| `startDate` | DateTime | Si | Fecha de inicio |
| `endDate` | DateTime | Si | Fecha de fin |
| `status` | ContractStatus | Si | `@default(INITIATED)` |
| `notes` | String? | No | Notas |
| `terms` | String? | No | Terminos |
| `autoRenewal` | Boolean | Si | `@default(false)`, renovacion automatica |
| `renewalPeriod` | Int? | No | Periodo de renovacion |
| `priority` | ContractPriority | Si | `@default(NORMAL)`: LOW, NORMAL, HIGH, URGENT |
| `estimatedCompletionDate` | DateTime? | No | Fecha estimada de finalizacion |
| `proposedRent` | Float? | No | Canon propuesto |
| `proposedDeposit` | Float? | No | Deposito propuesto |
| `proposedSecurityDeposit` | Float? | No | Deposito seguridad propuesto |
| `processDocuments` | String? | No | Documentos del proceso (JSON) |
| `rejectionReason` | String? | No | Razon de rechazo |
| `cancellationReason` | String? | No | Razon de cancelacion |
| `initiatedAt` | DateTime | Si | `@default(now())`, fecha inicio proceso |
| `reviewedAt` | DateTime? | No | Fecha de revision |
| `approvedAt` | DateTime? | No | Fecha de aprobacion |
| `signedAt` | DateTime? | No | Fecha de firma |
| `activatedAt` | DateTime? | No | Fecha de activacion |
| `terminatedAt` | DateTime? | No | Fecha de terminacion |
| `terminationReason` | String? | No | Razon de terminacion |

**Enum ContractStatus**:
- **Proceso**: `INITIATED` → `UNDER_REVIEW` → `DOCUMENTATION` → `APPROVED`
- **Contrato**: `DRAFT` → `PENDING` → `ACTIVE`
- **Finales**: `EXPIRED`, `RENEWED`, `TERMINATED`, `CANCELLED`, `REJECTED`

**Relaciones**:
- `unit`: Unit (Restrict delete - no se puede borrar unidad con contrato activo)
- `tenant`: Tenant (Restrict delete)
- `admins`: Admin[] via `"ContractAdmins"`
- `processes`: Process[] via `"ProcessContract"`
- `payments`: Payment[]
- `documents`: ContractDocument[]
- `additionalResidents`: User[] via `"AdditionalResidents"`

---

## 7. ContractDocument

**Tabla**: `contract_documents`  
**Descripcion**: Documentos asociados a un contrato.

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | String | Si | `@id @default(cuid())` |
| `contractId` | String | Si | FK a Contract |
| `fileName` | String | Si | Nombre del archivo |
| `fileType` | String | Si | Tipo MIME |
| `filePath` | String | Si | Ruta/URL del archivo |
| `fileSize` | Int | Si | Tamano en bytes |
| `documentType` | DocumentContractType | Si | Tipo de documento |
| `uploadedAt` | DateTime | Si | `@default(now())` |

**Enum DocumentContractType**: `TENANT_APPLICATION`, `INCOME_VERIFICATION`, `EMPLOYMENT_LETTER`, `BANK_STATEMENTS`, `REFERENCES_CHECK`, `CREDIT_REPORT`, `IDENTITY_DOCUMENTS`, `PROPERTY_INSPECTION`, `INSURANCE_PROOF`, `CONTRACT_SIGNED`, `TENANT_ID`, `INCOME_PROOF`, `REFERENCES`, `INVENTORY`, `PHOTOS`, `OTHER`

**Relacion**: `contract`: Contract (Cascade delete)

---

## 8. Payment

**Tabla**: `payments`  
**Descripcion**: Registro de pagos asociados a contratos.

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | String | Si | `@id @default(cuid())` |
| `contractId` | String | Si | FK a Contract |
| `amount` | Float | Si | Monto |
| `dueDate` | DateTime | Si | Fecha de vencimiento |
| `paidDate` | DateTime? | No | Fecha de pago |
| `paymentType` | PaymentType | Si | Tipo de pago |
| `status` | PaymentStatus | Si | `@default(PENDING)` |
| `paymentMethod` | PaymentMethod? | No | Metodo de pago |
| `transactionId` | String? | No | ID de transaccion externa |
| `receiptNumber` | String? | No | Numero de recibo |
| `lateFeeAmount` | Float? | No | Monto de penalizacion |
| `lateFeeApplied` | Boolean | Si | `@default(false)` |
| `reference` | String? | No | Referencia |
| `notes` | String? | No | Notas |

**Enum PaymentType**: `CANON`, `RENT`, `DEPOSIT`, `UTILITIES`, `MAINTENANCE`, `REPAIR`, `LATE_FEE`, `OTHER`

**Enum PaymentStatus**: `PENDING`, `PAID`, `OVERDUE`, `PARTIAL`, `CANCELLED`

**Enum PaymentMethod**: `CASH`, `BANK_TRANSFER`, `CHECK`, `CREDIT_CARD`, `DEBIT_CARD`, `DIGITAL_WALLET`, `OTHER`

**Relacion**: `contract`: Contract (Cascade delete)

---

## 9. Process

**Tabla**: `processes`  
**Descripcion**: Seguimiento del proceso de aplicacion de alquiler (wizard multi-paso del inquilino).

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | String | Si | `@id @default(cuid())` |
| `tenantId` | String? | No | FK a Tenant |
| `unitId` | String? | No | FK a Unit |
| `adminId` | String? | No | FK a Admin |
| `contractId` | String? | No | FK a Contract |
| `status` | ProcessStatus | Si | `@default(IN_PROGRESS)` |
| `currentStep` | Int | Si | `@default(1)`, paso actual del wizard |
| `payload` | Json? | No | Datos del proceso (JSON flexible) |
| `notes` | String? | No | Notas |

**Enum ProcessStatus**: `IN_PROGRESS`, `IN_EVALUATION`, `WAITING_FOR_FEEDBACK`, `APPROVED`, `DISAPPROVED`

**Relaciones**: `tenant`, `unit`, `admin`, `contract` (todos opcionales, SetNull en delete)

---

## 10. Notification

**Tabla**: `notifications`  
**Descripcion**: Notificaciones del sistema para admins e inquilinos.

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | String | Si | `@id @default(cuid())` |
| `tenantId` | String? | No | FK a Tenant |
| `adminId` | String? | No | FK a Admin |
| `senderRole` | NotificationSenderRole | Si | `@default(SYSTEM)` |
| `senderUserId` | String? | No | ID del usuario que envia |
| `type` | NotificationType | Si | `@default(GENERAL)` |
| `title` | String? | No | Titulo |
| `body` | String? | No | Cuerpo |
| `link` | String? | No | Link de accion |
| `metadata` | Json? | No | Metadatos adicionales |
| `readAt` | DateTime? | No | Fecha de lectura |

**Enum NotificationType**: `GENERAL`, `APPROVAL`, `REJECTION`, `PAYMENT_OVERDUE`, `REMINDER`

**Enum NotificationSenderRole**: `TENANT`, `ADMIN`, `SYSTEM`

**Relaciones**: `tenant` (Cascade delete), `admin` (SetNull en delete)

---

## 11. Reference

**Tabla**: `references`  
**Descripcion**: Referencias personales de un inquilino.

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | String | Si | `@id @default(cuid())` |
| `tenantId` | String | Si | FK a Tenant |
| `name` | String | Si | Nombre de la referencia |
| `phone` | String | Si | Telefono |
| `relationship` | String | Si | Relacion con el inquilino |

**Relacion**: `tenant`: Tenant (Cascade delete)

---

## Indices

| Tabla | Indices |
|-------|---------|
| `users` | `email`, `documentNumber`, `deletedAt`, `createdAt`, `lastLoginAt` |
| `units` | Unique: `[propertyId, unitNumber]` |
| `contracts` | Unique: `[unitId, startDate]` |

---

## Notas de Migracion SQLite → PostgreSQL

1. Cambiar `DATABASE_URL` a formato PostgreSQL
2. En `schema.postgresql.prisma`, los campos `Float` pueden requerir `@db.Decimal` para precision monetaria
3. `prisma.config.ts` selecciona automaticamente el schema correcto
4. Ejecutar `pnpm db:migrate` para crear las migraciones iniciales en PostgreSQL
5. Los JSON fields pueden comportarse diferente (SQLite los guarda como texto, PostgreSQL como JSONB)
