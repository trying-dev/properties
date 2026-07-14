# Plan: Owner, Liquidaciones y módulos futuros

> Estado: **TODAS las fases funcionales IMPLEMENTADAS (F0–F6)** (2026-07-15). Owner + confirmación pago + liquidación + dashboard dueño + inspecciones + mantenimiento + medidores + seguridad/docs + finanzas (predial/cartera/póliza) + motor de alertas. `Invoice` aplazado on-demand. **Deuda restante (no-fase):** migrar prod postgres (todo solo en sqlite local) · upload real de archivos (proofUrl/fileUrl hoy URL pegable) · elegir PSP para auto-confirmar pagos.
> Fase 1: modelo `Inspection` + UI `/dashboard/admin/inspections`. Fase 2: modelo `Maintenance` (costBearer) + UI `/dashboard/admin/maintenance`, con costos OWNER descontados en la liquidación. Ver §8 F1/F2.
> Fase 0.6 aplicada: rol `owner` en next-auth (3-way `admin>owner>tenant`), dashboard dueño `/dashboard/owner`, UI liquidación admin `/dashboard/admin/payouts` (generar + marcar pagado). Ver §7.
> Fase 0.5 aplicada: `Contract.commissionRate` (Float, default 10), modelo `OwnerPayout` + enum `PayoutStatus` + relación `Owner.payouts`, ambos schemas. Servicio en `src/actions/payouts/`: `calculateOwnerPayoutsForPeriod` (preview, no persiste), `generateOwnerPayoutsForPeriod` (upsert por ownerId+period, respeta payouts ya PAID), `getOwnerPayouts`, `markPayoutPaidAction`. Verificado contra dev.db (tibabuyes 60/40: gross 15.94M → neto 14.346M split correcto). Sin UI todavía (eso es F0.6). Sqlite pusheado; prod NO.
> Fase 0 aplicada: modelos `Owner` + `PropertyOwner`, relación en `User`/`Property`, campos baratos en `Property`/`Unit`/`Tenant`, en ambos schemas. Migrado a sqlite local + seed `seed-casa-tibabuyes-owners.ts` (2 dueños 60/40, gitignored). Prod (postgres) sin migrar todavía.
> Fase 0.4 aplicada: estado `REPORTED` + campos `reportedAt`/`proofUrl`/`confirmedAt`/`confirmedById` en `Payment` (ambos schemas). Actions `reportPaymentAction` (tenant) y `confirmPaymentAction` extendida (setea `confirmedAt`/`confirmedById`, acepta REPORTED) en `src/actions/payments/`. UI: botón "Reportar pago" en `tenant/units`, badge azul REPORTED + filtro unpaid en `admin/payments`. Sqlite migrado; prod NO. proofUrl aún sin upload real (se pasa opcional).
> Origen: comparación entre el modelo actual y el JSON maximalista `casas.txt` (plantilla que captura "todo lo imaginable" de un inmueble).

## 1. Principio rector

El JSON `casas.txt` tiene ~600 campos anidados. Es una **plantilla maximalista**: pretende capturar todo lo concebible de un inmueble. El ~90% nunca se llena en la práctica.

El modelo actual está **enfocado en arriendo** y eso es correcto. No se trata de copiar el JSON 1:1 (sería una explosión de tablas inmantenibles). Se trata de tomarlo como **catálogo de referencia** de qué se *podría* capturar.

**Regla de decisión** para cada campo/tabla nueva:

> ¿Voy a filtrar, reportar o mostrar esto en UI pronto?
> - Sí → columna o tabla real.
> - No, pero es detalle estructurado → columna `Json?`.
> - No → no se agrega.

Tres niveles de destino:
1. **Relacional** (tabla/columna): lo que se consulta, filtra o reporta.
2. **JSON column**: árbol profundo de detalle (espacios, componentes, ventanas, sensores). Ya se usa este patrón con `Property.commonZones` y `Unit.highlights`.
3. **Nada**: micro-detalle sin uso previsto.

## 2. Roles de persona

Hoy existen 3 roles colgando de `User` (patrón `User ──1:1── Rol`):

| Rol | Qué hace | Modelo | Estado |
|---|---|---|---|
| **Admin** | Opera/gestiona la propiedad (la compañía Properties) | `Admin` | ✅ existe |
| **Tenant** | Arrienda una unidad, paga canon | `Tenant` | ✅ existe |
| **Owner** | Dueño del inmueble; lo **inscribe** para que Properties lo gestione; recibe la liquidación mensual | — | ❌ **falta** |

### Por qué falta el Owner

