/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const { createUsersAndAdmins } = require("./seeds/managers");
const { createOptimizedBuildingFiveFloors } = require("./seeds/5-pisos");
const { resetDatabase, checkDatabaseStatus } = require("./seeds/reset");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed principal modernizado...");

  // ========================================
  // 1. LIMPIEZA COMPLETA
  // ========================================

  console.log("🧹 Limpiando base de datos...");
  await resetDatabase(prisma);

  // ========================================
  // 2. CREAR USUARIOS Y ADMINISTRADORES
  // ========================================

  console.log("👥 Creando usuarios y administradores...");
  await createUsersAndAdmins(prisma);

  // Obtener el admin principal
  const adminUser = await prisma.user.findFirst({
    where: { email: "juan.super@properties.com" },
    include: { admin: true },
  });

  if (!adminUser || !adminUser.admin) {
    throw new Error("No se pudo encontrar el usuario administrador creado");
  }

  console.log(`✅ Admin principal: ${adminUser.name} ${adminUser.lastName}`);

  // ========================================
  // 3. CREAR EDIFICIO OPTIMIZADO DE 5 PISOS
  // ========================================

  console.log("🏢 Creando edificio optimizado...");
  const buildingStats = await createOptimizedBuildingFiveFloors(prisma, adminUser.admin.id);

  // ========================================
  // 4. CREAR USUARIOS ADICIONALES PARA EL EDIFICIO
  // ========================================

  console.log("👤 Creando usuarios adicionales para el edificio...");

  // Propietario
  const ownerUser = await prisma.user.create({
    data: {
      name: "María Elena",
      lastName: "Propietaria",
      email: "owner@properties.com",
      phone: "+57 301 234 5678",
      address: "Carrera 7 #89-12, Bogotá",
      status: "ACTIVE",
    },
  });

  // Inquilinos
  const tenant1User = await prisma.user.create({
    data: {
      name: "Carlos Andrés",
      lastName: "Inquilino",
      email: "tenant1@properties.com",
      phone: "+57 302 345 6789",
      birthDate: new Date("1990-05-15"),
      address: "Avenida 68 #12-34, Bogotá",
      status: "ACTIVE",
    },
  });

  const tenant2User = await prisma.user.create({
    data: {
      name: "Ana Sofía",
      lastName: "Estudiante",
      email: "tenant2@properties.com",
      phone: "+57 304 567 8901",
      birthDate: new Date("1995-08-20"),
      address: "Calle 45 #23-67, Bogotá",
      status: "ACTIVE",
    },
  });

  // Técnico de mantenimiento
  const workerUser = await prisma.user.create({
    data: {
      name: "Luis Fernando",
      lastName: "Técnico",
      email: "worker@properties.com",
      phone: "+57 303 456 7890",
      address: "Calle 26 #56-78, Bogotá",
      status: "ACTIVE",
    },
  });

  // ========================================
  // 5. CREAR ROLES PARA LOS USUARIOS
  // ========================================

  console.log("🎭 Asignando roles a usuarios...");

  // Crear inquilinos
  const tenant1 = await prisma.tenant.create({
    data: {
      userId: tenant1User.id,
      status: "ACTIVE",
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      userId: tenant2User.id,
      status: "ACTIVE",
    },
  });

  // Crear técnico
  const worker = await prisma.worker.create({
    data: {
      userId: workerUser.id,
      specialty: "GENERAL_MAINTENANCE",
      certifications: JSON.stringify([
        "Técnico en mantenimiento general",
        "Certificación en seguridad industrial",
        "Instalaciones eléctricas básicas",
      ]),
      availability: JSON.stringify({
        days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        hours: "08:00-17:00",
        emergency: "24/7",
      }),
      hourlyRate: 35000, // Actualizado para 2024
    },
  });

  // ========================================
  // 6. CREAR CONTRATOS PARA UNIDADES OCUPADAS
  // ========================================

  console.log("📄 Creando contratos para unidades ocupadas...");

  // Obtener las unidades ocupadas del edificio
  const occupiedUnits = await prisma.unit.findMany({
    where: {
      propertyId: buildingStats.property.id,
      isAvailable: false,
      unitType: { in: ["LOCAL", "APARTMENT", "ROOM"] }, // Solo unidades privadas
    },
  });

  // Crear contratos para las unidades ocupadas
  const tenants = [tenant1, tenant2];
  let tenantIndex = 0;

  for (const unit of occupiedUnits) {
    const currentTenant = tenants[tenantIndex % tenants.length];

    let contractType = "RENTAL";
    if (unit.unitType === "LOCAL") {
      contractType = "COMMERCIAL_LEASE";
    }

    const contract = await prisma.contract.create({
      data: {
        unitId: unit.id,
        contractType: contractType,
        contractName: `Contrato ${unit.unitType} ${unit.unitNumber}`,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        monthlyRent: unit.rent,
        deposit: unit.rent * (contractType === "COMMERCIAL_LEASE" ? 3 : 2),
        isActive: true,
        tenantResponsibilities: JSON.stringify(
          contractType === "COMMERCIAL_LEASE"
            ? [
                "Pago puntual del arrendamiento",
                "Cumplimiento de horarios comerciales",
                "Servicios públicos comerciales",
                "Mantenimiento interior del local",
              ]
            : unit.unitType === "ROOM"
              ? [
                  "Pago puntual del arrendamiento",
                  "Respeto por áreas comunes compartidas",
                  "Limpieza de la habitación",
                  "Uso responsable de cocina y baño compartidos",
                ]
              : [
                  "Pago puntual del arrendamiento",
                  "Cuidado de la unidad",
                  "Servicios públicos a cargo del inquilino",
                  "Mantenimiento menor",
                ],
        ),
        ownerResponsibilities: JSON.stringify([
          "Mantenimiento estructural",
          "Reparaciones mayores",
          "Seguro del inmueble",
          unit.unitType === "ROOM" ? "Mantenimiento de áreas comunes" : "Garantía de servicios básicos",
        ]),
        pets: JSON.stringify({
          allowed: contractType !== "COMMERCIAL_LEASE",
          restrictions:
            unit.unitType === "ROOM"
              ? "Solo mascotas pequeñas, previa autorización"
              : "Máximo 1 mascota pequeña",
          deposit: unit.unitType === "ROOM" ? 100000 : 200000,
        }),
      },
    });

    // Asociar inquilino al contrato
    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        tenants: {
          connect: { id: currentTenant.id },
        },
      },
    });

    tenantIndex++;
  }

  console.log(`✅ ${occupiedUnits.length} contratos creados`);

  // ========================================
  // 7. CREAR SERVICIOS BÁSICOS DEL EDIFICIO
  // ========================================

  console.log("⚡ Configurando servicios básicos...");

  const services = [
    {
      serviceType: "ELECTRICITY",
      provider: "Codensa",
      accountNumber: `COD-${buildingStats.property.id}-ELE`,
      paymentResponsible: "SHARED",
      emergencyNumber: "115",
      supportContactName: "Centro de Atención Codensa",
      supportContactPhone: "601-601-6060",
      supportHours: "24/7",
    },
    {
      serviceType: "WATER",
      provider: "EAAB",
      accountNumber: `EAAB-${buildingStats.property.id}-WAT`,
      paymentResponsible: "SHARED",
      emergencyNumber: "116",
      supportContactName: "Atención al Cliente EAAB",
      supportContactPhone: "601-345-9999",
      supportHours: "24/7",
    },
    {
      serviceType: "GAS",
      provider: "Vanti",
      accountNumber: `VAN-${buildingStats.property.id}-GAS`,
      paymentResponsible: "TENANT",
      emergencyNumber: "164",
      supportContactName: "Emergencias Vanti",
      supportContactPhone: "601-444-4444",
      supportHours: "24/7",
    },
    {
      serviceType: "INTERNET",
      provider: "ETB Fibra",
      accountNumber: `ETB-${buildingStats.property.id}-INT`,
      paymentResponsible: "TENANT",
      emergencyNumber: "104",
      supportContactName: "Soporte ETB",
      supportContactPhone: "601-888-1111",
      supportHours: "6:00-22:00",
    },
    {
      serviceType: "SECURITY",
      provider: "SecuriMax Ltda",
      accountNumber: `SEC-${buildingStats.property.id}-MON`,
      paymentResponsible: "SHARED",
      emergencyNumber: "123",
      supportContactName: "Central de Monitoreo",
      supportContactPhone: "601-777-7777",
      supportHours: "24/7",
    },
  ];

  for (const serviceData of services) {
    await prisma.service.create({
      data: {
        propertyId: buildingStats.property.id,
        status: "ACTIVE",
        contractConditions: JSON.stringify({
          paymentDay: 15,
          billingCycle: "monthly",
          minimumContract: serviceData.serviceType === "SECURITY" ? "12 months" : "6 months",
        }),
        ...serviceData,
      },
    });
  }

  console.log(`✅ ${services.length} servicios configurados`);

  // ========================================
  // 8. CREAR CONFIGURACIÓN BÁSICA DE SEGURIDAD
  // ========================================

  console.log("🔐 Configurando seguridad básica...");

  await prisma.accessControl.create({
    data: {
      propertyId: buildingStats.property.id,
      securityLevel: "MEDIUM",
      accessHours: JSON.stringify({
        weekdays: "06:00-23:00",
        weekends: "08:00-22:00",
        holidays: "09:00-21:00",
      }),
      emergencyProtocols: JSON.stringify([
        {
          type: "fire",
          procedure: "Activar alarma, evacuar por escaleras, punto de encuentro en jardín frontal",
        },
        {
          type: "earthquake",
          procedure: "Protegerse bajo marcos de puertas, evacuar después del temblor",
        },
        {
          type: "medical",
          procedure:
            "Llamar al 123, notificar a administración, prestar primeros auxilios si está capacitado",
        },
      ]),
      visitorPolicy: JSON.stringify({
        requiresApproval: true,
        maxDuration: "8 hours",
        allowedHours: "08:00-20:00",
        requiresId: true,
        photographRequired: false,
      }),
      maxVisitorsPerDay: 15,
      requiresApproval: true,
    },
  });

  // ========================================
  // 9. ESTADÍSTICAS FINALES Y RESUMEN
  // ========================================

  console.log("📊 Calculando estadísticas finales...");

  const finalStats = await calculateFinalStatistics(prisma, buildingStats.property.id);

  // ========================================
  // 10. MOSTRAR RESUMEN COMPLETO
  // ========================================

  console.log("🎉 ¡Seed principal completado exitosamente!");
  console.log("═══════════════════════════════════════════");

  await checkDatabaseStatus(prisma);

  console.log("");
  console.log("📋 RESUMEN DEL SISTEMA CREADO:");
  console.log("═══════════════════════════════════");
  console.log(`🏢 Edificio: ${buildingStats.property.name}`);
  console.log(`📍 Ubicación: Zona Rosa, Bogotá`);
  console.log(`👥 Total usuarios: ${finalStats.totalUsers}`);
  console.log(`🏠 Total unidades: ${finalStats.totalUnits} (${finalStats.occupiedUnits} ocupadas)`);
  console.log(`📄 Contratos activos: ${finalStats.activeContracts}`);
  console.log(`⚡ Servicios configurados: ${finalStats.services}`);
  console.log(`💰 Ingreso mensual actual: $${finalStats.monthlyIncome.toLocaleString()}`);
  console.log(`📈 Tasa de ocupación: ${finalStats.occupancyRate}%`);
  console.log("");
  console.log("✅ Sistema listo para usar!");
  console.log("💡 Incluye áreas comunes gestionables, información granular por unidad");
  console.log("🔧 Y estructura optimizada sin redundancias");

  return finalStats;
}

/**
 * Función auxiliar para calcular estadísticas finales
 */
async function calculateFinalStatistics(prisma, propertyId) {
  const [totalUsers, totalUnits, occupiedUnits, activeContracts, services, transactions] = await Promise.all([
    prisma.user.count(),
    prisma.unit.count({ where: { propertyId } }),
    prisma.unit.count({ where: { propertyId, isAvailable: false } }),
    prisma.contract.count({ where: { isActive: true } }),
    prisma.service.count({ where: { propertyId } }),
    prisma.transaction.findMany({
      where: {
        economy: { propertyId },
        type: "INCOME",
        status: "COMPLETED",
      },
    }),
  ]);

  const monthlyIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);

  return {
    totalUsers,
    totalUnits,
    occupiedUnits,
    activeContracts,
    services,
    monthlyIncome,
    occupancyRate,
  };
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error durante el seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
