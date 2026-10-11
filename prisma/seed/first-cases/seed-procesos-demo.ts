import bcrypt from 'bcryptjs'
import {
  ContractStatus,
  DocumentType,
  Gender,
  MaritalStatus,
  Profile,
  ProcessReviewStatus,
  ProcessReviewTargetType,
  ProcessStatus,
  UnitStatus,
} from '../../../src/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { MANUAL_CODE, MANUAL_VERSION } from '+/lib/manual'
import { profiles, securityOptions } from '+/app/process/_/profiles'
import type { ProfileId } from '+/app/process/_/types'

/**
 * Procesos de arriendo de demostración, uno por cada situación que queremos poder probar:
 *
 *  1. Valentina  IN_PROGRESS          wizard a medias (paso 2)
 *  2. Mateo      IN_EVALUATION        completo, manual NO aceptado  → aprobar debe BLOQUEARSE
 *  3. Isabela    IN_EVALUATION        todo revisado OK, manual aceptado → aprobar debe FUNCIONAR
 *  4. Santiago   WAITING_FOR_FEEDBACK 2 ítems con observaciones del admin
 *  5. Camila     DISAPPROVED          rechazada con motivo
 *  6. Daniel     APPROVED             aprobada, manual aceptado, contrato listo para crear/firmar
 *
 * Idempotente: si el proceso (inquilino + unidad) ya existe, no lo duplica.
 * Usa unidades VACANT de "Casa Ferias". Los archivos son metadatos de demo: las rutas no existen en disco.
 */

const PROPERTY_ID_HINT = 'Casa Ferias'
const ADMIN_EMAIL = 'm.garciamontejo@propiedades.com'

type DemoCase = {
  key: string
  name: string
  lastName: string
  documentNumber: string
  profile: ProfileId
  securityId: string
  unitNumber: string
  status: ProcessStatus
  currentStep: number
  withDocuments: boolean
  manualAccepted: boolean
  withContract: boolean
  reviewStatus?: 'ALL_PENDING' | 'ALL_APPROVED' | 'FEEDBACK'
  notes?: string
  approvalConditions?: string
}

const cases: DemoCase[] = [
  {
    key: 'valentina',
    name: 'Valentina',
    lastName: 'Ospina Rey',
    documentNumber: '000900001',
    profile: 'EMPLOYED',
    securityId: 'double',
    unitNumber: '101',
    status: ProcessStatus.IN_PROGRESS,
    currentStep: 2,
    withDocuments: false,
    manualAccepted: false,
    withContract: false,
  },
  {
    key: 'mateo',
    name: 'Mateo',
    lastName: 'Castano Bernal',
    documentNumber: '000900002',
    profile: 'EMPLOYED',
    securityId: 'double',
    unitNumber: '102',
    status: ProcessStatus.IN_EVALUATION,
    currentStep: 4,
    withDocuments: true,
    manualAccepted: false,
    withContract: true,
    reviewStatus: 'ALL_APPROVED',
  },
  {
    key: 'isabela',
    name: 'Isabela',
    lastName: 'Montoya Salazar',
    documentNumber: '000900003',
    profile: 'INDEPENDENT',
    securityId: 'double',
    unitNumber: '103',
    status: ProcessStatus.IN_EVALUATION,
    currentStep: 4,
    withDocuments: true,
    manualAccepted: true,
    withContract: true,
    reviewStatus: 'ALL_APPROVED',
  },
  {
    key: 'santiago',
    name: 'Santiago',
    lastName: 'Herrera Duque',
    documentNumber: '000900004',
    profile: 'EMPLOYED',
    securityId: 'insurance',
    unitNumber: '104',
    status: ProcessStatus.WAITING_FOR_FEEDBACK,
    currentStep: 4,
    withDocuments: true,
    manualAccepted: false,
    withContract: false,
    reviewStatus: 'FEEDBACK',
  },
  {
    key: 'camila',
    name: 'Camila',
    lastName: 'Restrepo Gil',
    documentNumber: '000900005',
    profile: 'STUDENT',
    securityId: 'double',
    unitNumber: '105',
    status: ProcessStatus.DISAPPROVED,
    currentStep: 4,
    withDocuments: true,
    manualAccepted: false,
    withContract: false,
    reviewStatus: 'FEEDBACK',
    notes: 'Los ingresos combinados de los codeudores no alcanzan 3 veces el canon.',
  },
  {
    key: 'daniel',
    name: 'Daniel',
    lastName: 'Velez Arango',
    documentNumber: '000900006',
    profile: 'ENTREPRENEUR',
    securityId: 'reinforced',
    unitNumber: '201',
    status: ProcessStatus.APPROVED,
    currentStep: 4,
    withDocuments: true,
    manualAccepted: true,
    withContract: true,
    reviewStatus: 'ALL_APPROVED',
    approvalConditions: 'Depósito de 2 meses y póliza vigente antes de la entrega de llaves.',
  },
]