Hoy `Property` no sabe de quién es. Solo sabe qué `Admin` la gestiona. Pero Admin ≠ dueño: Admin es el operador (la inmobiliaria); el dueño es un tercero que inscribió su propiedad.

Consecuencias de no tenerlo:
- No se sabe a quién pagarle el neto del arriendo.
- No hay reporte "cuánto le debo al dueño X este mes".
- No se maneja copropiedad (varios dueños con % de participación).
- No hay datos de contacto/legales del dueño.
- El dueño no puede ver sus pagos en la app.

## 3. Flujo de negocio 
```
Pierna 1:  Tenant ──reporta pago──▶ Properties ──confirma/recibe──▶ pago validado   ← Payment existe, PERO falta el flujo de confirmación
Pierna 2:  Properties ──neto (canon − comisión)──▶ Owner                             ← FALTA (liquidación / payout)
```

La **pierna 1** hoy solo tiene estados (`PENDING`/`PAID`); no hay flujo de "el tenant reporta que pagó → Properties lo confirma/recibe". Ver §5.4.

Ejemplo (dueño único):

```
Unidad C3-301 · canon cobrado al tenant: 3.500.000
comisión Properties (10%):                  350.000
neto a liquidar al dueño:                  3.150.000
Owner único Juan (100%)  →  pagar 3.150.000
```

Copropiedad 50/50 → 1.575.000 a cada dueño según `participacion`.

## 4. Roadmap por fases

Priorizado por **valor de negocio (arriendo) × costo/dependencias**, no por qué tan lleno se ve en el JSON.

| Fase | Módulo | Depende de | Por qué ese orden |
|---|---|---|---|
| **0** | Owner + participación + campos baratos | — | Sin dependencias; tapa el hueco más grave (no se sabe dueños). |
| **0.4** | Confirmación / recepción de pagos (tenant → Properties) | Payment | Pierna 1 completa: el tenant reporta, Properties confirma. Extiende Payment. |
| **0.5** | Liquidación / payout al dueño | Owner, Payment | Es la "pierna 2"; da el valor real que pide el negocio. |
| **0.6** | Dashboard de dueño | Owner, Liquidación | El dueño ve sus propiedades y pagos mensuales. |
| **1** | Inspecciones (evaluación/diagnóstico antes de entregar + recepción) | Unit, Contract | Diagnóstico del estado antes de entregar la unidad; clave para disputas de depósito. Árbol `espacios` como JSON. |
| **2** | Mantenimiento (correctivo + planes preventivos) + órdenes de trabajo | Unit (opcional: hallazgos de inspección) | Operativo recurrente; los planes preventivos definen responsabilidades administrativas (quién asume el costo). |
| **3** | Medidores | Unit / Property | Lecturas de servicios, reparto de consumo. Valor medio. |
| **4** | Seguridad + Documentación | Property | Cumplimiento/legal, baja frecuencia. On-demand. |
| **5** | Finanzas avanzadas (mora/cartera, seguro, impuestos, facturación) | Payment, Owner, Contract | Cartera y costos del dueño (predial) alimentan la liquidación; póliza/factura son legales. |
| **6** | Motor de alertas / vencimientos | Notification + varios | Transversal: avisa vencimientos (póliza, recarga extintor, mantenimiento, mora). Se construye al final porque consume datos de todas las fases. |

> Nota estructural: `estructura` multi-torre (edificio/torre/bloque) se trata como campos opcionales en `Property`/`Unit` (§5.3), no como fase; solo relevante para conjuntos multi-torre.

---

## 5. Fase 0 — detalle de diseño

### 5.1 Modelos nuevos (borrador Prisma)

> Se debe replicar en **ambos** schemas: `schema.postgresql.prisma` y `schema.sqlite.prisma` (se mantienen sincronizados a mano). En sqlite no hay `@db.Decimal`; usar `Float` como ya se hace.

```prisma
// Dueño: persona que inscribe su propiedad para que Properties la gestione.
model Owner {
  id     String @id @default(cuid())
  userId String @unique

  // Datos de inscripción
  enrolledAt   DateTime  @default(now()) // cuándo inscribió con Properties
  active       Boolean   @default(true)

  // Preferencias de pago (a quién/cómo se le liquida)
  payoutMethod  String?  // BANK_TRANSFER, etc. (enum futuro)
  bankAccount   String?  // datos de cuenta para el payout

  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  properties PropertyOwner[]  // participación en propiedades
  payouts    OwnerPayout[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("owners")
}

// Tabla puente: qué dueño posee qué propiedad y con qué %.
model PropertyOwner {
  id         String @id @default(cuid())
  ownerId    String
  propertyId String

  participation Float    @default(100) // % de participación (copropiedad)
  startDate     DateTime @default(now())
  endDate       DateTime?
  active        Boolean  @default(true)

  owner    Owner    @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@unique([ownerId, propertyId])
  @@index([propertyId])
  @@index([ownerId])
  @@map("property_owners")
}
```

