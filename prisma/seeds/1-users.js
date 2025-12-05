/* eslint-disable @typescript-eslint/no-require-imports */
const {
  PrismaClient,
  DocumentType,
  Gender,
  MaritalStatus,
  AdminLevel,
  EmploymentStatus,
} = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const createUsers = async () => {
  console.log('👥 Creando usuarios...')

  // Password desde .env
  const seedPassword = process.env.SEED_PASSWORD || 'Password@123!'
  const hashedPassword = await bcrypt.hash(seedPassword, 10)

  // ========================================
  // CREAR USUARIOS ADMINISTRADORES
  // ========================================

  console.log('👨‍💼 Creando administradores...')

  // ADMIN 1 - SUPER_ADMIN
  let admin1 = await prisma.admin.findFirst({
    where: { user: { email: 'admin1@propiedades.com' } },
    include: { user: true },
  })

  if (!admin1) {
    admin1 = await prisma.admin.create({
      data: {
        adminLevel: AdminLevel.SUPER_ADMIN,
        user: {
          create: {
            email: 'admin1@propiedades.com',
            password: hashedPassword,
            phone: '+57 300 111 1111',
            name: 'Rev',
            lastName: 'Administrador',
            birthDate: new Date('1985-03-15'),
            documentType: DocumentType.CC,
            documentNumber: '12345678',
            gender: Gender.MALE,
            maritalStatus: MaritalStatus.MARRIED,
            address: 'Calle 100 #15-20',
            city: 'Bogotá',
            state: 'Cundinamarca',
            country: 'Colombia',
            profession: 'Administrador de Propiedades',
          },
        },
      },
      include: { user: true },
    })
    console.log(`✅ Admin creado: ${admin1.user.name} - ${AdminLevel.SUPER_ADMIN}`)
  } else {
    console.log(`ℹ️  Admin ya existe: ${admin1.user.name} - ${admin1.adminLevel}`)
  }

  // ADMIN 2 - MANAGER
  let admin2 = await prisma.admin.findFirst({
    where: { user: { email: 'admin2@propiedades.com' } },
    include: { user: true },
  })

  if (!admin2) {
    admin2 = await prisma.admin.create({
      data: {
        adminLevel: AdminLevel.MANAGER,
        createdBy: { connect: { id: admin1.id } },
        user: {
          create: {
            email: 'admin2@propiedades.com',
            password: hashedPassword,
            phone: '+57 300 222 2222',
            name: 'María',
            lastName: 'Supervisora',
            birthDate: new Date('1990-07-22'),
            documentType: DocumentType.CC,
            documentNumber: '23456789',
            gender: Gender.FEMALE,
            maritalStatus: MaritalStatus.SINGLE,
            address: 'Carrera 7 #45-30',
            city: 'Bogotá',
            state: 'Cundinamarca',
            country: 'Colombia',
            profession: 'Supervisora de Mantenimiento',
          },
        },
      },
      include: { user: true },
    })
    console.log(`✅ Admin creado: ${admin2.user.name} - ${AdminLevel.MANAGER}`)
  } else {
    console.log(`ℹ️  Admin ya existe: ${admin2.user.name} - ${admin2.adminLevel}`)
  }

  // ADMIN 3 - STANDARD
  let admin3 = await prisma.admin.findFirst({
    where: { user: { email: 'admin3@propiedades.com' } },
    include: { user: true },
  })

  if (!admin3) {
    admin3 = await prisma.admin.create({
      data: {
        adminLevel: AdminLevel.STANDARD,
        createdBy: { connect: { id: admin1.id } },
        user: {
          create: {
            email: 'admin3@propiedades.com',
            password: hashedPassword,
            phone: '+57 300 333 3333',
            name: 'Luis',
            lastName: 'Gerente',
            birthDate: new Date('1982-11-08'),
            documentType: DocumentType.CC,
            documentNumber: '34567890',
            gender: Gender.MALE,
            maritalStatus: MaritalStatus.DIVORCED,
            address: 'Avenida 68 #25-10',
            city: 'Bogotá',
            state: 'Cundinamarca',
            country: 'Colombia',
            profession: 'Gerente General',
          },
        },
      },
      include: { user: true },
    })
    console.log(`✅ Admin creado: ${admin3.user.name} - ${AdminLevel.STANDARD}`)
  } else {
    console.log(`ℹ️  Admin ya existe: ${admin3.user.name} - ${admin3.adminLevel}`)
  }

  // ADMIN 4 - LIMITED
  let admin4 = await prisma.admin.findFirst({
    where: {
      user: {
        email: 'portero@propiedades.com',
      },
    },
    include: { user: true },
  })

  if (!admin4) {
    admin4 = await prisma.admin.create({
      data: {
        adminLevel: AdminLevel.LIMITED,
        createdBy: { connect: { id: admin3.id } },
        user: {
          create: {
            email: 'portero@propiedades.com',
            password: hashedPassword,
            phone: '+57 300 888 8888',
            name: 'Roberto',
            lastName: 'Portero',
            birthDate: new Date('1970-01-15'),
            documentType: DocumentType.CC,
            documentNumber: '78901234',
            gender: Gender.MALE,
            maritalStatus: MaritalStatus.WIDOWED,
            address: 'Calle 50 #30-20',
            city: 'Bogotá',
            state: 'Cundinamarca',
            country: 'Colombia',
            profession: 'Vigilante',
          },
        },
      },
      include: { user: true },
    })
    console.log(`✅ Admin creado: ${admin4.user.name} - ${AdminLevel.LIMITED}`)
  } else {
    console.log(`ℹ️  Admin ya existe: ${admin4.user.name} - ${admin4.adminLevel}`)
  }

  // ========================================
  // CREAR USUARIOS INQUILINOS
  // ========================================

  console.log('🏠 Creando inquilinos...')

  // TENANT 1
  let tenant1 = await prisma.tenant.findFirst({
    where: { user: { email: 'comerciante1@gmail.com' } },
    include: { user: true, references: true },
  })

  if (!tenant1) {
    tenant1 = await prisma.tenant.create({
      data: {
        emergencyContact: 'María Comerciante',
        emergencyContactPhone: '+57 300 999 9999',
        employmentStatus: EmploymentStatus.SELF_EMPLOYED,
        monthlyIncome: 5000000,
        user: {
          create: {
            email: 'comerciante1@gmail.com',
            password: hashedPassword,
            phone: '+57 300 444 4444',
            name: 'Ana',
            lastName: 'Comerciante',
            birthDate: new Date('1988-05-20'),
            documentType: DocumentType.CC,
            documentNumber: '45678901',
            gender: Gender.FEMALE,
            maritalStatus: MaritalStatus.MARRIED,
            address: 'Calle 80 #12-34',
            city: 'Bogotá',
            state: 'Cundinamarca',
            country: 'Colombia',
            profession: 'Comerciante',
          },
        },
        references: {
          create: [
            {
              name: 'José Comerciante',
              phone: '+57 300 101 1010',
              relationship: 'Hermano',
            },
            {
              name: 'Banco Popular',
              phone: '+57 1 123 4567',
              relationship: 'Referencia bancaria',
            },
          ],
        },
      },
      include: { user: true, references: true },
    })
    console.log(
      `✅ Inquilino creado: ${tenant1.user.name} ${tenant1.user.lastName} (${tenant1.references.length} referencias)`
    )
  } else {
    console.log(`ℹ️  Inquilino ya existe: ${tenant1.user.name} ${tenant1.user.lastName}`)
  }

  // TENANT 2
  let tenant2 = await prisma.tenant.findFirst({
    where: {
      user: {
        email: 'comerciante2@gmail.com',
      },
    },
    include: { user: true, references: true },
  })

  if (!tenant2) {
    tenant2 = await prisma.tenant.create({
      data: {
        emergencyContact: 'Sandra Empresaria',
        emergencyContactPhone: '+57 300 888 8888',
        employmentStatus: EmploymentStatus.SELF_EMPLOYED,
        monthlyIncome: 8000000,
        user: {
          create: {
            email: 'comerciante2@gmail.com',
            password: hashedPassword,
            phone: '+57 300 555 5555',
            name: 'Pedro',
            lastName: 'Empresario',
            birthDate: new Date('1975-12-10'),
            documentType: DocumentType.CC,
            documentNumber: '56789012',
            gender: Gender.MALE,
            maritalStatus: MaritalStatus.MARRIED,
            address: 'Avenida 19 #67-89',
            city: 'Bogotá',
            state: 'Cundinamarca',
            country: 'Colombia',
            profession: 'Empresario',
          },
        },
        references: {
          create: [
            {
              name: 'Cámara de Comercio',
              phone: '+57 1 555 0000',
              relationship: 'Referencia comercial',
            },
          ],
        },
      },
      include: { user: true, references: true },
    })
    console.log(
      `✅ Inquilino creado: ${tenant2.user.name} ${tenant2.user.lastName} (${tenant2.references.length} referencias)`
    )
  } else {
    console.log(`ℹ️  Inquilino ya existe: ${tenant2.user.name} ${tenant2.user.lastName}`)
  }

  // TENANT 3
  let tenant3 = await prisma.tenant.findFirst({
    where: { user: { email: 'residente1@gmail.com' } },
    include: { user: true, references: true },
  })

  if (!tenant3) {
    tenant3 = await prisma.tenant.create({
      data: {
        emergencyContact: 'Roberto Profesional',
        emergencyContactPhone: '+57 300 777 7777',
        employmentStatus: EmploymentStatus.EMPLOYED,
        monthlyIncome: 4000000,
        user: {
          create: {
            email: 'residente1@gmail.com',
            password: hashedPassword,
            phone: '+57 300 666 6666',
            name: 'Laura',
            lastName: 'Hernandez',
            birthDate: new Date('1992-09-14'),
            documentType: DocumentType.CC,
            documentNumber: '67890123',
            gender: Gender.FEMALE,
            maritalStatus: MaritalStatus.SINGLE,
            address: 'Calle 127 #45-67',
            city: 'Bogotá',
            state: 'Cundinamarca',
            country: 'Colombia',
            profession: 'Ingeniera',
          },
        },
        references: {
          create: [
            {
              name: 'TechCorp S.A.S',
              phone: '+57 1 234 5678',
              relationship: 'Empleador',
            },
          ],
        },
      },
      include: { user: true, references: true },
    })
    console.log(
      `✅ Inquilino creado: ${tenant3.user.name} ${tenant3.user.lastName} (${tenant3.references.length} referencias)`
    )
  } else {
    console.log(`ℹ️  Inquilino ya existe: ${tenant3.user.name} ${tenant3.user.lastName}`)
  }

  // TENANT 4
  let tenant4 = await prisma.tenant.findFirst({
    where: {
      user: {
        email: 'extranjero1@gmail.com',
      },
    },
    include: { user: true, references: true },
  })

  if (!tenant4) {
    tenant4 = await prisma.tenant.create({
      data: {
        emergencyContact: 'Sarah Smith',
        emergencyContactPhone: '+1 555 123 4567',
        employmentStatus: EmploymentStatus.SELF_EMPLOYED,
        monthlyIncome: 6000000,
        user: {
          create: {
            email: 'extranjero1@gmail.com',
            password: hashedPassword,
            phone: '+57 300 777 7777',
            name: 'John',
            lastName: 'Smith',
            birthDate: new Date('1986-04-25'),
            documentType: DocumentType.PASSPORT,
            documentNumber: 'US1234567',
            gender: Gender.MALE,
            maritalStatus: MaritalStatus.COMMON_LAW,
            address: 'Calle 93 #14-20',
            city: 'Bogotá',
            state: 'Cundinamarca',
            country: 'Estados Unidos',
            profession: 'Consultor Internacional',
          },
        },
        references: {
          create: [
            {
              name: 'Global Consulting Inc',
              phone: '+1 555 987 6543',
              relationship: 'Empleador',
            },
          ],
        },
      },
      include: { user: true, references: true },
    })
    console.log(
      `✅ Inquilino creado: ${tenant4.user.name} ${tenant4.user.lastName} (${tenant4.references.length} referencias)`
    )
  } else {
    console.log(`ℹ️  Inquilino ya existe: ${tenant4.user.name} ${tenant4.user.lastName}`)
  }

  console.log('🎉 Proceso de creación de usuarios completado')

  return {
    admins: { admin1, admin2, admin3, admin4 },
    tenants: { tenant1, tenant2, tenant3, tenant4 },
  }
}

module.exports = { createUsers }

if (require.main === module) {
  createUsers()
    .then(() => {
      console.log('✅ Seed completado exitosamente')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error ejecutando seed:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
