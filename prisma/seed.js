/* eslint-disable @typescript-eslint/no-require-imports */
const {
  PrismaClient,
  DocumentType,
  Gender,
  MaritalStatus,
  AdminLevel,
  PropertyType,
} = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed simple...");

  // ========================================
  // 1. LIMPIAR BASE DE DATOS
  // ========================================

  console.log("🧹 Limpiando base de datos...");

  // Eliminar en orden de dependencias
  await prisma.contract.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.commonZone.deleteMany({});
  await prisma.unit.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("✅ Base de datos limpia");

  // ========================================
  // 2. CREAR USUARIOS ADMINISTRADORES
  // ========================================

  console.log("👥 Creando administradores...");

  const admin1 = await prisma.admin.create({
    data: {
      adminLevel: AdminLevel.SUPER_ADMIN,
      user: {
        create: {
          email: "admin1@propiedades.com",
          phone: "+57 300 111 1111",
          name: "Carlos",
          lastName: "Administrador",
          birthDate: new Date("1985-03-15"),
          documentType: DocumentType.CC,
          documentNumber: "12345678",
          gender: Gender.MALE,
          maritalStatus: MaritalStatus.MARRIED,
          address: "Calle 100 #15-20",
          city: "Bogotá",
          state: "Cundinamarca",
          country: "Colombia",
          profession: "Administrador de Propiedades",
        },
      },
    },
    include: { user: true },
  });

  const admin2 = await prisma.admin.create({
    data: {
      adminLevel: AdminLevel.MANAGER,
      createdBy: { connect: { id: admin1.id } },
      user: {
        create: {
          email: "admin2@propiedades.com",
          phone: "+57 300 222 2222",
          name: "María",
          lastName: "Supervisora",
          birthDate: new Date("1990-07-22"),
          documentType: DocumentType.CC,
          documentNumber: "23456789",
          gender: Gender.FEMALE,
          maritalStatus: MaritalStatus.SINGLE,
          address: "Carrera 7 #45-30",
          city: "Bogotá",
          state: "Cundinamarca",
          country: "Colombia",
          profession: "Supervisora de Mantenimiento",
        },
      },
    },
    include: { user: true },
  });

  const admin3 = await prisma.admin.create({
    data: {
      adminLevel: AdminLevel.STANDARD,
      createdBy: { connect: { id: admin1.id } },
      user: {
        create: {
          email: "admin3@propiedades.com",
          phone: "+57 300 333 3333",
          name: "Luis",
          lastName: "Gerente",
          birthDate: new Date("1982-11-08"),
          documentType: DocumentType.CC,
          documentNumber: "34567890",
          gender: Gender.MALE,
          maritalStatus: MaritalStatus.DIVORCED,
          address: "Avenida 68 #25-10",
          city: "Bogotá",
          state: "Cundinamarca",
          country: "Colombia",
          profession: "Gerente General",
        },
      },
    },
    include: { user: true },
  });

  const admin4 = await prisma.admin.create({
    data: {
      adminLevel: AdminLevel.LIMITED,
      createdBy: { connect: { id: admin3.id } },
      user: {
        create: {
          email: "portero@propiedades.com",
          phone: "+57 300 888 8888",
          name: "Roberto",
          lastName: "Portero",
          birthDate: new Date("1970-01-15"),
          documentType: DocumentType.CC,
          documentNumber: "78901234",
          gender: Gender.MALE,
          maritalStatus: MaritalStatus.WIDOWED,
          address: "Calle 50 #30-20",
          city: "Bogotá",
          state: "Cundinamarca",
          country: "Colombia",
          profession: "Vigilante",
        },
      },
    },
    include: { user: true },
  });

  console.log(`✅ Administradores creados:`);
  console.log(`   - ${admin1.user.name}: ${AdminLevel.SUPER_ADMIN}`);
  console.log(`   - ${admin2.user.name}: ${AdminLevel.MANAGER}`);
  console.log(`   - ${admin3.user.name}: ${AdminLevel.STANDARD}`);
  console.log(`   - ${admin4.user.name}: ${AdminLevel.STANDARD}`);

  // ========================================
  // 4. CREAR PROPIEDAD
  // ========================================

  console.log("🏢 Creando propiedad...");

  const property = await prisma.property.create({
    data: {
      admin: { connect: { id: admin1.id } },
      name: "Edificio Plaza Central",
      description: "Edificio mixto de 2 pisos con locales comerciales y apartamentos",
      street: "Carrera 92",
      number: "147-50",
      city: "Bogotá",
      neighborhood: "Suba",
      state: "Cundinamarca",
      postalCode: "111111",
      country: "Colombia",
      gpsCoordinates: "4.7409,-74.0705",
      propertyType: PropertyType.COMMERCIAL_SPACE,
      totalLandArea: 200.0,
      builtArea: 360.0, // 180 m² por piso
      floors: 2,
      age: 5,
      parking: 4,
      parkingLocation: "Parte trasera del edificio",
      commonZones: {
        create: [
          {
            admin: { connect: { id: admin2.id } },
            name: "Escaleras",
            description: "Escaleras principales - Acceso a segundo piso",
          },
          {
            admin: { connect: { id: admin2.id } },
            name: "Entrada",
            description: "Área frontal - Entrada principal y recepción",
          },
        ],
      },
      units: {
        create: [
          {
            unitNumber: "L-101",
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
            status: "OCCUPIED",
            baseRent: 2500000,
            deposit: 7500000,
            description: "Local comercial de 45 m² con excelente ubicación y vitrina.",
            images: JSON.stringify(["https://ejemplo.com/local1.jpg"]),
            lastInspectionDate: new Date("2024-01-01"),
          },
          {
            unitNumber: "L-102",
            floor: 1,
            area: 60.0,
            bedrooms: 0,
            bathrooms: 1,
            baseRent: 3000000,
            deposit: 9000000,
            furnished: false,
            waterIncluded: true,
            gasIncluded: true,
            status: "OCCUPIED",
            description: "Local para oficina de 60 m². Baño privado y entrada independiente.",
            images: JSON.stringify(["https://ejemplo.com/local2.jpg"]),
            lastInspectionDate: new Date("2024-01-10"),
          },
          {
            unitNumber: "A-201",
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
            status: "OCCUPIED",
            description: "Apartamento amplio con 2 habitaciones, vista al parque.",
            images: JSON.stringify(["https://ejemplo.com/apt1.jpg"]),
            lastInspectionDate: new Date("2024-03-01"),
          },
          {
            unitNumber: "A-202",
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
            status: "OCCUPIED",
            description: "Apartamento totalmente amoblado. Vista panorámica.",
            images: JSON.stringify(["https://ejemplo.com/apt2.jpg"]),
            lastInspectionDate: new Date("2024-03-15"),
          },
        ],
      },
    },
    include: {
      commonZones: true,
      units: true,
    },
  });

  console.log(`✅ Propiedad creada: ${property.name}`);
  console.log(`   - ${property.commonZones.length} zonas comunes`);
  console.log(`   - ${property.units.length} unidades`);

  // Extraer las unidades creadas para referencias
  const [local1, local2, apartamento1, apartamento2] = property.units;

  // ========================================
  // 7. CREAR INQUILINOS
  // ========================================

  console.log("🏠 Creando inquilinos...");

  const tenant1 = await prisma.tenant.create({
    data: {
      user: {
        create: {
          email: "comerciante1@gmail.com",
          phone: "+57 300 444 4444",
          name: "Ana",
          lastName: "Comerciante",
          birthDate: new Date("1988-05-20"),
          documentType: DocumentType.CC,
          documentNumber: "45678901",
          gender: Gender.FEMALE,
          maritalStatus: MaritalStatus.MARRIED,
          address: "Calle 80 #12-34",
          city: "Bogotá",
          state: "Cundinamarca",
          country: "Colombia",
          profession: "Comerciante",
        },
      },
    },
    include: { user: true },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      user: {
        create: {
          email: "comerciante2@gmail.com",
          phone: "+57 300 555 5555",
          name: "Pedro",
          lastName: "Empresario",
          birthDate: new Date("1975-12-10"),
          documentType: DocumentType.CC,
          documentNumber: "56789012",
          gender: Gender.MALE,
          maritalStatus: MaritalStatus.MARRIED,
          address: "Avenida 19 #67-89",
          city: "Bogotá",
          state: "Cundinamarca",
          country: "Colombia",
          profession: "Empresario",
        },
      },
    },
    include: { user: true },
  });

  const tenant3 = await prisma.tenant.create({
    data: {
      user: {
        create: {
          email: "residente1@gmail.com",
          phone: "+57 300 666 6666",
          name: "Laura",
          lastName: "Profesional",
          birthDate: new Date("1992-09-14"),
          documentType: DocumentType.CC,
          documentNumber: "67890123",
          gender: Gender.FEMALE,
          maritalStatus: MaritalStatus.SINGLE,
          address: "Calle 127 #45-67",
          city: "Bogotá",
          state: "Cundinamarca",
          country: "Colombia",
          profession: "Ingeniera",
        },
      },
    },
    include: { user: true },
  });

  const tenant4 = await prisma.tenant.create({
    data: {
      user: {
        create: {
          email: "extranjero1@gmail.com",
          phone: "+57 300 777 7777",
          name: "John",
          lastName: "Smith",
          birthDate: new Date("1986-04-25"),
          documentType: DocumentType.PASSPORT,
          documentNumber: "US1234567",
          gender: Gender.MALE,
          maritalStatus: MaritalStatus.COMMON_LAW,
          address: "Calle 93 #14-20",
          city: "Bogotá",
          state: "Cundinamarca",
          country: "Estados Unidos",
          profession: "Consultor Internacional",
        },
      },
    },
    include: { user: true },
  });

  console.log(`✅ Inquilinos creados:`);
  console.log(`   - ${tenant1.user.name} ${tenant1.user.lastName}`);
  console.log(`   - ${tenant2.user.name} ${tenant2.user.lastName}`);
  console.log(`   - ${tenant3.user.name} ${tenant3.user.lastName}`);
  console.log(`   - ${tenant4.user.name} ${tenant4.user.lastName}`);

  // ========================================
  // 9. CREAR CONTRATOS
  // ========================================

  console.log("📄 Creando contratos...");

  // Contrato 1: Local 1
  const contract1 = await prisma.contract.create({
    data: {
      unitId: local1.id,
      tenantId: tenant1.id,
      adminId: admin1.id,
      rent: 2500000,
      deposit: 7500000,
      securityDeposit: 2500000,
      lateFeePenalty: 5.0,
      gracePeriodDays: 3,
      autoRenewal: true,
      renewalPeriod: 12,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      terms: "El arrendatario se compromete a mantener el local en buen estado...",
      status: "ACTIVE",
      notes: "Local comercial para tienda de ropa. Incluye vitrina frontal.",
    },
  });

  // Contrato 2: Local 2
  const contract2 = await prisma.contract.create({
    data: {
      unitId: local2.id,
      tenantId: tenant2.id,
      adminId: admin2.id,
      rent: 3000000,
      deposit: 9000000,
      securityDeposit: 3000000,
      lateFeePenalty: 4.0,
      gracePeriodDays: 5,
      autoRenewal: false,
      startDate: new Date("2024-02-01"),
      endDate: new Date("2025-01-31"),
      terms: "El arrendador no se hace responsable por servicios no incluidos.",
      status: "ACTIVE",
      notes: "Local comercial para oficina de servicios. Incluye baño privado.",
    },
  });

  // Contrato 3: Apartamento 1
  const contract3 = await prisma.contract.create({
    data: {
      unitId: apartamento1.id,
      tenantId: tenant3.id,
      adminId: admin1.id,
      rent: 1800000,
      deposit: 3600000,
      securityDeposit: 1800000,
      lateFeePenalty: 3.5,
      gracePeriodDays: 4,
      autoRenewal: true,
      renewalPeriod: 12,
      startDate: new Date("2024-03-01"),
      endDate: new Date("2025-02-28"),
      terms:
        "El arrendatario acepta pagar puntualmente cada mes y mantener el inmueble en óptimas condiciones.",
      status: "ACTIVE",
      notes: "Apartamento de 2 habitaciones. Incluye servicios básicos.",
    },
  });

  // Contrato 4: Apartamento 2
  const contract4 = await prisma.contract.create({
    data: {
      unitId: apartamento2.id,
      tenantId: tenant4.id,
      adminId: admin3.id,
      rent: 2200000,
      deposit: 4400000,
      securityDeposit: 2200000,
      lateFeePenalty: 5.0,
      gracePeriodDays: 3,
      autoRenewal: false,
      startDate: new Date("2024-04-01"),
      endDate: new Date("2025-03-31"),
      terms: "No se permiten mascotas sin autorización previa. El arrendamiento no incluye parqueadero.",
      status: "ACTIVE",
      notes: "Apartamento amoblado de 2 habitaciones. Vista panorámica.",
    },
  });

  console.log(`✅ Contratos creados:`);
  console.log(`   - Local 1: ${tenant1.user.name} - ${contract1.rent.toLocaleString()}`);
  console.log(`   - Local 2: ${tenant2.user.name} - ${contract2.rent.toLocaleString()}`);
  console.log(`   - Apartamento 1: ${tenant3.user.name} - ${contract3.rent.toLocaleString()}`);
  console.log(`   - Apartamento 2: ${tenant4.user.name} - ${contract4.rent.toLocaleString()}`);

  // ========================================
  // 10. ASIGNAR ADMINISTRADORES A CONTRATOS
  // ========================================

  console.log("🔗 Asignando administradores a contratos...");

  // Actualizar contratos para incluir administradores
  await prisma.contract.update({
    where: { id: contract1.id },
    data: {
      admins: {
        connect: [{ id: admin1.id }, { id: admin3.id }],
      },
    },
  });

  await prisma.contract.update({
    where: { id: contract2.id },
    data: {
      admins: {
        connect: [{ id: admin2.id }, { id: admin3.id }],
      },
    },
  });

  await prisma.contract.update({
    where: { id: contract3.id },
    data: {
      admins: {
        connect: [{ id: admin1.id }, { id: admin2.id }],
      },
    },
  });

  await prisma.contract.update({
    where: { id: contract4.id },
    data: {
      admins: {
        connect: [{ id: admin2.id }, { id: admin3.id }],
      },
    },
  });

  // ========================================
  // 11. ESTADÍSTICAS FINALES
  // ========================================

  const totalRent = contract1.rent + contract2.rent + contract3.rent + contract4.rent;

  console.log("\n📊 RESUMEN DEL SISTEMA CREADO:");
  console.log("═══════════════════════════════");
  console.log(`🏢 Propiedad: ${property.name}`);
  console.log(`   - Tipo: ${PropertyType.COMMERCIAL_SPACE}`);
  console.log(`   - Ubicación: ${property.neighborhood}, ${property.city}`);
  console.log(`   - Estructura: ${property.floors} pisos, ${property.builtArea}m²`);
  console.log("");
  console.log("👥 USUARIOS:");
  console.log(`   - Administradores: 4`);
  console.log(`     • ${AdminLevel.SUPER_ADMIN}: 1`);
  console.log(`     • ${AdminLevel.MANAGER}: 1`);
  console.log(`     • ${AdminLevel.STANDARD}: 1`);
  console.log(`     • ${AdminLevel.LIMITED}: 1`);
  console.log(`   - Inquilinos: 4`);
  console.log("");
  console.log("📄 CONTRATOS:");
  console.log(`   - Contratos activos: 4`);
  console.log(`   - Ingresos mensuales totales: ${totalRent.toLocaleString()}`);
  console.log(`   - Ocupación: 100% (4/4 unidades)`);
  console.log("");
  console.log("📋 TIPOS DE DOCUMENTOS USADOS:");
  console.log(`   - ${DocumentType.CC}: 7 usuarios`);
  console.log(`   - ${DocumentType.PASSPORT}: 1 usuario`);
  console.log("");
  console.log("✅ ¡Sistema listo para usar!");
}

main()
  .catch((e) => {
    console.error("💥 Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