### 5.2 Cambios en modelos existentes

`Property` gana la relación inversa:

```prisma
model Property {
  // ...
  owners PropertyOwner[]
  // ...
}
```

`User` gana el rol (junto a `admin` y `tenant`):

```prisma
model User {
  // ...
  owner Owner?
  // ...
}
```

### 5.3 Campos baratos (mejoras directas, sin módulo)

Campos del JSON que tienen valor y van directo en tablas existentes. **Todos opcionales** para no romper datos actuales.

`Property`:
- `stratum Int?` (estrato) — filtro/reporte común en Colombia
- `district String?` (localidad, distinto de barrio)
- `constructionYear Int?` (anioConstruccion)
- `commercialValue Float?` / `cadastralValue Float?` (valorComercial/valorCatastral)
- `structuralMaterial String?` (materialEstructural)

`Unit`:
- `privateArea Float?` / `commonArea Float?` (areaPrivada/areaComun; hoy solo `area`)
- `internalCode String?` / `qrCode String?` (codigoInterno/codigoQR)

`Tenant`:
- `pets Json?` (mascotas)
- `vehicles Json?` (vehículos)
- `authorizedContacts Json?` (contactosAutorizados)

> **Decidido:** `commissionRate` (comisión de Properties) vive en **`Contract`** como `Float` editable, se fija al firmar cada arriendo. Ver §5.5.

### 5.5 Comisión en el contrato (decidido)

La comisión de Properties se define **por contrato** (no global ni por propiedad):

```prisma
model Contract {
  // ...
  commissionRate Float @default(10) // % que retiene Properties; editable al firmar
  // ...
}
```

- Se fija al crear/firmar el contrato; puede variar por inquilino/negociación.
- Alimenta la liquidación (§6): `netAmount = grossAmount − (grossAmount × commissionRate/100)`, luego repartido por `participation`.
- Default sugerido `10` (%), editable.

### 5.4 Confirmación / recepción de pagos (Fase 0.4) — ✅ IMPLEMENTADA

> Aplicado 2026-07-14: enum `REPORTED` + campos `reportedAt`/`proofUrl`/`confirmedAt`/`confirmedById` en ambos schemas. `reportPaymentAction` valida que el pago sea del tenant autenticado y no esté ya PAID. `confirmPaymentAction` setea `confirmedAt`/`confirmedById` desde la sesión. Migrar prod pendiente.
>
> **Comprobante / fuente de la confirmación (decisión abierta 2026-07-14):** la app hoy no tiene upload real (los "archivos" del proceso son mocks). Evaluado de dónde debe venir el comprobante: (a) upload manual en app, (b) parseo de email bancario, (c) webhook de pasarela de pago (PSE/Wompi/Mercado Pago). **Recomendación: pasarela (PSP) como objetivo** → el webhook auto-confirma (pago → `PAID` directo, sin subir ni verificar a mano) y concilia de verdad; el email bancario se descarta por frágil/falsificable. **Interino:** mantener REPORTED→confirmación manual y `proofUrl` como campo URL pegable (sin storage propio). NO construir upload a disco. Pendiente: confirmar PSP e integrar webhook.

**Problema:** el modelo `Payment` actual tiene `status` (`PENDING`/`PAID`/`OVERDUE`/`PARTIAL`/`CANCELLED`), `paidDate`, `receiptNumber`, `transactionId`. Pero **no modela el flujo de confirmación**: el seed pone `PAID` directo. En la realidad el tenant reporta que pagó (sube comprobante) y Properties lo **recibe/confirma**. Es el `verificacionPagos` del JSON.

**Flujo objetivo:**

```
Tenant marca "ya pagué" + sube comprobante   →  status REPORTED
Properties revisa                            →  confirma (PAID) o rechaza (vuelve a PENDING)
```

**Diseño (extender Payment, no tabla nueva):**

Nuevo estado en `PaymentStatus`:
```prisma
enum PaymentStatus {
  PENDING     // sin reportar
  REPORTED    // tenant reportó pago, en espera de confirmación   ← NUEVO
  PAID        // confirmado por Properties
  OVERDUE
  PARTIAL
  CANCELLED
}
```

