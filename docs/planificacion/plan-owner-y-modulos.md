# Plan: Owner, Liquidaciones y módulos futuros

> Estado: **Fases 0, 0.4, 0.5 y 0.6 IMPLEMENTADAS** (2026-07-14). Ciclo Owner completo end-to-end. Resto en planeación.
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

> Aplicado 2026-07-14: enum `REPORTED` + campos `reportedAt`/`proofUrl`/`confirmedAt`/`confirmedById` en ambos schemas. `reportPaymentAction` valida que el pago sea del tenant autenticado y no esté ya PAID. `confirmPaymentAction` setea `confirmedAt`/`confirmedById` desde la sesión. Falta: upload real de comprobante (proofUrl); migrar prod.

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

### Fase 1 — Inspecciones (evaluación / diagnóstico antes de entregar)
- **Momento clave:** cuando se va a alquilar, se hace una **evaluación/diagnóstico del estado de la propiedad/unidad antes de entregarla** al tenant. Es el punto de referencia para saber en qué estado se entregó vs. en qué estado se devuelve (disputas de depósito).
- Modelo `Inspection`: tipo (`ENTREGA` / `RECEPCION` / `PERIODICA` / `DIAGNOSTICO`), estado, fechas, responsable, resultado (semáforo/%).
- Ligado a `Unit` y opcionalmente `Contract` (la inspección de entrega ancla el inicio del contrato).
- El árbol `espacios` del JSON (cuartos → ventanas/puertas/componentes/mediciones) va como **`payload Json`**, no tablas.
- Genera **hallazgos** (findings) que pueden originar mantenimientos u órdenes de trabajo (Fase 2).
- Campos promovibles a columna solo si se filtran (ej. hallazgos críticos).

### Fase 2 — Mantenimiento (correctivo + planes preventivos) + órdenes de trabajo
- `Maintenance` (correctivo/preventivo, costos, proveedor) y `WorkOrder` (estado, técnico, diagnóstico, solución).
- **Planes de mantenimiento preventivo:** calendario/recurrencia por unidad o propiedad (ej. revisar cubierta cada 6 meses, pintar cada 2 años). Sirve para anticipar y presupuestar.
- **Responsabilidades administrativas:** cada mantenimiento/plan indica **quién asume el costo** — Owner, Tenant o Properties. Esto aclara las obligaciones de cada parte y alimenta la liquidación (§6) cuando el costo lo asume el dueño (se descuenta del neto) o Properties.
- **Incidentes** (inundación, daño súbito, etc.) se pliegan aquí: son un `type: INCIDENTE` dentro de `Maintenance`/`WorkOrder` con nivel de impacto y pérdidas estimadas, no un módulo aparte.
- Ligado a `Unit`; opcional link a un hallazgo de inspección (Fase 1).

### Fase 3 — Medidores
- `Meter` (tipo agua/luz/gas, serial, empresa, lecturas). Historial de lecturas.
- Ligado a `Unit`/`Property`.

### Fase 4 — Seguridad + Documentación
- Inventario de seguridad (extintores, cámaras, alarmas, detectores) — mayormente `Json` salvo lo que requiera alertas de vencimiento.
- Documentación legal (escritura, certificado tradición, predial, pólizas) — metadatos + rutas de archivo.

### Fase 5 — Finanzas avanzadas
Cuatro piezas del bloque `finanzas` del JSON que hoy no existen:
- **Mora / cartera** (`finanzas.mora`): días de atraso, valor, intereses, estado (`AL_DIA`/`EN_MORA`). Se **deriva** de `Payment` vencidos (no siempre tabla; puede ser cálculo + un `Contract.arrearsStatus`). `Payment` ya tiene `lateFeeAmount`/`lateFeeApplied`; falta el reporte de cartera y los intereses.
- **Seguro / póliza** (`finanzas.poliza`): modelo `InsurancePolicy` (aseguradora, número, cobertura, vigencia, valor, estado). Ligado a `Property` o `Contract`. Vencimiento → alerta (Fase 6).
- **Impuestos** (`finanzas.impuestos`, predial): modelo `PropertyTax` (año, valor, estado, fecha límite). **Costo del dueño** → se descuenta de la liquidación (§6). Ligado a `Property`.
- **Facturación** (`finanzas.facturas`): modelo `Invoice` (número, fecha, concepto, valor, estado) para factura legal emitida. Solo si se requiere facturación formal.

### Fase 6 — Motor de alertas / vencimientos
- Transversal. Genera avisos cuando algo vence o requiere acción: póliza por vencer, recarga de extintor, mantenimiento preventivo programado, pago en mora, batería de sensor.
- Se apoya en el modelo `Notification` existente + una capa de reglas/cron (ver `docs/cron-payments.md` como patrón de tarea programada).
- No inventar tabla de "alerta" hasta confirmar que se necesita historial; puede ser generación de `Notification` desde un job.

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
- (ninguna decisión de diseño abierta; lo que resta es implementación — ver §10 y roadmap §4)

## 10. Cuando se implemente (checklist técnico)

- [ ] Editar `schema.postgresql.prisma` **y** `schema.sqlite.prisma` (sincronizados).
- [ ] `prisma generate` + `prisma db push` (o `migrate dev`).
- [ ] Extender seed de tibabuyes: crear Owner(s), enlazar a la propiedad con participación, generar payouts de ejemplo.
- [ ] Registrar nuevos seeds en `prisma/seed/si/index.ts` si aplica.
- [ ] `graphify update .` para refrescar el grafo.
