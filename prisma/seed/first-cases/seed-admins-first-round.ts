import bcrypt from 'bcryptjs'
import { AdminLevel, DocumentType, Gender, MaritalStatus } from '../../../src/generated/prisma/client'
import { prisma } from '+/lib/prisma'

type AdminSeed = {
  fullName: string
  adminLevel: AdminLevel
  documentNumber: string
  phone: string
}

const buildEmail = (fullName: string) => {
  const parts = fullName.trim().toLowerCase().split(/\s+/)
  const firstName = parts[0] ?? ''
  const surnames = parts.length >= 3 ? parts.slice(-2) : parts.slice(1)
  const surnameSlug = surnames.join('')
  return `${firstName.charAt(0)}.${surnameSlug}@propiedades.com`
}

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length < 2) return { name: fullName, lastName: '' }
  const name = parts.slice(0, -2).join(' ') || parts[0]
  const lastName = parts.length >= 3 ? parts.slice(-2).join(' ') : parts.slice(-1).join(' ')
  return { name, lastName }
}

const admins: AdminSeed[] = [
  {
    fullName: 'Maria Celina Garcia Montejo',
    adminLevel: AdminLevel.STANDARD,
    documentNumber: '000000001',
    phone: '+57 300 000 0001',
  },
  {
    fullName: 'Olvier Ramirez Gacia',
    adminLevel: AdminLevel.SUPER_ADMIN,
    documentNumber: '000000002',
    phone: '+57 300 000 0002',
  },
  {
    fullName: 'Sergio Nicolas Ramirez Garcia',
    adminLevel: AdminLevel.STANDARD,
    documentNumber: '000000003',
    phone: '+57 300 000 0003',
  },
  {
    fullName: 'Ingrid Ramirez Garcia',
    adminLevel: AdminLevel.STANDARD,
    documentNumber: '000000004',
    phone: '+57 300 000 0004',
  },
  {
    fullName: 'Fabian Diaz Rodriguez',
    adminLevel: AdminLevel.STANDARD,
    documentNumber: '000000005',
    phone: '+57 300 000 0005',
  },
]

export const seedAdminsFirstRound = async () => {
  const seedPassword = process.env.SEED_PASSWORD ?? 'password123'
  const hashedPassword = await bcrypt.hash(seedPassword, 10)

  for (const admin of admins) {
    const email = buildEmail(admin.fullName)
    const { name, lastName } = splitName(admin.fullName)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    const user =
      existingUser ??
      (await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          phone: admin.phone,
          name,
          lastName,
          birthDate: new Date('1985-01-01'),
          documentType: DocumentType.CC,
          documentNumber: admin.documentNumber,
          gender: Gender.OTHER,
          maritalStatus: MaritalStatus.SINGLE,
          address: 'Bogotá',
          city: 'Bogotá',
          state: 'Bogotá',
          country: 'Colombia',
          profession: 'Administrador',
          monthlyIncome: 8_000_000,
        },
      }))

    const existingAdmin = await prisma.admin.findUnique({ where: { userId: user.id } })
    if (existingAdmin) {
      await prisma.admin.update({
        where: { id: existingAdmin.id },
        data: { adminLevel: admin.adminLevel },
      })
      console.log(`✅ Admin actualizado: ${email} (${admin.adminLevel})`)
      continue
    }

    await prisma.admin.create({
      data: {
        adminLevel: admin.adminLevel,
        user: { connect: { id: user.id } },
      },
    })

    console.log(`✅ Admin creado: ${email} (${admin.adminLevel})`)
  }
}

if (process.argv[1]?.includes('seed-admins-first-round.ts')) {
  seedAdminsFirstRound()
    .catch((error) => {
      console.error('❌ Error creando admins (first round):', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