Campos nuevos en `Payment` (todos opcionales):
```prisma
  reportedAt    DateTime? // cuándo el tenant reportó el pago
  proofUrl      String?   // comprobante subido por el tenant
  confirmedAt   DateTime? // cuándo Properties confirmó
  confirmedById String?   // Admin que confirmó (verificadoPor del JSON)
```

Alternativa (si se quiere auditoría fuerte, varias verificaciones): tabla `PaymentConfirmation` separada espejando `verificacionPagos` (`verificadoPor`, `fechaVerificacion`, `resultado`, `observaciones`). Se prefiere extender `Payment` salvo que se necesite historial de intentos.

> El seed de tibabuyes hoy crea pagos ya `PAID`. Al implementar, se puede dejar así para históricos y usar el flujo `REPORTED → PAID` solo para pagos nuevos/futuros.

---

## 6. Fase 0.5 — Liquidación / payout — ✅ IMPLEMENTADA

> Aplicado 2026-07-14. Schema tal cual el borrador de abajo + `Contract.commissionRate Float @default(10)` + `@@unique([ownerId, period])` en OwnerPayout. Lógica en `src/actions/payouts/index.ts`:
> - Solo cuenta `Payment` PAID de tipo CANON/RENT con `dueDate` dentro del mes del periodo.
> - Comisión por contrato (`commissionRate`), no global. Bruto/comisión de la propiedad = suma por contrato.
> - Reparto entre dueños según `PropertyOwner.participation` (solo `active`).
> - `generateOwnerPayoutsForPeriod` no recalcula payouts ya `PAID` (el pago al dueño ya ocurrió).
> - Pendiente: descuento de costos del dueño (mantenimiento F2, predial F5) — pasos 4 de abajo aún no aplicado; UI (F0.6).

```prisma
// Liquidación mensual a un dueño: canon cobrado − comisión = neto.
model OwnerPayout {
  id      String @id @default(cuid())
  ownerId String

  period       String   // "2026-07" (mes liquidado)
  grossAmount  Float    // canon cobrado atribuible a este dueño
  commission   Float    // comisión Properties
  netAmount    Float    // neto a pagar (gross − commission), ajustado por participación

  status    PayoutStatus @default(PENDING)
  paidDate  DateTime?
  reference String?      // comprobante/transacción

  owner Owner @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerId])
  @@index([period])
  @@index([status])
  @@map("owner_payouts")
}

enum PayoutStatus {
  PENDING
  PAID
  ON_HOLD
}
```

Lógica de cálculo (fuera del schema, en servicio):
1. Por periodo, sumar `Payment` confirmados (`PAID`) de las unidades de la propiedad.
2. Aplicar la comisión de cada contrato (`Contract.commissionRate`) sobre su canon → neto por unidad.
3. Repartir el neto de la propiedad entre dueños según `PropertyOwner.participation`.
4. Descontar costos que asuma el dueño (mantenimientos §Fase 2, predial §Fase 5).
5. Generar un `OwnerPayout` por dueño.

## 7. Fase 0.6 — Dashboard de dueño — ✅ IMPLEMENTADA

> Aplicado 2026-07-14.
> - **Auth 3-way**: rol `'owner'` añadido (`admin > owner > tenant`) en `src/lib/auth.ts` (2 callbacks + query), `src/types/next-auth.d.ts`, `src/hooks/useSession.ts`, `PropertyCard`. `dashboard/page.tsx` redirige owner → `/dashboard/owner`.
> - **Dashboard dueño** `/dashboard/owner` ([page](../../src/app/dashboard/owner/page.tsx)): resumen (nº props, por cobrar, cobrado), tarjetas de propiedades (participación %, ocupación) y tabla de liquidaciones (periodo, bruto, comisión, neto, estado). Action `getOwnerDashboard` en `src/actions/owner/`.
> - **UI liquidación admin** `/dashboard/admin/payouts` ([page](../../src/app/dashboard/admin/payouts/page.tsx)): selector propiedad + periodo → "Generar liquidación" (`generateOwnerPayoutsForPeriod`), listado de payouts con "Marcar pagado" (`markPayoutPaidAction`). Card en el home de admin. Actions `getPropertiesWithOwners`/`getAllPayouts` en payouts.
> - Verificado end-to-end contra dev.db (tibabuyes). Falta: upload de comprobante (proofUrl F0.4), descuento de costos del dueño (F2/F5), migrar prod.

El dueño (rol Owner) entra a la app y ve:
- Sus propiedades y unidades (via `PropertyOwner`).
- Estado de ocupación de cada unidad.
- Pagos mensuales recibidos (sus `OwnerPayout`): periodo, bruto, comisión, neto, estado.
- Historial y comprobantes.