const sampleValue = (type: string, id: string, index: number) => {
  switch (type) {
    case 'tel':
      return `+57 310 555 ${String(1000 + index).slice(-4)}`
    case 'email':
      return `${id}@demo.com`
    case 'date':
      return '1980-05-10'
    case 'checkbox':
      return true
    case 'number':
      return '5000000'
    default:
      return `Demo ${id.replace(/_/g, ' ')}`
  }
}

const buildEmail = (name: string, lastName: string) =>
  `${name.charAt(0).toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}@tenant-properties.com`

const ensureTenantUser = async (c: DemoCase, hashedPassword: string) => {
  const email = buildEmail(c.name, c.lastName)
  const user =
    (await prisma.user.findUnique({ where: { email } })) ??
    (await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phone: '+57 300 020 000',
        name: c.name,
        lastName: c.lastName,
        birthDate: new Date('1992-04-12'),
        documentType: DocumentType.CC,
        documentNumber: c.documentNumber,
        gender: Gender.OTHER,
        maritalStatus: MaritalStatus.SINGLE,
        address: 'Bogotá',
        city: 'Bogotá',
        state: 'Bogotá',
        country: 'Colombia',
        profession: 'Demo',
        monthlyIncome: 6_000_000,
      },
    }))

  const tenant =
    (await prisma.tenant.findUnique({ where: { userId: user.id } })) ??
    (await prisma.tenant.create({
      data: {
        user: { connect: { id: user.id } },
        profile: Profile[c.profile],
        emergencyContact: 'Contacto de emergencia',
        emergencyContactPhone: '+57 300 020 999',
        monthlyIncome: 6_000_000,
      },
    }))

  return { user, tenant }
}

