import {
  CostResponsibility,
  InspectionCondition,
  InspectionStatus,
  InspectionType,
  MaintenanceStatus,
  MaintenanceType,
  MeterType,
  PaymentStatus,
  PaymentType,
  PayoutStatus,
  PolicyStatus,
  PropertyDocumentType,
  SecurityDeviceType,
  TaxStatus,
} from '../../../src/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { calculateOwnerPayoutsForPeriod } from '+/actions/payouts'

const PROPERTY_ID = 'case-casa-tibabuyes'

// Fechas relativas a hoy para que las alertas (F6) y descuentos caigan en el periodo actual.
const now = new Date()
const inDays = (d: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + d)
const daysAgo = (d: number) => inDays(-d)
const thisMonth = (day: number) => new Date(now.getFullYear(), now.getMonth(), day)
const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

// Borra los datos de módulos de la propiedad para poder re-sembrar limpio.
const resetModules = async () => {
  const units = await prisma.unit.findMany({ where: { propertyId: PROPERTY_ID }, select: { id: true } })
  const unitIds = units.map((u) => u.id)
  await prisma.meterReading.deleteMany({ where: { meter: { propertyId: PROPERTY_ID } } })
  await prisma.meter.deleteMany({ where: { propertyId: PROPERTY_ID } })
  await prisma.maintenance.deleteMany({ where: { unitId: { in: unitIds } } })
  await prisma.inspection.deleteMany({ where: { unitId: { in: unitIds } } })
  await prisma.securityDevice.deleteMany({ where: { propertyId: PROPERTY_ID } })
  await prisma.propertyDocument.deleteMany({ where: { propertyId: PROPERTY_ID } })
  await prisma.propertyTax.deleteMany({ where: { propertyId: PROPERTY_ID } })
  await prisma.insurancePolicy.deleteMany({ where: { propertyId: PROPERTY_ID } })
  await prisma.notification.deleteMany({ where: { unitId: { in: unitIds } } })
  await prisma.ownerPayout.deleteMany({
    where: { owner: { properties: { some: { propertyId: PROPERTY_ID } } } },
  })
}