Requiere: autenticación/rol Owner en el sistema de auth actual (revisar `next-auth`), rutas y vistas nuevas. Se especifica en detalle cuando lleguemos a esta fase.

---

## 8. Módulos futuros (specs breves, se detallan al llegar)

### Fase 1 — Inspecciones — ✅ IMPLEMENTADA (2026-07-14)
- **Momento clave:** cuando se va a alquilar, se hace una **evaluación/diagnóstico del estado de la propiedad/unidad antes de entregarla** al tenant. Referencia entrega vs. devolución (disputas de depósito).
- **Modelo `Inspection`** (ambos schemas): `type` (`ENTREGA`/`RECEPCION`/`PERIODICA`/`DIAGNOSTICO`), `status` (`SCHEDULED`/`IN_PROGRESS`/`COMPLETED`/`CANCELLED`), `scheduledDate`/`performedDate`, `inspectorId`, `overallCondition` (`GOOD`/`FAIR`/`POOR`), `score` (%), `criticalFindings Int` (promovido para filtrar/alertar), `payload Json?` (árbol espacios/hallazgos), `notes`. Relación `Unit` (cascade) y `Contract?` (setNull). `Unit`/`Contract` ganan `inspections Inspection[]`.
- El árbol `espacios` (cuartos → ventanas/puertas/componentes/mediciones) va en **`payload Json`**, no tablas. Hallazgos críticos promovidos a `criticalFindings`.
- **Actions** `src/actions/inspections/`: `getUnitInspections`, `getInspection`, `getAdminInspections`, `getAdminUnitsForSelect`, `createInspectionAction`, `completeInspectionAction` (→ COMPLETED + actualiza `Unit.lastInspectionDate`), `cancelInspectionAction`. Todas validan que el admin gestione la unidad.
- **UI** `/dashboard/admin/inspections`: crear (unidad/tipo/fecha/notas), listar, completar inline (estado/score/críticos), cancelar. Card en admin home.
- Verificado end-to-end contra dev.db. **Pendiente:** los findings que originan mantenimientos se conectan en **F2**; UI para editar el árbol `payload` (hoy se guarda vía action, sin editor visual); migrar prod.

### Fase 2 — Mantenimiento — ✅ IMPLEMENTADA (2026-07-14)
- **Modelo único `Maintenance`** (ambos schemas): `type` (`CORRECTIVE`/`PREVENTIVE`/`INCIDENT`), `status` (`PENDING`/`SCHEDULED`/`IN_PROGRESS`/`COMPLETED`/`CANCELLED`), `costBearer` (`CostResponsibility` OWNER/TENANT/PROPERTIES, **default OWNER**), `title`/`description`, orden de trabajo inline (`provider`/`diagnosis`/`solution`), `cost`, `scheduledDate`/`completedDate`, recurrencia preventiva (`recurrenceMonths`/`nextDueDate`), incidente (`severity`/`estimatedLoss`). Relación `Unit` (cascade) + `Inspection?` (setNull, para el finding origen). `Unit`/`Inspection` ganan `maintenances[]`.
- **Decisión de diseño:** se descartó tabla `WorkOrder` aparte — los datos de la orden van inline en `Maintenance` (principio §1, evitar explosión de tablas). Planes preventivos = `recurrenceMonths`/`nextDueDate` en el mismo modelo, no tabla `MaintenancePlan` separada.
- **Liquidación (§6) conectada:** `calculateOwnerPayoutsForPeriod` descuenta los `Maintenance` con `status=COMPLETED` y `costBearer=OWNER` cuyo `completedDate` cae en el mes, antes de repartir. `PayoutComputation` gana `propertyOwnerCosts` y cada línea `ownerCosts`. Verificado: OWNER 1M → net baja 1M, repartido por participación; TENANT/PROPERTIES no descuentan.
- **Incidentes** = `type: INCIDENT` con `severity`/`estimatedLoss`, no módulo aparte.
- **Actions** `src/actions/maintenance/`: `getAdminMaintenances`, `getUnitMaintenances`, `createMaintenanceAction`, `completeMaintenanceAction` (→ COMPLETED, `completedDate`, costo real, `nextDueDate` si recurrente; revalida payouts), `cancelMaintenanceAction`. Validan admin gestiona la unidad.
- **UI** `/dashboard/admin/maintenance`: crear (unidad/tipo/costBearer/título/proveedor/costo/fecha), listar, completar inline (costo real/solución), cancelar. Card en admin home.
- **Pendiente:** UI para vincular finding de inspección (`inspectionId` soportado en action, sin selector en UI); `OwnerPayout` no persiste el desglose de costos (solo el neto ya descontado); migrar prod.

