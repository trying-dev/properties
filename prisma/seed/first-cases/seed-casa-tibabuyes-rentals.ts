import bcrypt from 'bcryptjs'
import {
  ContractStatus,
  DocumentType,
  Gender,
  MaritalStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  UnitStatus,
} from '../../../src/generated/prisma/client'
import { prisma } from '+/lib/prisma'

const PROPERTY_ID = 'case-casa-tibabuyes'
const ADMIN_EMAIL = 'm.garciamontejo@propiedades.com'

const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, date.getDate())

const listMonthStarts = (from: Date, to: Date) => {
  const start = new Date(from.getFullYear(), from.getMonth(), 1)
  const end = new Date(to.getFullYear(), to.getMonth(), 1)
  const months: Date[] = []
  let cursor = start
  while (cursor <= end) {
    months.push(new Date(cursor))
    cursor = addMonths(cursor, 1)
  }
  return months
}

type TenantSeed = {
  name: string
  lastName: string
  documentNumber: string
  phone: string
}

const tenants: TenantSeed[] = [
  { name: 'Juan', lastName: 'Perez Gomez', documentNumber: '000100001', phone: '+57 300 010 001' },
  { name: 'Laura', lastName: 'Torres Diaz', documentNumber: '000100002', phone: '+57 300 010 002' },
  { name: 'Miguel', lastName: 'Rojas Marin', documentNumber: '000100003', phone: '+57 300 010 003' },
  { name: 'Paula', lastName: 'Cortes Ruiz', documentNumber: '000100004', phone: '+57 300 010 004' },
  { name: 'Andres', lastName: 'Diaz Herrera', documentNumber: '000100005', phone: '+57 300 010 005' },
  { name: 'Juliana', lastName: 'Vargas Leon', documentNumber: '000100006', phone: '+57 300 010 006' },
  { name: 'Camilo', lastName: 'Ramirez Soto', documentNumber: '000100007', phone: '+57 300 010 007' },
  { name: 'Natalia', lastName: 'Suarez Lopez', documentNumber: '000100008', phone: '+57 300 010 008' },
  { name: 'Diego', lastName: 'Mendoza Perez', documentNumber: '000100009', phone: '+57 300 010 009' },
  { name: 'Sofia', lastName: 'Gomez Rivas', documentNumber: '000100010', phone: '+57 300 010 010' },
]

const buildTenantEmail = (seed: TenantSeed) => {
  const initial = seed.name.trim().charAt(0).toLowerCase()
  const surnames = seed.lastName.trim().toLowerCase().replace(/\s+/g, '')
  return `${initial}.${surnames}@tenant-properties.com`
}

const ensureTenant = async (seed: TenantSeed, hashedPassword: string) => {
  const seedPassword = process.env.SEED_PASSWORD ?? 'password123'
  const password = hashedPassword ?? (await bcrypt.hash(seedPassword, 10))
  const email = buildTenantEmail(seed)

  const existingUser = await prisma.user.findUnique({ where: { email } })
  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        email,
        password,
        phone: seed.phone,
        name: seed.name,
        lastName: seed.lastName,
        birthDate: new Date('1990-01-01'),
        documentType: DocumentType.CC,
        documentNumber: seed.documentNumber,
        gender: Gender.OTHER,
        maritalStatus: MaritalStatus.SINGLE,
        address: 'Bogotá',
        city: 'Bogotá',
        state: 'Bogotá',
        country: 'Colombia',
        profession: 'Comerciante',
        monthlyIncome: 6_000_000,
      },
    }))

  const existingTenant = await prisma.tenant.findUnique({ where: { userId: user.id } })
  if (existingTenant) return existingTenant

  return prisma.tenant.create({
    data: {
      user: { connect: { id: user.id } },
      emergencyContact: 'Contacto de emergencia',
      emergencyContactPhone: '+57 300 010 999',
      monthlyIncome: 6_000_000,
    },
  })
}

export const seedCasaTibabuyesRentals = async () => {
  const property = await prisma.property.findUnique({
    where: { id: PROPERTY_ID },
    include: { units: true },
  })

  if (!property) {
    throw new Error(`No existe la propiedad ${PROPERTY_ID}. Ejecuta primero el seed de la casa.`)
  }

  const admin = await prisma.admin.findFirst({
    where: { user: { email: ADMIN_EMAIL } },
  })

  if (!admin) {
    throw new Error(`No existe el admin ${ADMIN_EMAIL}. Ejecuta primero prisma/seed/first-cases/seed-admins-first-round.ts`)
  }

  const seedPassword = process.env.SEED_PASSWORD ?? 'password123'
  const hashedPassword = await bcrypt.hash(seedPassword, 10)

  const today = new Date()
  const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
  const endDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())

  for (const [index, unit] of property.units.entries()) {
    if (unit.baseRent == null) {
      throw new Error(`La unidad ${unit.unitNumber} (${unit.id}) no tiene baseRent definido.`)
    }
    const rentAmount = unit.baseRent

    const tenantSeed = tenants[index % tenants.length]
    const tenant = await ensureTenant(tenantSeed, hashedPassword)
    const existingContract = await prisma.contract.findFirst({
      where: { unitId: unit.id, tenantId: tenant.id, status: ContractStatus.ACTIVE },
    })

    const contract =
      existingContract ??
      (await prisma.contract.create({
        data: {
          unit: { connect: { id: unit.id } },
          tenant: { connect: { id: tenant.id } },
          adminId: admin.id,
          admins: { connect: [{ id: admin.id }] },
          rent: rentAmount,
          deposit: rentAmount,
          securityDeposit: rentAmount,
          lateFeePenalty: 5.0,
          gracePeriodDays: 3,
          autoRenewal: true,
          renewalPeriod: 12,
          startDate,
          endDate,
          status: ContractStatus.ACTIVE,
          terms: 'Contrato activo con pagos mensuales puntuales.',
          notes: 'Seed: contrato histórico con pagos al día.',
          signedAt: startDate,
          activatedAt: startDate,
        },
      }))

    await prisma.unit.update({
      where: { id: unit.id },
      data: { status: UnitStatus.OCCUPIED },
    })

    const months = listMonthStarts(startDate, today)
    for (const [index, month] of months.entries()) {
      const dueDate = new Date(month.getFullYear(), month.getMonth(), 5)
      const dueDateEnd = new Date(month.getFullYear(), month.getMonth(), 6)

      const existingPayment = await prisma.payment.findFirst({
        where: {
          contractId: contract.id,
          dueDate: { gte: dueDate, lt: dueDateEnd },
          paymentType: { in: [PaymentType.CANON, PaymentType.RENT] },
        },
      })

      if (existingPayment) continue

      const paidDate = new Date(dueDate)
      paidDate.setDate(dueDate.getDate() - 1)

      await prisma.payment.create({
        data: {
          contractId: contract.id,
          amount: contract.rent,
          dueDate,
          paidDate,
          paymentType: index === 0 ? PaymentType.CANON : PaymentType.RENT,
          status: PaymentStatus.PAID,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          notes: 'Pago registrado automáticamente.',
        },
      })
    }
  }

  console.log(`✅ Contratos y pagos creados para ${property.name}.`)
}

if (process.argv[1]?.includes('seed-casa-tibabuyes-rentals.ts')) {
  seedCasaTibabuyesRentals()
    .catch((error) => {
      console.error('❌ Error creando contratos y pagos:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
