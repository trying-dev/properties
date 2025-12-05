/* eslint-disable @typescript-eslint/no-require-imports */
const {
  PrismaClient,
  DocumentType,
  Gender,
  MaritalStatus,
  EmploymentStatus,
  AdminLevel,
  PropertyType,
  PropertyStatus,
  UnitStatus,
  ContractStatus,
  PaymentStatus,
  PaymentType,
  PaymentMethod,
} = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const main = async () => {
  console.log('🌱 Iniciando seed coherente...')

  // Password desde .env
  const seedPassword = process.env.SEED_PASSWORD || 'password123'
  const hashedPassword = await bcrypt.hash(seedPassword, 10)

  // ========================================
  // 1. LIMPIAR BASE DE DATOS
  // ========================================

  console.log('🧹 Limpiando base de datos...')

  // Eliminar en orden de dependencias (de dependiente a independiente)
  await prisma.payment.deleteMany({})
  await prisma.contractDocument.deleteMany({})
  await prisma.contract.deleteMany({})
  await prisma.reference.deleteMany({})
  await prisma.tenant.deleteMany({})
  await prisma.unit.deleteMany({})
  await prisma.property.deleteMany({})
  await prisma.admin.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('✅ Base de datos limpia')

  // ========================================
  // 2. CREAR USUARIOS ADMINISTRADORES
  // ========================================

  console.log('👥 Creando administradores...')

  const admin1 = await prisma.admin.create({
    data: {
      adminLevel: AdminLevel.SUPER_ADMIN,
      user: {
        create: {
          email: 'admin1@propiedades.com',
          password: hashedPassword,
          phone: '+57 300 111 1111',
          name: 'Carlos',
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

  const admin2 = await prisma.admin.create({
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

  const admin3 = await prisma.admin.create({
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

  const admin4 = await prisma.admin.create({
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

  console.log(`✅ Administradores creados:`)
  console.log(`   - ${admin1.user.name}: ${AdminLevel.SUPER_ADMIN}`)
  console.log(`   - ${admin2.user.name}: ${AdminLevel.MANAGER}`)
  console.log(`   - ${admin3.user.name}: ${AdminLevel.STANDARD}`)
  console.log(`   - ${admin4.user.name}: ${AdminLevel.LIMITED}`)

  // ========================================
  // 3. CREAR USUARIOS INQUILINOS
  // ========================================

  console.log('🏠 Creando inquilinos...')

  const tenant1 = await prisma.tenant.create({
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

  const tenant2 = await prisma.tenant.create({
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

  const tenant3 = await prisma.tenant.create({
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

  const tenant4 = await prisma.tenant.create({
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

  console.log(`✅ Inquilinos creados:`)
  console.log(`   - ${tenant1.user.name} ${tenant1.user.lastName} (${tenant1.references.length} referencias)`)
  console.log(`   - ${tenant2.user.name} ${tenant2.user.lastName} (${tenant2.references.length} referencias)`)
  console.log(`   - ${tenant3.user.name} ${tenant3.user.lastName} (${tenant3.references.length} referencias)`)
  console.log(`   - ${tenant4.user.name} ${tenant4.user.lastName} (${tenant4.references.length} referencias)`)

  // ========================================
  // 4. CREAR PROPIEDAD CON UNIDADES
  // ========================================

  console.log('🏢 Creando propiedad...')

  // Definir zonas comunes como JSON
  const commonZones = [
    {
      name: 'Escaleras',
      description: 'Escaleras principales - Acceso a segundo piso',
      available: true,
      adminId: admin2.id,
    },
    {
      name: 'Entrada',
      description: 'Área frontal - Entrada principal y recepción',
      available: true,
      openingTime: '06:00',
      closingTime: '22:00',
      adminId: admin2.id,
    },
  ]

  const property = await prisma.property.create({
    data: {
      admin: { connect: { id: admin1.id } },
      name: 'Edificio Plaza Central',
      description: 'Edificio mixto de 2 pisos con locales comerciales y apartamentos',
      street: 'Carrera 92',
      number: '147-50',
      city: 'Bogotá',
      neighborhood: 'Suba',
      state: 'Cundinamarca',
      postalCode: '111111',
      country: 'Colombia',
      gpsCoordinates: '4.7409,-74.0705',
      propertyType: PropertyType.BUILDING,
      status: PropertyStatus.ACTIVE,
      totalLandArea: 200.0,
      builtArea: 360.0,
      floors: 2,
      age: 5,
      parking: 4,
      parkingLocation: 'Parte trasera del edificio',
      commonZones: JSON.stringify(commonZones), // Zonas comunes como JSON
    },
    include: {
      units: true,
    },
  })

  // Crear unidades por separado para tener mejor control
  const local1 = await prisma.unit.create({
    data: {
      property: { connect: { id: property.id } },
      unitNumber: 'L-101',
      floor: 1,
      area: 45.5,
      bedrooms: 0,
      bathrooms: 1,
      furnished: false,
      balcony: false,
      parking: false,
      storage: false,
      petFriendly: false,
      smokingAllowed: false,
      internet: false,
      cableTV: false,
      waterIncluded: true,
      gasIncluded: true,
      status: UnitStatus.OCCUPIED,
      baseRent: 2500000,
      deposit: 7500000,
      description: 'Local comercial de 45 m² con excelente ubicación y vitrina.',
      images: JSON.stringify(['https://ejemplo.com/local1.jpg']),
      lastInspectionDate: new Date('2024-01-01'),
    },
  })

  const local2 = await prisma.unit.create({
    data: {
      property: { connect: { id: property.id } },
      unitNumber: 'L-102',
      floor: 1,
      area: 60.0,
      bedrooms: 0,
      bathrooms: 1,
      baseRent: 3000000,
      deposit: 9000000,
      furnished: false,
      waterIncluded: true,
      gasIncluded: true,
      status: UnitStatus.OCCUPIED,
      description: 'Local para oficina de 60 m². Baño privado y entrada independiente.',
      images: JSON.stringify(['https://ejemplo.com/local2.jpg']),
      lastInspectionDate: new Date('2024-01-10'),
    },
  })

  const apartamento1 = await prisma.unit.create({
    data: {
      property: { connect: { id: property.id } },
      unitNumber: 'A-201',
      floor: 2,
      area: 70.0,
      bedrooms: 2,
      bathrooms: 1.5,
      furnished: false,
      petFriendly: true,
      internet: true,
      cableTV: true,
      baseRent: 1800000,
      deposit: 3600000,
      status: UnitStatus.OCCUPIED,
      description: 'Apartamento amplio con 2 habitaciones, vista al parque.',
      images: JSON.stringify(['https://ejemplo.com/apt1.jpg']),
      lastInspectionDate: new Date('2024-03-01'),
    },
  })

  const apartamento2 = await prisma.unit.create({
    data: {
      property: { connect: { id: property.id } },
      unitNumber: 'A-202',
      floor: 2,
      area: 75.0,
      bedrooms: 2,
      bathrooms: 2,
      furnished: true,
      petFriendly: true,
      internet: true,
      cableTV: true,
      baseRent: 2200000,
      deposit: 4400000,
      status: UnitStatus.OCCUPIED,
      description: 'Apartamento totalmente amoblado. Vista panorámica.',
      images: JSON.stringify(['https://ejemplo.com/apt2.jpg']),
      lastInspectionDate: new Date('2024-03-15'),
    },
  })

  console.log(`✅ Propiedad creada: ${property.name}`)
  console.log(`   - 4 unidades creadas`)
  console.log(`   - 2 zonas comunes creadas (JSON)`)

  // ========================================
  // 5. CREAR CONTRATOS
  // ========================================

  console.log('📄 Creando contratos...')

  // Contrato 1: Local 1
  const contract1 = await prisma.contract.create({
    data: {
      unit: { connect: { id: local1.id } },
      tenant: { connect: { id: tenant1.id } },
      adminId: admin1.id,
      rent: 2500000,
      deposit: 7500000,
      securityDeposit: 2500000,
      lateFeePenalty: 5.0,
      gracePeriodDays: 3,
      autoRenewal: true,
      renewalPeriod: 12,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      terms:
        'El arrendatario se compromete a mantener el local en buen estado y a pagar puntualmente el arriendo cada mes.',
      status: ContractStatus.ACTIVE,
      notes: 'Local comercial para tienda de ropa. Incluye vitrina frontal.',
      signedAt: new Date('2023-12-15'),
    },
  })

  // Contrato 2: Local 2
  const contract2 = await prisma.contract.create({
    data: {
      unit: { connect: { id: local2.id } },
      tenant: { connect: { id: tenant2.id } },
      adminId: admin2.id,
      rent: 3000000,
      deposit: 9000000,
      securityDeposit: 3000000,
      lateFeePenalty: 4.0,
      gracePeriodDays: 5,
      autoRenewal: false,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-01-31'),
      terms: 'El arrendador no se hace responsable por servicios no incluidos en el contrato.',
      status: ContractStatus.ACTIVE,
      notes: 'Local comercial para oficina de servicios. Incluye baño privado.',
      signedAt: new Date('2024-01-20'),
    },
  })

  const additionalResidentsTenant1 = [
    {
      id: 'user_carlos',
      name: 'Carlos',
      lastName: 'Perez',
      email: 'carlos.comerciante@gmail.com',
      phone: '+57 300 555 5555',
      documentNumber: '45678902',
      birthDate: new Date('1985-05-15'),
      profession: 'Ingeniero',
    },
    {
      id: 'user_sofia',
      name: 'Sofia',
      lastName: 'Hernandez',
      email: 'sofia.comerciante@gmail.com',
      documentNumber: '45678903',
      birthDate: new Date('2010-08-20'),
    },
    {
      id: 'user_maria',
      name: 'Maria',
      lastName: 'Hernandez',
      email: 'maria.rodriguez@gmail.com',
      phone: '+57 300 666 6666',
      documentNumber: '45678904',
      birthDate: new Date('1992-03-10'),
      profession: 'Diseñadora',
    },
  ]

  // Contrato 3: Apartamento 1
  const contract3 = await prisma.contract.create({
    data: {
      unit: { connect: { id: apartamento1.id } },
      tenant: { connect: { id: tenant3.id } },
      additionalResidents: {
        create: additionalResidentsTenant1.map((r) => ({
          id: r.id,
          name: r.name,
          lastName: r.lastName,
          email: r.email,
          password: hashedPassword,
          phone: r.phone,
          documentNumber: r.documentNumber,
          birthDate: r.birthDate,
          profession: r.profession,
          documentType: 'CC',
          gender: 'OTHER',
          maritalStatus: 'SINGLE',
        })),
      },
      adminId: admin1.id,
      rent: 1800000,
      deposit: 3600000,
      securityDeposit: 1800000,
      lateFeePenalty: 3.5,
      gracePeriodDays: 4,
      autoRenewal: true,
      renewalPeriod: 12,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-02-28'),
      terms:
        'El arrendatario acepta pagar puntualmente cada mes y mantener el inmueble en óptimas condiciones.',
      status: ContractStatus.ACTIVE,
      notes: 'Apartamento de 2 habitaciones. Incluye servicios básicos.',
      signedAt: new Date('2024-02-25'),
    },
  })

  // Contrato 4: Apartamento 2
  const contract4 = await prisma.contract.create({
    data: {
      unit: { connect: { id: apartamento2.id } },
      tenant: { connect: { id: tenant4.id } },
      adminId: admin3.id,
      rent: 2200000,
      deposit: 4400000,
      securityDeposit: 2200000,
      lateFeePenalty: 5.0,
      gracePeriodDays: 3,
      autoRenewal: false,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      terms:
        'No se permiten mascotas sin autorización previa. El arrendamiento incluye muebles pero no parqueadero.',
      status: ContractStatus.ACTIVE,
      notes: 'Apartamento amoblado de 2 habitaciones. Vista panorámica.',
      signedAt: new Date('2024-03-25'),
    },
  })

  console.log(`✅ Contratos creados:`)
  console.log(`   - Local 1: ${tenant1.user.name} - $${contract1.rent.toLocaleString()}`)
  console.log(`   - Local 2: ${tenant2.user.name} - $${contract2.rent.toLocaleString()}`)
  console.log(`   - Apartamento 1: ${tenant3.user.name} - $${contract3.rent.toLocaleString()}`)
  console.log(`   - Apartamento 2: ${tenant4.user.name} - $${contract4.rent.toLocaleString()}`)

  // ========================================
  // 6. ASIGNAR ADMINISTRADORES A CONTRATOS
  // ========================================

  console.log('🔗 Asignando administradores a contratos...')

  // Actualizar contratos para incluir administradores en la relación many-to-many
  await prisma.contract.update({
    where: { id: contract1.id },
    data: {
      admins: {
        connect: [{ id: admin1.id }, { id: admin3.id }],
      },
    },
  })

  await prisma.contract.update({
    where: { id: contract2.id },
    data: {
      admins: {
        connect: [{ id: admin2.id }, { id: admin3.id }],
      },
    },
  })

  await prisma.contract.update({
    where: { id: contract3.id },
    data: {
      admins: {
        connect: [{ id: admin1.id }, { id: admin2.id }],
      },
    },
  })

  await prisma.contract.update({
    where: { id: contract4.id },
    data: {
      admins: {
        connect: [{ id: admin2.id }, { id: admin3.id }],
      },
    },
  })

  console.log('✅ Administradores asignados a contratos')

  // ========================================
  // 7. CREAR PAGOS
  // ========================================

  console.log('💰 Creando historial de pagos...')

  // Pagos para el contrato 1 (últimos 3 meses)
  await prisma.payment.create({
    data: {
      contract: { connect: { id: contract1.id } },
      amount: 2500000,
      dueDate: new Date('2024-05-01'),
      paidDate: new Date('2024-05-01'),
      paymentType: PaymentType.RENT,
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      transactionId: 'TRX-001-2024',
      receiptNumber: 'REC-001',
    },
  })

  await prisma.payment.create({
    data: {
      contract: { connect: { id: contract1.id } },
      amount: 2500000,
      dueDate: new Date('2024-06-01'),
      paidDate: new Date('2024-06-03'),
      paymentType: PaymentType.RENT,
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      transactionId: 'TRX-002-2024',
      receiptNumber: 'REC-002',
      lateFeeAmount: 0,
      lateFeeApplied: false,
    },
  })

  // Pago pendiente
  await prisma.payment.create({
    data: {
      contract: { connect: { id: contract1.id } },
      amount: 2500000,
      dueDate: new Date('2024-07-01'),
      paymentType: PaymentType.RENT,
      status: PaymentStatus.OVERDUE,
      notes: 'Pago vencido - Se aplicará recargo según contrato',
    },
  })

  // Pagos para contrato 2
  await prisma.payment.create({
    data: {
      contract: { connect: { id: contract2.id } },
      amount: 3000000,
      dueDate: new Date('2024-06-01'),
      paidDate: new Date('2024-05-30'),
      paymentType: PaymentType.RENT,
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.CHECK,
      receiptNumber: 'REC-003',
    },
  })

  await prisma.payment.create({
    data: {
      contractId: contract2.id,
      amount: 3000000,
      dueDate: new Date('2024-07-01'),
      paymentType: PaymentType.RENT,
      status: PaymentStatus.PENDING,
    },
  })

  // Pagos para contratos 3 y 4
  await prisma.payment.create({
    data: {
      contractId: contract3.id,
      amount: 1800000,
      dueDate: new Date('2024-06-01'),
      paidDate: new Date('2024-06-01'),
      paymentType: PaymentType.RENT,
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.DIGITAL_WALLET,
      transactionId: 'PSE-123456',
      receiptNumber: 'REC-004',
    },
  })

  await prisma.payment.create({
    data: {
      contractId: contract4.id,
      amount: 2200000,
      dueDate: new Date('2024-06-01'),
      paidDate: new Date('2024-06-02'),
      paymentType: PaymentType.RENT,
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      transactionId: 'TRX-005-2024',
      receiptNumber: 'REC-005',
    },
  })

  console.log('✅ Historial de pagos creado (7 pagos)')

  // ========================================
  // 8. ESTADÍSTICAS FINALES
  // ========================================

  const totalRent = contract1.rent + contract2.rent + contract3.rent + contract4.rent
  const totalDeposits = contract1.deposit + contract2.deposit + contract3.deposit + contract4.deposit

  // Contar datos creados
  const userCount = await prisma.user.count()
  const adminCount = await prisma.admin.count()
  const tenantCount = await prisma.tenant.count()
  const contractCount = await prisma.contract.count()
  const paymentCount = await prisma.payment.count()
  const unitCount = await prisma.unit.count()

  console.log('\n📊 RESUMEN DEL SISTEMA CREADO:')
  console.log('═══════════════════════════════')
  console.log(`🏢 Propiedad: ${property.name}`)
  console.log(`   - Tipo: ${property.propertyType}`)
  console.log(`   - Ubicación: ${property.neighborhood}, ${property.city}`)
  console.log(`   - Estructura: ${property.floors} pisos, ${property.builtArea}m²`)
  console.log(`   - Estado: ${property.status}`)
  console.log('')
  console.log('👥 USUARIOS CREADOS:')
  console.log(`   - Total usuarios: ${userCount}`)
  console.log(`   - Administradores: ${adminCount}`)
  console.log(`     • ${AdminLevel.SUPER_ADMIN}: 1`)
  console.log(`     • ${AdminLevel.MANAGER}: 1`)
  console.log(`     • ${AdminLevel.STANDARD}: 1`)
  console.log(`     • ${AdminLevel.LIMITED}: 1`)
  console.log(`   - Inquilinos: ${tenantCount}`)
  console.log('')
  console.log('🏠 INFRAESTRUCTURA:')
  console.log(`   - Unidades: ${unitCount}`)
  console.log(`   - Zonas comunes: 2 (almacenadas en JSON)`)
  console.log(`   - Ocupación: 100% (${unitCount}/${unitCount} unidades)`)
  console.log('')
  console.log('📄 CONTRATOS Y FINANZAS:')
  console.log(`   - Contratos activos: ${contractCount}`)
  console.log(`   - Pagos registrados: ${paymentCount}`)
  console.log(`   - Ingresos mensuales: ${totalRent.toLocaleString()}`)
  console.log(`   - Total depósitos: ${totalDeposits.toLocaleString()}`)
  console.log('')
  console.log('📋 TIPOS DE DOCUMENTOS:')
  console.log(`   - Cédulas de Ciudadanía: 7`)
  console.log(`   - Pasaportes: 1`)
  console.log('')
  console.log('✅ ¡Sistema completamente funcional y coherente!')
  console.log('🎯 Puedes comenzar a probar todas las funcionalidades')
}

main()
  .catch((e) => {
    console.error('💥 Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    require('./seeds/2-casas')
    await prisma.$disconnect()
  })