### Fase 3 — Medidores — ✅ IMPLEMENTADA (2026-07-15)
- **Modelos** (ambos schemas): `Meter` (`type` `MeterType` WATER/ELECTRICITY/GAS/OTHER, `serial`, `provider`, `unitOfMeasure`, `active`, relación `Property` cascade + `Unit?` setNull — `unitId` null = medidor general/zona común) + `MeterReading` (`value` acumulado, `readingDate`, `consumption`, `notes`, relación `Meter` cascade). `Property.meters`/`Unit.meters`.
- **Consumo**: `addMeterReadingAction` calcula `consumption = value − última lectura previa (≤ fecha)`; null si no hay previa o si retrocede (reinicio/cambio de medidor), evitando negativos.
- **Actions** `src/actions/meters/`: `getAdminMeters` (incluye últimas 12 lecturas), `getAdminUnitsWithProperty` (filtrar unidades por propiedad en el selector), `createMeterAction` (valida unidad∈propiedad), `addMeterReadingAction`, `toggleMeterActiveAction`, `deleteMeterAction`. Guard admin-gestiona-propiedad.
- **UI** `/dashboard/admin/meters`: crear medidor (propiedad/unidad opcional/tipo/serial/empresa/medida), tarjetas con última lectura, panel de lecturas inline (registrar + historial con consumo), activar/desactivar/eliminar. Card admin home.
- Verificado end-to-end (100→135 = consumo 35; retroceso → null; cascade delete de lecturas). **Pendiente:** migrar prod. Reparto de consumo a inquilinos = on-demand (no se construyó).

### Fase 4 — Seguridad + Documentación — ✅ IMPLEMENTADA (2026-07-15)
- **Seguridad** — modelo `SecurityDevice` (ambos schemas): `type` (`SecurityDeviceType` EXTINGUISHER/CAMERA/ALARM/DETECTOR/OTHER), `location`, `brand`, `nextServiceDate` (recarga/servicio → alerta F6), `active`, `payload Json?` (detalle profundo, patrón §1), relación `Property` cascade + `Unit?` setNull (null = zona común). Actions `src/actions/security/` (create/toggleActive/delete/list, guard admin-propiedad, valida unidad∈propiedad). UI `/dashboard/admin/security` (aviso próx. servicio ≤30 d) + card.
- **Documentación** — modelo `PropertyDocument` (ambos schemas): `type` (`PropertyDocumentType` DEED/TRADITION_CERT/TAX_RECEIPT/POLICY/FLOOR_PLAN/OTHER), `name`, `fileUrl` (URL pegable, **sin storage propio** — mismo interino que proofUrl F0.4), `issuedDate`, `expiryDate` (cert. tradición vence → alerta F6), relación `Property` cascade + `Unit?` setNull. Enum se llama `PropertyDocumentType` para no chocar con `DocumentType` (docs de usuario). **NO** se ligó a `Contract` (ya tiene `ContractDocument`). Actions `src/actions/documents/` (create/delete/list). UI `/dashboard/admin/documents` (link externo + aviso vence ≤30 d) + card.
- Verificado end-to-end (device con payload Json roundtrip; document con fileUrl/expiry). **Pendiente:** upload real de archivos (hoy URL pegable), migrar prod.

