import bcrypt from 'bcryptjs'
import { DocumentType, Gender, MaritalStatus } from '../../../src/generated/prisma/client'
import { prisma } from '+/lib/prisma'

const PROPERTY_ID = 'case-casa-tibabuyes'

type OwnerSeed = {
  name: string
  lastName: string
  documentNumber: string
  phone: string
  participation: number
}

// Copropiedad de ejemplo: dos dueños 60/40.
const owners: OwnerSeed[] = [
  { name: 'Roberto', lastName: 'Gutierrez Pena', documentNumber: '000200001', phone: '+57 300 020 001', participation: 60 },
  { name: 'Clara', lastName: 'Montoya Rios', documentNumber: '000200002', phone: '+57 300 020 002', participation: 40 },
]

const buildOwnerEmail = (seed: OwnerSeed) => {
  const initial = seed.name.trim().charAt(0).toLowerCase()
  const surnames = seed.lastName.trim().toLowerCase().replace(/\s+/g, '')
  return `${initial}.${surnames}@owner-properties.com`
}

const ensureOwner = async (seed: OwnerSeed, hashedPassword: string) => {
  const email = buildOwnerEmail(seed)

  const existingUser = await prisma.user.findUnique({ where: { email } })
  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phone: seed.phone,
        name: seed.name,
        lastName: seed.lastName,
        birthDate: new Date('1980-01-01'),
        documentType: DocumentType.CC,
        documentNumber: seed.documentNumber,
        gender: Gender.OTHER,
        maritalStatus: MaritalStatus.SINGLE,
        address: 'Bogotá',
        city: 'Bogotá',
        state: 'Bogotá',
        country: 'Colombia',
        profession: 'Inversionista',
      },
    }))

  const existingOwner = await prisma.owner.findUnique({ where: { userId: user.id } })
  if (existingOwner) return existingOwner

  return prisma.owner.create({
    data: {
      user: { connect: { id: user.id } },
      payoutMethod: 'BANK_TRANSFER',
      bankAccount: `AHORROS-${seed.documentNumber}`,
    },
  })
}

export const seedCasaTibabuyesOwners = async () => {
  const property = await prisma.property.findUnique({ where: { id: PROPERTY_ID } })

  if (!property) {
    throw new Error(`No existe la propiedad ${PROPERTY_ID}. Ejecuta primero el seed de la casa.`)
  }

  const seedPassword = process.env.SEED_PASSWORD ?? 'password123'
  const hashedPassword = await bcrypt.hash(seedPassword, 10)

  for (const seed of owners) {
    const owner = await ensureOwner(seed, hashedPassword)

    const existingLink = await prisma.propertyOwner.findUnique({
      where: { ownerId_propertyId: { ownerId: owner.id, propertyId: PROPERTY_ID } },
    })

    if (existingLink) {
      await prisma.propertyOwner.update({
        where: { id: existingLink.id },
        data: { participation: seed.participation, active: true },
      })
      continue
    }

    await prisma.propertyOwner.create({
      data: {
        owner: { connect: { id: owner.id } },
        property: { connect: { id: PROPERTY_ID } },
        participation: seed.participation,
      },
    })
  }

  console.log(`✅ Dueños creados para ${property.name} (${owners.length}, participación ${owners.map((o) => o.participation).join('/')}).`)
}

if (process.argv[1]?.includes('seed-casa-tibabuyes-owners.ts')) {
  seedCasaTibabuyesOwners()
    .catch((error) => {
      console.error('❌ Error creando dueños:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