export const seedCasaTibabuyesModules = async () => {
  const property = await prisma.property.findUnique({
    where: { id: PROPERTY_ID },
    include: {
      units: {
        include: {
          contracts: { where: { status: 'ACTIVE' }, include: { tenant: true }, take: 1 },
        },
      },
    },
  })
  if (!property) throw new Error(`No existe la propiedad ${PROPERTY_ID}. Corre primero los seeds base.`)

  const unitsWithContract = property.units.filter((u) => u.contracts.length > 0)
  if (unitsWithContract.length < 4) throw new Error('Se necesitan al menos 4 unidades con contrato activo.')

  // El inquilino demo Juan queda con 4 unidades, cada una en un estado de pago
  // distinto (para ver los 4 diseños de la tarjeta): reasigna 4 contratos a Juan.
  const juan = await prisma.tenant.findFirst({ where: { user: { email: 'j.perezgomez@tenant-properties.com' } } })
  if (!juan) throw new Error('No existe el inquilino demo Juan (j.perezgomez@tenant-properties.com).')

  const juanUnits = unitsWithContract.slice(0, 4)
  const juanUnitIds = new Set(juanUnits.map((u) => u.id))
  for (const u of juanUnits) {
    await prisma.contract.update({ where: { id: u.contracts[0].id }, data: { tenantId: juan.id } })
    u.contracts[0].tenantId = juan.id // reflejar en memoria para las notis/pagos de abajo
  }

  // Juan queda SOLO con esas 4: sus otros contratos activos pasan a otra inquilina (Laura).
  const laura = await prisma.tenant.findFirst({ where: { user: { email: 'l.torresdiaz@tenant-properties.com' } } })
  if (laura) {
    await prisma.contract.updateMany({
      where: { tenantId: juan.id, status: 'ACTIVE', unit: { propertyId: PROPERTY_ID, id: { notIn: [...juanUnitIds] } } },
      data: { tenantId: laura.id },
    })
  }

  const demoUnit = juanUnits[0] // C1-LOCAL-A: unidad con todos los módulos + estado "Esperando confirmación"
  const demoContract = demoUnit.contracts[0]

  await resetModules()

  // ── F1 Inspecciones ────────────────────────────────────────────────
  await prisma.inspection.create({
    data: {
      unitId: demoUnit.id,
      contractId: demoContract.id,
      type: InspectionType.ENTREGA,
      status: InspectionStatus.COMPLETED,
      scheduledDate: daysAgo(370),
      performedDate: daysAgo(368),
      overallCondition: InspectionCondition.GOOD,
      score: 92,
      criticalFindings: 0,
      notes: 'Entrega al inquilino. Todo en buen estado.',
      payload: { espacios: [{ nombre: 'Cocina', estado: 'GOOD' }, { nombre: 'Baño', estado: 'GOOD' }] },
    },
  })
  const periodica = await prisma.inspection.create({
    data: {
      unitId: demoUnit.id,
      contractId: demoContract.id,
      type: InspectionType.PERIODICA,
      status: InspectionStatus.COMPLETED,
      scheduledDate: daysAgo(35),
      performedDate: daysAgo(33),
      overallCondition: InspectionCondition.FAIR,
      score: 74,
      criticalFindings: 2,
      notes: 'Humedad en baño y fuga en llave de cocina.',
      payload: { espacios: [{ nombre: 'Baño', estado: 'POOR', hallazgo: 'Humedad en muro' }] },
    },
  })
  await prisma.unit.update({ where: { id: demoUnit.id }, data: { lastInspectionDate: daysAgo(33) } })

  // ── F2 Mantenimiento ───────────────────────────────────────────────
  // Correctivo OWNER completado este mes → se descuenta de la liquidación.
  await prisma.maintenance.create({
    data: {
      unitId: demoUnit.id,
      inspectionId: periodica.id,
      type: MaintenanceType.CORRECTIVE,
      status: MaintenanceStatus.COMPLETED,
      costBearer: CostResponsibility.OWNER,
      title: 'Reparación fuga llave cocina',
      provider: 'Plomería Bogotá',
      diagnosis: 'Empaque desgastado',
      solution: 'Cambio de empaque y llave',
      cost: 350_000,
      scheduledDate: daysAgo(20),
      completedDate: thisMonth(Math.min(now.getDate(), 10)),
    },
  })
  // Preventivo con próxima fecha cercana → dispara alerta F6.
  await prisma.maintenance.create({
    data: {
      unitId: demoUnit.id,
      type: MaintenanceType.PREVENTIVE,
      status: MaintenanceStatus.COMPLETED,
      costBearer: CostResponsibility.PROPERTIES,
      title: 'Mantenimiento de calentador',
      provider: 'GasTech',
      cost: 120_000,
      completedDate: daysAgo(180),
      recurrenceMonths: 6,
      nextDueDate: inDays(12),
    },
  })
  // Incidente causado por inquilino (costo TENANT, no descuenta al dueño).
  await prisma.maintenance.create({
    data: {
      unitId: demoUnit.id,
      type: MaintenanceType.INCIDENT,
      status: MaintenanceStatus.PENDING,
      costBearer: CostResponsibility.TENANT,
      title: 'Vidrio roto en ventana',
      severity: 'MEDIUM',
      estimatedLoss: 180_000,
      scheduledDate: inDays(3),
    },
  })

  // ── F3 Medidores ───────────────────────────────────────────────────
  const water = await prisma.meter.create({
    data: { propertyId: PROPERTY_ID, unitId: demoUnit.id, type: MeterType.WATER, serial: 'W-0091', provider: 'EAB', unitOfMeasure: 'm³' },
  })
  const waterReadings = [
    { d: 90, v: 100 },
    { d: 60, v: 118 },
    { d: 30, v: 135 },
    { d: 1, v: 151 },
  ]
  let prevW: number | null = null
  for (const r of waterReadings) {
    await prisma.meterReading.create({
      data: { meterId: water.id, value: r.v, readingDate: daysAgo(r.d), consumption: prevW == null ? null : r.v - prevW },
    })
    prevW = r.v
  }
  const power = await prisma.meter.create({
    data: { propertyId: PROPERTY_ID, unitId: demoUnit.id, type: MeterType.ELECTRICITY, serial: 'E-0442', provider: 'Enel', unitOfMeasure: 'kWh' },
  })
  const powerReadings = [
    { d: 60, v: 3200 },
    { d: 30, v: 3410 },
    { d: 1, v: 3625 },
  ]
  let prevP: number | null = null
  for (const r of powerReadings) {
    await prisma.meterReading.create({
      data: { meterId: power.id, value: r.v, readingDate: daysAgo(r.d), consumption: prevP == null ? null : r.v - prevP },
    })
    prevP = r.v
  }

  // ── F4 Seguridad ───────────────────────────────────────────────────
  // Extintor con recarga próxima → alerta F6.
  await prisma.securityDevice.create({
    data: { propertyId: PROPERTY_ID, type: SecurityDeviceType.EXTINGUISHER, location: 'Pasillo piso 1', brand: 'Amerex', nextServiceDate: inDays(18), payload: { capacidad: '10lb', agente: 'ABC' } },
  })
  await prisma.securityDevice.create({
    data: { propertyId: PROPERTY_ID, type: SecurityDeviceType.CAMERA, location: 'Entrada principal', brand: 'Hikvision' },
  })

  // ── F4 Documentación ───────────────────────────────────────────────
  await prisma.propertyDocument.create({
    data: { propertyId: PROPERTY_ID, type: PropertyDocumentType.DEED, name: 'Escritura 4521 Notaría 12', fileUrl: 'https://example.com/escritura.pdf', issuedDate: daysAgo(3000) },
  })
  // Certificado de tradición con vencimiento próximo → alerta F6.
  await prisma.propertyDocument.create({
    data: { propertyId: PROPERTY_ID, type: PropertyDocumentType.TRADITION_CERT, name: 'Certificado de tradición y libertad', fileUrl: 'https://example.com/tradicion.pdf', issuedDate: daysAgo(20), expiryDate: inDays(25) },
  })

  // ── F5a Predial ────────────────────────────────────────────────────
  // Pagado este mes → se descuenta de la liquidación.
  await prisma.propertyTax.create({
    data: { propertyId: PROPERTY_ID, year: now.getFullYear(), amount: 1_200_000, status: TaxStatus.PAID, paidDate: thisMonth(Math.min(now.getDate(), 8)), reference: 'PRED-2026-01' },
  })
  // Siguiente vigencia PENDING con fecha límite próxima → alerta F6.
  await prisma.propertyTax.create({
    data: { propertyId: PROPERTY_ID, year: now.getFullYear() + 1, amount: 1_260_000, status: TaxStatus.PENDING, dueDate: inDays(10) },
  })

  // ── F5c Póliza ─────────────────────────────────────────────────────
  await prisma.insurancePolicy.create({
    data: { propertyId: PROPERTY_ID, insurer: 'Sura', policyNumber: 'POL-778812', coverage: 'Todo riesgo inmueble', amount: 350_000_000, premium: 1_400_000, startDate: daysAgo(345), endDate: inDays(20), status: PolicyStatus.ACTIVE },
  })

  // ── 4 estados de pago (uno por unidad de Juan) ─────────────────────
  // Cada unidad muestra un diseño distinto de la tarjeta:
  //   [0] Esperando confirmación (REPORTED) · [1] Atrasado (OVERDUE)
  //   [2] Vence pronto (PENDING +3d)         · [3] Al día (PENDING +25d)
  const states = [
    { kind: 'reported' as const, due: new Date(now.getFullYear(), now.getMonth() + 1, 5) },
    { kind: 'overdue' as const, due: daysAgo(40) },
    { kind: 'soon' as const, due: inDays(3) },
    { kind: 'aldia' as const, due: inDays(25) },
  ]

  for (let i = 0; i < juanUnits.length; i++) {
    const u = juanUnits[i]
    const contract = u.contracts[0]
    const st = states[i]
    // Limpia pagos abiertos previos (deja el histórico PAID) para idempotencia.
    await prisma.payment.deleteMany({
      where: { contractId: contract.id, status: { in: [PaymentStatus.PENDING, PaymentStatus.REPORTED, PaymentStatus.OVERDUE, PaymentStatus.PARTIAL] } },
    })

    const status =
      st.kind === 'reported' ? PaymentStatus.REPORTED : st.kind === 'overdue' ? PaymentStatus.OVERDUE : PaymentStatus.PENDING

    const pay = await prisma.payment.create({
      data: {
        contractId: contract.id,
        amount: contract.rent,
        dueDate: st.due,
        paymentType: PaymentType.RENT,
        status,
        reportedAt: st.kind === 'reported' ? now : null,
        proofUrl: st.kind === 'reported' ? 'https://picsum.photos/seed/comprobante/600/800' : null,
        lateFeeAmount: st.kind === 'overdue' ? Math.round(contract.rent * 0.05) : null,
        lateFeeApplied: st.kind === 'overdue',
      },
    })

    // El pago reportado notifica al admin (mismo id determinístico que la action).
    if (st.kind === 'reported') {
      await prisma.notification.create({
        data: {
          id: `payreport-${pay.id}`,
          adminId: contract.adminId,
          tenantId: contract.tenantId,
          unitId: u.id,
          senderRole: 'TENANT',
          type: 'REMINDER',
          title: 'Pago reportado',
          body: `El inquilino reportó el pago de la unidad ${u.unitNumber}. Espera tu confirmación.`,
          link: `/dashboard/admin/units/${u.id}?paymentId=${pay.id}`,
          metadata: { paymentId: pay.id },
        },
      })
    }
  }

  // ── Notificaciones de la unidad (asociadas por unitId) ─────────────
  // Reporte del inquilino (sin leer) dirigido al admin del contrato.
  await prisma.notification.create({
    data: {
      tenantId: demoContract.tenantId,
      adminId: demoContract.adminId,
      unitId: demoUnit.id,
      senderRole: 'TENANT',
      type: 'TENANT_REPORT',
      title: 'Fuga en el baño',
      body: 'Hay una fuga bajo el lavamanos, gotea constante.',
    },
  })
  // Aviso del admin al inquilino sobre la unidad.
  await prisma.notification.create({
    data: {
      tenantId: demoContract.tenantId,
      adminId: demoContract.adminId,
      unitId: demoUnit.id,
      senderRole: 'ADMIN',
      type: 'GENERAL',
      title: 'Visita de mantenimiento',
      body: 'Programamos revisión del calentador para la próxima semana.',
      readAt: new Date(),
    },
  })

  // ── F0.5 Liquidación ───────────────────────────────────────────────
  // Genera los OwnerPayout del periodo actual reflejando predial + mantenimiento OWNER.
  const computation = await calculateOwnerPayoutsForPeriod(PROPERTY_ID, currentPeriod)
  for (const line of computation.lines) {
    await prisma.ownerPayout.upsert({
      where: { ownerId_period: { ownerId: line.ownerId, period: currentPeriod } },
      update: { grossAmount: line.grossAmount, commission: line.commission, netAmount: line.netAmount },
      create: {
        ownerId: line.ownerId,
        period: currentPeriod,
        grossAmount: line.grossAmount,
        commission: line.commission,
        netAmount: line.netAmount,
        status: PayoutStatus.PENDING,
      },
    })
  }

  console.log(
    `✅ Módulos sembrados en ${property.name}: inspecciones, mantenimiento, medidores, seguridad, documentos, predial, póliza, pago REPORTED, cartera y liquidación (${currentPeriod}).`,
  )
}

if (process.argv[1]?.includes('seed-casa-tibabuyes-modules.ts')) {
  seedCasaTibabuyesModules()
    .catch((error) => {
      console.error('❌ Error sembrando módulos:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