### Fase 5 — Finanzas avanzadas
Cuatro piezas del bloque `finanzas` del JSON. Estado: **F5a Predial + F5b Cartera + F5c Póliza ✅ IMPLEMENTADAS (2026-07-15)**; `Invoice` aplazado.
- **Impuestos** (`finanzas.impuestos`, predial) — ✅ **F5a IMPLEMENTADA**: modelo `PropertyTax` (ambos schemas): `year`, `amount`, `status` (`TaxStatus` PENDING/PAID/OVERDUE), `dueDate`, `paidDate`, `reference`, relación `Property` (cascade). Actions `src/actions/property-tax/` (create/markPaid/delete/list + `getAdminPropertiesForSelect`, guard admin-gestiona-propiedad). **Descuento en liquidación conectado**: `calculateOwnerPayoutsForPeriod` resta `PropertyTax` PAID cuyo `paidDate` cae en el mes (`propertyTaxCosts` + `line.taxCosts`), antes de repartir. UI `/dashboard/admin/property-tax` (crear/listar/marcar pagado inline/eliminar) + card admin home. Verificado end-to-end (predial 1M → net baja 1M split 60/40). Reemplazó el `// TODO F5` en payouts. Pendiente: migrar prod.
- **Mora / cartera** (`finanzas.mora`) — ✅ **F5b IMPLEMENTADA**: **derivado sin tabla** (§9). Action `getArrearsReport` en `src/actions/arrears/` agrupa por contrato los `Payment` impagos (`PENDING`/`REPORTED`/`OVERDUE`/`PARTIAL`) con `dueDate < now` de las propiedades del admin: cuotas vencidas, total, recargos (`lateFeeAmount`), cuota más antigua, días de atraso. UI `/dashboard/admin/arrears` (tiles total vencido/recargos/contratos + tabla con severidad por días) + card home. Verificado (pago vencido temporal 45 d → fila correcta). Sin cambios de schema.
- **Seguro / póliza** (`finanzas.poliza`) — ✅ **F5c IMPLEMENTADA**: modelo `InsurancePolicy` (ambos schemas): `insurer`, `policyNumber`, `coverage`, `amount`, `premium`, `startDate`, `endDate`, `status` (`PolicyStatus` ACTIVE/EXPIRED/CANCELLED), relación `Property` (cascade) + `Contract?` (setNull). `Property.policies`/`Contract.policies`. Actions `src/actions/insurance/` (create/updateStatus/delete/list, guard admin-propiedad). UI `/dashboard/admin/insurance` (crear/listar/marcar vencida/eliminar, aviso "vence en N d" ≤30 d) + card home. `endDate` alimentará alertas de vencimiento en **F6**. Verificado (create→list→EXPIRED→delete). Pendiente: migrar prod.
- **Facturación** (`finanzas.facturas`): modelo `Invoice` — **aplazado/on-demand (§9)**. Solo si se requiere facturación legal formal.

### Fase 6 — Motor de alertas / vencimientos — ✅ IMPLEMENTADA (2026-07-15)
- **Sin tabla nueva** (§8): genera `Notification` (tipo `REMINDER`) desde un job. `src/lib/alerts/expirations.ts`:
  - `scanExpirations(date, windowDays=30)`: escanea **5 fuentes** con fecha de vencimiento dentro de la ventana (o vencidas) → `ExpirationItem[]` ordenado por urgencia: **pólizas** `endDate` (F5c) · **seguridad** `nextServiceDate` (F4) · **documentos** `expiryDate` (F4) · **mantenimiento preventivo** `nextDueDate` (F2) · **predial** `dueDate` PENDING/OVERDUE (F5a). Derivado, no escribe.
  - `generateExpirationAlerts()`: crea notificaciones a los admins de cada propiedad. **Idempotente**: dedupe por `link` (incluye id + fecha `due=YYYY-MM-DD`, así una renovación con nueva fecha vuelve a avisar).
- **Cron** `/api/cron/alerts` (ya existía para pagos) ahora también corre `generateExpirationAlerts`; schedule diario en `vercel.json` (`5 5 * * *`). La mora/pago vencido siguen en `generatePaymentAlerts` (`src/lib/payments/alerts.ts`).
- **Action** `getUpcomingExpirations(windowDays)` (filtra a las propiedades del admin) + **UI** `/dashboard/admin/alerts` (lista con severidad por días, links a cada módulo) + card admin home.
- Verificado end-to-end (3 fuentes creadas → scan ordena por urgencia TAX −3/SECURITY 5/POLICY 10; run1 notifica 3, run2 notifica 0 idempotente). **Roadmap funcional cerrado.**

---

## 8b. Auditoría transversal y estructura (mejoras cross-cutting)

No son fases; son ajustes que tocan varios modelos. Se aplican gradualmente.

### Campos de auditoría
Hoy los modelos tienen solo `createdAt`/`updatedAt` (y `User` además `deletedAt`). El JSON (`auditoria`) sugiere estandarizar:
- `createdById String?` / `updatedById String?` — quién creó/modificó (creadoPor/modificadoPor).
- `deletedAt DateTime?` — soft delete uniforme en modelos de negocio (Property, Unit, Contract, Payment…), no solo `User`.
- `version Int @default(1)` — opcional, solo donde interese optimistic locking.

> El log técnico fila-por-fila (`bitacoraAuditoria`, `bitacoraAccesos`) NO se modela a mano — si se necesita, usar extensión/middleware de Prisma o auditoría a nivel DB. Igual `versiones`/`cambiosEstado`: over-engineering para hoy.

### Estructura multi-torre
`estructura` del JSON (empresa/conjunto/edificio/torre/bloque). Solo relevante si se gestionan conjuntos con varias torres. Tratar como campos opcionales:
- `Property`: `complex String?` (conjunto), `building String?` (edificio).
- `Unit`: `tower String?`, `block String?` (ya existe `floor`).