export const seedProcesosDemo = async () => {
  const admin = await prisma.admin.findFirst({ where: { user: { email: ADMIN_EMAIL } } })
  if (!admin) throw new Error(`No existe el admin ${ADMIN_EMAIL}. Ejecuta primero seed-admins-first-round.`)

  const property = await prisma.property.findFirst({
    where: { name: PROPERTY_ID_HINT },
    include: { units: true },
  })
  if (!property) throw new Error(`No existe la propiedad "${PROPERTY_ID_HINT}". Ejecuta primero seed-casa-ferias.`)

  const hashedPassword = await bcrypt.hash(process.env.SEED_PASSWORD ?? 'password123', 10)
  console.log('🧪 Sembrando procesos de demostración...')

  for (const [index, c] of cases.entries()) {
    const unit = property.units.find((u) => u.unitNumber === c.unitNumber)
    if (!unit) {
      console.warn(`  ⚠️  ${c.key}: no existe la unidad ${c.unitNumber} en ${PROPERTY_ID_HINT}, se omite`)
      continue
    }

    const { user, tenant } = await ensureTenantUser(c, hashedPassword)

    const existing = await prisma.process.findFirst({ where: { tenantId: tenant.id, unitId: unit.id }, select: { id: true } })
    if (existing) {
      console.log(`  ↩︎  ${c.key}: ya existe, se omite`)
      continue
    }

    if (c.manualAccepted) {
      await prisma.manualAcceptance.upsert({
        where: { userId_manualCode_manualVersion: { userId: user.id, manualCode: MANUAL_CODE, manualVersion: MANUAL_VERSION } },
        create: { userId: user.id, manualCode: MANUAL_CODE, manualVersion: MANUAL_VERSION, ipAddress: '127.0.0.1', userAgent: 'seed-demo' },
        update: {},
      })
    }

    const profileConfig = profiles[c.profile]
    const securityOption = securityOptions.find((o) => o.id === c.securityId)
    if (!securityOption) throw new Error(`Garantía desconocida: ${c.securityId}`)

    const securityFields: Record<string, string | boolean> = {}
    securityOption.fields
      .filter((f) => f.type !== 'file')
      .forEach((f, i) => {
        securityFields[f.id] = sampleValue(f.type, f.id, i)
      })

    const payload =
      c.currentStep <= 2
        ? {
            basicInfo: {
              name: c.name,
              lastName: c.lastName,
              email: user.email,
              phone: user.phone ?? '',
              documentType: 'CC',
              documentNumber: c.documentNumber,
              monthlyIncome: '6000000',
            },
            profile: c.profile,
          }
        : {
            basicInfo: {
              name: c.name,
              lastName: c.lastName,
              email: user.email,
              phone: user.phone ?? '',
              birthDate: '1992-04-12',
              birthPlace: 'Bogotá',
              documentType: 'CC',
              documentNumber: c.documentNumber,
              gender: 'OTHER',
              maritalStatus: 'SINGLE',
              profession: 'Demo',
              monthlyIncome: '6000000',
            },
            profile: c.profile,
            security: { selectedSecurity: c.securityId, securityFields },
          }

    // Contrato en preparación: la unidad queda reservada, como hace "nuevo-proceso".
    let contractId: string | null = null
    if (c.withContract) {
      const isApproved = c.status === ProcessStatus.APPROVED
      const now = new Date()
      const contract = await prisma.contract.create({
        data: {
          unitId: unit.id,
          tenantId: tenant.id,
          adminId: admin.id,
          admins: { connect: [{ id: admin.id }] },
          status: isApproved ? ContractStatus.APPROVED : ContractStatus.INITIATED,
          rent: unit.baseRent ?? 0,
          deposit: unit.deposit ?? unit.baseRent ?? 0,
          startDate: now,
          endDate: now,
          initiatedAt: now,
          approvedAt: isApproved ? now : null,
          notes: 'Contrato de demostración (seed-procesos-demo)',
        },
        select: { id: true },
      })
      contractId = contract.id
      await prisma.unit.update({ where: { id: unit.id }, data: { status: UnitStatus.RESERVED } })
    }

    const process = await prisma.process.create({
      data: {
        tenantId: tenant.id,
        unitId: unit.id,
        adminId: admin.id,
        contractId,
        status: c.status,
        currentStep: c.currentStep,
        payload,
        notes: c.notes ?? null,
        approvalConditions: c.approvalConditions ?? null,
      },
      select: { id: true },
    })

    if (c.withDocuments) {
      const fileFields = [...profileConfig.fields, ...securityOption.fields].filter((f) => f.type === 'file')
      const documentIdByField = new Map<string, string>()

      for (const field of fileFields) {
        const doc = await prisma.processDocument.create({
          data: {
            processId: process.id,
            documentType: field.id,
            label: field.label,
            fileName: `${field.id}.pdf`,
            filePath: `/uploads/demo/${c.key}/${field.id}.pdf`,
            fileType: 'application/pdf',
            fileSize: 180_000,
            uploadedByUserId: user.id,
          },
          select: { id: true },
        })
        documentIdByField.set(field.id, doc.id)
      }

      if (c.reviewStatus) {
        const feedbackTargets = new Set(c.reviewStatus === 'FEEDBACK' ? fileFields.slice(0, 2).map((f) => f.id) : [])
        const statusFor = (targetId: string): ProcessReviewStatus => {
          if (c.reviewStatus === 'ALL_PENDING') return ProcessReviewStatus.PENDING
          if (c.reviewStatus === 'ALL_APPROVED') return ProcessReviewStatus.APPROVED
          if (c.status === ProcessStatus.DISAPPROVED) {
            return feedbackTargets.has(targetId) ? ProcessReviewStatus.REJECTED : ProcessReviewStatus.APPROVED
          }
          return feedbackTargets.has(targetId) ? ProcessReviewStatus.NEEDS_FEEDBACK : ProcessReviewStatus.APPROVED
        }

        const items = [
          { targetType: ProcessReviewTargetType.SECTION, targetId: 'basicInfo', documentId: null as string | null },
          { targetType: ProcessReviewTargetType.SECTION, targetId: 'security', documentId: null as string | null },
          ...fileFields.map((f) => ({
            targetType: ProcessReviewTargetType.DOCUMENT,
            targetId: f.id,
            documentId: documentIdByField.get(f.id) ?? null,
          })),
        ]

        for (const item of items) {
          const status = statusFor(item.targetId)
          const reviewed = status !== ProcessReviewStatus.PENDING
          await prisma.processReviewItem.create({
            data: {
              processId: process.id,
              targetType: item.targetType,
              targetId: item.targetId,
              documentId: item.documentId,
              status,
              adminComment:
                status === ProcessReviewStatus.NEEDS_FEEDBACK
                  ? 'El documento está ilegible, por favor súbelo de nuevo en mejor calidad.'
                  : status === ProcessReviewStatus.REJECTED
                    ? 'No cumple el requisito de ingresos.'
                    : null,
              reviewedByAdminId: reviewed ? admin.id : null,
              reviewedAt: reviewed ? new Date() : null,
            },
          })
        }
      }
    }

    console.log(`  ✅ ${c.key}: ${c.status} · ${property.name} ${c.unitNumber} · ${user.email}`)
  }
}

if (process.argv[1]?.includes('seed-procesos-demo.ts')) {
  seedProcesosDemo()
    .catch((error) => {
      console.error('❌ Error sembrando procesos de demostración:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