Mientras cada `Property` sea un edificio plano, no se necesita.

---

## 9. Decisiones

### Tomadas
- **Comisión** → vive en `Contract.commissionRate` (`Float`, default 10%, editable al firmar). §5.5.
- **Confirmación de pago** → **extender `Payment`** (estado `REPORTED` + `reportedAt`/`proofUrl`/`confirmedAt`/`confirmedById`), no tabla aparte. §5.4.
- **Confirmación de pago — origen** (2026-07-14): el tenant reporta desde la app (`reportPaymentAction` + botón en `tenant/units`) y Properties confirma (`confirmPaymentAction` en `admin/payments`). Falta solo el upload real de comprobante (proofUrl hoy opcional sin archivo).
- **Dashboard de dueño — ubicación** (2026-07-14): **misma app**, área nueva `/dashboard/owner` (mismo patrón que `admin`/`tenant`). No app separada. Detalle en F0.6.
- **Auth rol Owner** (2026-07-14): rol pasa a ser **3-way** con prioridad `admin > owner > tenant`: `role = user.admin ? 'admin' : user.owner ? 'owner' : 'tenant'`. Extender la unión `'admin'|'tenant'` a `'owner'` en `src/types/next-auth.d.ts` + los 2 callbacks de `src/lib/auth.ts` + incluir `owner` en el query de usuario. Un usuario dueño-y-tenant solo verá un rol (aceptable ahora; multi-rol si se necesita después).
- **Responsabilidad de costos de mantenimiento** (2026-07-14): **Properties siempre gestiona** (ejecuta/coordina); el **costo** se marca por ítem con `Maintenance.costBearer: CostResponsibility { OWNER, TENANT, PROPERTIES }`, **default OWNER** (editable al registrar). `OWNER` → se descuenta del payout (§6 paso 4); `TENANT` → daño causado por el inquilino, se le cobra; `PROPERTIES` → lo asume la inmobiliaria. Implementación en F2; ahora solo el concepto. **A reevaluar en F2:** hacer el campo obligatorio (sin default) para forzar atribución consciente, ya que el descuento toca plata del dueño; por ahora default OWNER por menor fricción.
- **Facturación** (2026-07-14): **aplazada / on-demand**. `Payment` ya tiene `receiptNumber`/`transactionId`/`reference`; no se crea modelo `Invoice` (numeración fiscal + PDF) hasta que el negocio exija factura legal formal. Se reevalúa en F5.
- **Mora** (2026-07-14): **cálculo derivado, sin tabla**. Cartera = query de `Payment` OVERDUE; `Contract.lateFeePenalty` (%) + `Payment.lateFeeAmount`/`lateFeeApplied` ya existen. No se persiste tabla `mora`. Intereses solo si el negocio confirma tasa; opcional flag `Contract.arrearsStatus` si se quiere marcar AL_DIA/EN_MORA. Se afina en F5.
- **Soft delete** (2026-07-14): **selectivo, no uniforme**. `deletedAt` solo en `Property`/`Unit`/`Contract` (historia/FK que no se quiere perder). `Payment`/`OwnerPayout` **nunca** se borran (registro financiero; usar `CANCELLED`/`ON_HOLD`). Resto, borrado duro. Se aplica al tocar cada modelo, no como fase.

### Pendientes
- **Fuente del comprobante / confirmación de pago** (abierta 2026-07-14): pasarela PSP (recomendado, auto-confirma) vs email banco (descartado) vs upload app. Interino = URL pegable, sin storage. Falta elegir PSP e integrar webhook. Ver §5.4.
- ✅ Costos del dueño en liquidación → **implementado en F2** (2026-07-14): `Maintenance.costBearer=OWNER` COMPLETED del periodo se descuenta en `calculateOwnerPayoutsForPeriod`. `costBearer` quedó con **default OWNER** (no obligatorio); reevaluar hacerlo obligatorio si aparecen descuentos mal atribuidos.

## 10. Cuando se implemente (checklist técnico)

- [ ] Editar `schema.postgresql.prisma` **y** `schema.sqlite.prisma` (sincronizados).
- [ ] `prisma generate` + `prisma db push` (o `migrate dev`).
- [ ] Extender seed de tibabuyes: crear Owner(s), enlazar a la propiedad con participación, generar payouts de ejemplo.
- [ ] Registrar nuevos seeds en `prisma/seed/si/index.ts` si aplica.
- [ ] `graphify update .` para refrescar el grafo.
