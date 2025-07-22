const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // ========================================
  // 0. LIMPIEZA OPCIONAL (para desarrollo)
  // ========================================

  console.log("🧹 Limpiando datos previos (opcional)...");

  // Comentar estas líneas si quieres preservar datos existentes
  try {
    await prisma.systemConfiguration.deleteMany({});
    await prisma.communicationLog.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.visitorLog.deleteMany({});
    await prisma.keyManagement.deleteMany({});
    await prisma.accessControl.deleteMany({});
    // También limpiar settings, unidades y contratos para evitar conflictos
    await prisma.setting.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.contract.deleteMany({});
    await prisma.unit.deleteMany({});
    console.log("✅ Limpieza completada");
  } catch (error) {
    console.log(
      "ℹ️ No había datos para limpiar o error en limpieza:",
      error.message
    );
  }

  // ========================================
  // 1. CREAR USUARIOS BASE
  // ========================================

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@properties.com" },
    update: {},
    create: {
      name: "Juan Carlos",
      lastName: "Administrador",
      email: "admin@properties.com",
      phone: "+57 300 123 4567",
      address: "Calle 123 #45-67, Bogotá",
      status: "ACTIVE",
    },
  });

  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@properties.com" },
    update: {},
    create: {
      name: "María Elena",
      lastName: "Propietaria",
      email: "owner@properties.com",
      phone: "+57 301 234 5678",
      address: "Carrera 7 #89-12, Bogotá",
      status: "ACTIVE",
    },
  });

  const tenantUser = await prisma.user.upsert({
    where: { email: "tenant@properties.com" },
    update: {},
    create: {
      name: "Carlos Andrés",
      lastName: "Inquilino",
      email: "tenant@properties.com",
      phone: "+57 302 345 6789",
      birthDate: new Date("1990-05-15"),
      address: "Avenida 68 #12-34, Bogotá",
      status: "ACTIVE",
    },
  });

  const workerUser = await prisma.user.upsert({
    where: { email: "worker@properties.com" },
    update: {},
    create: {
      name: "Luis Fernando",
      lastName: "Técnico",
      email: "worker@properties.com",
      phone: "+57 303 456 7890",
      address: "Calle 26 #56-78, Bogotá",
      status: "ACTIVE",
    },
  });

  console.log("✅ Usuarios creados");

  // ========================================
  // 2. CREAR ROLES
  // ========================================

  const admin = await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      permissions: [
        "FULL_ACCESS",
        "PROPERTY_MANAGEMENT",
        "FINANCIAL_MANAGEMENT",
      ],
    },
  });

  const worker = await prisma.worker.upsert({
    where: { userId: workerUser.id },
    update: {},
    create: {
      userId: workerUser.id,
      specialty: "GENERAL_MAINTENANCE",
      certifications: JSON.stringify([
        "Técnico en mantenimiento general",
        "Certificación en seguridad industrial",
      ]),
      availability: JSON.stringify({
        days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        hours: "08:00-17:00",
      }),
      hourlyRate: 25000,
    },
  });

  const tenant = await prisma.tenant.upsert({
    where: { userId: tenantUser.id },
    update: {},
    create: {
      userId: tenantUser.id,
      status: "ACTIVE",
    },
  });

  console.log("✅ Roles creados");

  // ========================================
  // 3. CREAR PROPIEDAD PRINCIPAL
  // ========================================

  const property = await prisma.property.upsert({
    where: { id: "main-property-001" },
    update: {},
    create: {
      id: "main-property-001",
      adminId: admin.id,
      name: "Edificio Residencial Los Rosales",
      description:
        "Edificio residencial de 5 pisos con apartamentos de 2 y 3 habitaciones",
      status: "ACTIVE",
    },
  });

  console.log("✅ Propiedad principal creada");

  // ========================================
  // 4. INFORMACIÓN DE LA PROPIEDAD
  // ========================================

  const propertyInfo = await prisma.information.upsert({
    where: { propertyId: property.id },
    update: {},
    create: {
      propertyId: property.id,
      streetAndNumber: "Carrera 15 #123-45",
      neighborhood: "Rosales",
      cityAndState: "Bogotá, Cundinamarca",
      postalCode: "110111",
      gpsCoordinates: "4.6097,-74.0817",
      country: "Colombia",
      propertyType: "APARTMENT",
      totalLandArea: 800.0,
      builtArea: 600.0,
      floors: 5,
      orientation: "NORTH",
      age: 10,
      bedrooms: 15, // Total en todo el edificio
      bathrooms: 15,
      halfBathrooms: 5,
      kitchen: "Cocinas integrales en cada apartamento",
      livingAndDining: "Sala comedor integrado por apartamento",
      additionalRooms: JSON.stringify([
        {
          name: "Cuarto de servicio",
          description: "En apartamentos de 3 habitaciones",
        },
        {
          name: "Terraza",
          description: "Algunos apartamentos incluyen terraza",
        },
      ]),
      yardOrGarden: "Jardín común en primer piso",
      parking: 10,
      parkingLocation: "Parqueadero cubierto en sótano",
      balconiesAndTerraces: "Balcones en apartamentos superiores",
      recreationalAreas: JSON.stringify([
        { name: "Salón comunal", description: "Para eventos y reuniones" },
        { name: "Gimnasio", description: "Equipado con máquinas básicas" },
        { name: "Zona BBQ", description: "Terraza con asadores" },
      ]),
    },
  });

  console.log("✅ Información de propiedad creada");

  // ========================================
  // 5. INFORMACIÓN LEGAL
  // ========================================

  const legal = await prisma.legal.upsert({
    where: { propertyId: property.id },
    update: {},
    create: {
      propertyId: property.id,
    },
  });

  // Crear owner después del legal
  const owner = await prisma.owner.upsert({
    where: { userId: ownerUser.id },
    update: {},
    create: {
      userId: ownerUser.id,
      legalId: legal.id,
    },
  });

  const titleDocument = await prisma.titleDocument.upsert({
    where: { deedNumber: "ESC-2015-001234" },
    update: {},
    create: {
      legalId: legal.id,
      deedNumber: "ESC-2015-001234",
      notary: "Notaría 45 de Bogotá",
      deedDate: new Date("2015-03-15"),
      publicRegistry: "REG-BOG-2015-5678",
      documentLink: "https://docs.example.com/title-deed.pdf",
      isCurrent: true,
    },
  });

  console.log("✅ Información legal creada");

  // ========================================
  // 6. UNIDADES Y CONTRATOS
  // ========================================

  const units = [];
  const contracts = [];

  // Crear 5 apartamentos (uno por piso)
  for (let floor = 1; floor <= 5; floor++) {
    const unit = await prisma.unit.upsert({
      where: {
        propertyId_unitNumber: {
          propertyId: property.id,
          unitNumber: `${floor}01`,
        },
      },
      update: {},
      create: {
        propertyId: property.id,
        unitType: "APARTMENT",
        unitNumber: `${floor}01`,
        isAvailable: floor > 2, // Los primeros 2 pisos están ocupados
        area: floor <= 2 ? 85.0 : 75.0, // Apartamentos más grandes en pisos bajos
        rent: floor <= 2 ? 1200000 : 1000000, // Precio diferente por piso
      },
    });
    units.push(unit);

    // Crear contratos para los apartamentos ocupados
    if (floor <= 2) {
      const contractId = `contract-${property.id}-${unit.unitNumber}`;
      const contract = await prisma.contract.upsert({
        where: { id: contractId },
        update: {},
        create: {
          id: contractId,
          unitId: unit.id,
          contractType: "RENTAL",
          contractName: `Contrato Apartamento ${unit.unitNumber}`,
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-12-31"),
          monthlyRent: unit.rent,
          deposit: unit.rent * 2, // 2 meses de depósito
          isActive: true,
          tenantResponsibilities: JSON.stringify([
            "Pago puntual del arrendamiento",
            "Cuidado de la unidad",
            "Servicios públicos a cargo del inquilino",
          ]),
          ownerResponsibilities: JSON.stringify([
            "Mantenimiento estructural",
            "Reparaciones mayores",
            "Seguro contra incendio",
          ]),
          pets: JSON.stringify({
            allowed: true,
            restrictions: "Máximo 2 mascotas pequeñas",
            deposit: 200000,
          }),
        },
      });
      contracts.push(contract);

      // Asociar inquilino al contrato
      await prisma.contract.update({
        where: { id: contract.id },
        data: {
          tenants: {
            connect: { id: tenant.id },
          },
        },
      });
    }
  }

  console.log("✅ Unidades y contratos creados");

  // ========================================
  // 7. ECONOMÍA DE LA PROPIEDAD
  // ========================================

  const economy = await prisma.economy.upsert({
    where: { propertyId: property.id },
    update: {},
    create: {
      propertyId: property.id,
      annualBudget: 50000000, // 50 millones anuales
      accumulatedCosts: 15000000, // 15 millones gastados
      costDistribution: JSON.stringify({
        maintenance: { owner: 60, tenant: 40 },
        improvements: { owner: 100, tenant: 0 },
        utilities: { owner: 0, tenant: 100 },
      }),
    },
  });

  console.log("✅ Economía creada");

  // ========================================
  // 8. SERVICIOS
  // ========================================

  const services = [
    {
      serviceType: "ELECTRICITY",
      provider: "Codensa",
      accountNumber: "COD-123456789",
      emergencyNumber: "115",
      supportContactName: "Centro de Atención Codensa",
      supportContactPhone: "601-601-6060",
    },
    {
      serviceType: "WATER",
      provider: "EAAB",
      accountNumber: "EAAB-987654321",
      emergencyNumber: "116",
      supportContactName: "Atención al Cliente EAAB",
      supportContactPhone: "601-345-9999",
    },
    {
      serviceType: "GAS",
      provider: "Vanti",
      accountNumber: "VAN-456789123",
      emergencyNumber: "164",
      supportContactName: "Emergencias Vanti",
      supportContactPhone: "601-444-4444",
    },
    {
      serviceType: "INTERNET",
      provider: "Claro",
      accountNumber: "CLR-789123456",
      emergencyNumber: "123",
      supportContactName: "Soporte Técnico Claro",
      supportContactPhone: "601-888-8888",
    },
  ];

  for (const serviceData of services) {
    await prisma.service.upsert({
      where: { accountNumber: serviceData.accountNumber },
      update: {},
      create: {
        propertyId: property.id,
        paymentResponsible:
          serviceData.serviceType === "ELECTRICITY" ? "SHARED" : "TENANT",
        supportHours: "24/7",
        status: "ACTIVE",
        ...serviceData,
      },
    });
  }

  console.log("✅ Servicios creados");

  // ========================================
  // 9. EQUIPOS Y ARQUITECTURA
  // ========================================

  // Elementos arquitectónicos principales
  const architectureElements = [
    {
      name: "Estructura principal",
      type: "FOUNDATION",
      description: "Cimientos y estructura del edificio",
      condition: "GOOD",
    },
    {
      name: "Cubierta del edificio",
      type: "ROOF",
      description: "Techo principal del edificio",
      condition: "FAIR",
    },
    {
      name: "Escaleras principales",
      type: "STAIRS",
      description: "Escaleras de acceso a todos los pisos",
      condition: "GOOD",
    },
  ];

  for (const element of architectureElements) {
    await prisma.architecture.create({
      data: {
        propertyId: property.id,
        ...element,
      },
    });
  }

  // Equipos principales
  const equipments = [
    {
      name: "Bomba de agua principal",
      type: "WATER_PUMP",
      brand: "Pedrollo",
      model: "PKm-60",
      maintenanceFrequency: "Cada 6 meses",
      condition: "GOOD",
      status: "OPERATIONAL",
    },
    {
      name: "Sistema de seguridad",
      type: "SECURITY_SYSTEM",
      brand: "Hikvision",
      model: "DS-7608NI",
      maintenanceFrequency: "Cada 3 meses",
      condition: "EXCELLENT",
      status: "OPERATIONAL",
    },
    {
      name: "Calentador central",
      type: "WATER_HEATER",
      brand: "Haceb",
      model: "Titán 50L",
      maintenanceFrequency: "Cada 4 meses",
      condition: "GOOD",
      status: "OPERATIONAL",
    },
  ];

  for (const equipment of equipments) {
    await prisma.equipment.create({
      data: {
        propertyId: property.id,
        ...equipment,
      },
    });
  }

  console.log("✅ Arquitectura y equipos creados");

  // ========================================
  // 10. MANTENIMIENTOS Y TRANSACCIONES
  // ========================================

  const maintenance = await prisma.maintenance.create({
    data: {
      workerId: worker.id,
      category: "EQUIPMENT",
      type: "PREVENTIVE",
      priority: "MEDIUM",
      description: "Mantenimiento preventivo del sistema de bombeo",
      maintenanceDate: new Date(),
      costResponsible: "OWNER",
      estimatedCost: 150000,
      status: "SCHEDULED",
    },
  });

  // Transacciones de ejemplo
  const transactions = [
    {
      type: "INCOME",
      description: "Pago arriendo Apartamento 101",
      amount: 1200000,
      category: "RENT",
      paymentMethod: "BANK_TRANSFER",
    },
    {
      type: "INCOME",
      description: "Pago arriendo Apartamento 201",
      amount: 1200000,
      category: "RENT",
      paymentMethod: "BANK_TRANSFER",
    },
    {
      type: "EXPENSE",
      description: "Mantenimiento general edificio",
      amount: 500000,
      category: "MAINTENANCE",
      paymentMethod: "CASH",
    },
  ];

  for (const transactionData of transactions) {
    await prisma.transaction.create({
      data: {
        economyId: economy.id,
        tenantId: transactionData.type === "INCOME" ? tenant.id : null,
        date: new Date(),
        status: "COMPLETED",
        ...transactionData,
      },
    });
  }

  console.log("✅ Mantenimientos y transacciones creadas");

  // ========================================
  // 11. NOTIFICACIONES Y CONFIGURACIONES
  // ========================================

  const notifications = [
    {
      title: "Pago de arriendo próximo a vencer",
      content: "Recordatorio: El pago del arriendo vence en 3 días",
      type: "PAYMENT_DUE",
      priority: "HIGH",
      medium: "EMAIL",
    },
    {
      title: "Mantenimiento programado",
      content:
        "Se realizará mantenimiento del sistema eléctrico el próximo lunes",
      type: "MAINTENANCE_DUE",
      priority: "MEDIUM",
      medium: "SMS",
    },
  ];

  for (const notificationData of notifications) {
    const notificationId = `notification-${property.id}-${notificationData.type}`;
    await prisma.notification.upsert({
      where: { id: notificationId },
      update: {},
      create: {
        id: notificationId,
        propertyId: property.id,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        ...notificationData,
      },
    });
  }

  // Configuraciones por defecto
  const settingTypes = [
    "NOTIFICATION_PREFERENCES",
    "ACCESS_CONTROL",
    "MAINTENANCE_SCHEDULE",
    "PAYMENT_REMINDERS",
  ];

  for (const settingType of settingTypes) {
    await prisma.setting.upsert({
      where: {
        propertyId_type: {
          propertyId: property.id,
          type: settingType,
        },
      },
      update: {},
      create: {
        propertyId: property.id,
        type: settingType,
        settingsJson: JSON.stringify({
          enabled: true,
          defaultSettings: true,
          createdAt: new Date().toISOString(),
        }),
      },
    });
  }

  console.log("✅ Notificaciones y configuraciones creadas");

  // ========================================
  // 12. CONTROL DE ACCESO Y SEGURIDAD
  // ========================================

  // Configuración de control de acceso
  const accessControl = await prisma.accessControl.create({
    data: {
      propertyId: property.id,
      securityLevel: "MEDIUM",
      accessHours: JSON.stringify({
        weekdays: "06:00-22:00",
        weekends: "08:00-20:00",
        holidays: "09:00-18:00",
      }),
      emergencyProtocols: JSON.stringify([
        {
          type: "fire",
          procedure:
            "Activar alarma, evacuar por escaleras, punto de encuentro en el jardín",
        },
        {
          type: "earthquake",
          procedure:
            "Protegerse bajo marcos de puertas, evacuar después del temblor",
        },
        {
          type: "security",
          procedure: "Contactar seguridad inmediatamente, no confrontar",
        },
      ]),
      keyManagementRules: JSON.stringify({
        maxKeysPerTenant: 2,
        temporaryKeyDuration: "24 hours",
        emergencyKeyAccess: ["admin", "maintenance"],
      }),
      visitorPolicy: JSON.stringify({
        requiresApproval: true,
        maxDuration: "8 hours",
        allowedHours: "08:00-20:00",
        requiresId: true,
      }),
      maxVisitorsPerDay: 15,
      requiresApproval: true,
    },
  });

  // Gestión de llaves
  const keys = [
    {
      propertyId: property.id,
      unitId: units[0].id, // Apartamento 101
      assignedTo: tenantUser.id,
      keyCode: "APT101-KEY-001",
      keyType: "PHYSICAL",
      description: "Llave principal apartamento 101",
      location: "Puerta principal apartamento",
    },
    {
      propertyId: property.id,
      unitId: units[1].id, // Apartamento 201
      keyCode: "APT201-KEY-001",
      keyType: "DIGITAL",
      description: "Tarjeta de acceso apartamento 201",
      location: "Puerta principal apartamento",
    },
    {
      propertyId: property.id,
      assignedTo: adminUser.id,
      keyCode: "MASTER-001",
      keyType: "MASTER",
      description: "Llave maestra del edificio",
      emergencyKey: true,
      restrictions: JSON.stringify({
        areas: ["all"],
        hours: "24/7",
      }),
    },
    {
      propertyId: property.id,
      assignedTo: workerUser.id,
      keyCode: "MAINT-001",
      keyType: "MAINTENANCE",
      description: "Llave para áreas comunes y mantenimiento",
      restrictions: JSON.stringify({
        areas: ["common_areas", "utility_rooms"],
        hours: "08:00-17:00",
      }),
    },
  ];

  for (const keyData of keys) {
    await prisma.keyManagement.upsert({
      where: { keyCode: keyData.keyCode },
      update: {},
      create: keyData,
    });
  }

  // Registro de visitantes
  const visitors = [
    {
      propertyId: property.id,
      unitId: units[0].id,
      authorizedBy: tenantUser.id,
      visitorName: "Ana María González",
      visitorPhone: "+57 310 555 1234",
      visitorId: "1234567890",
      purpose: "Visita familiar",
      expectedDuration: "4 hours",
      entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
      exitTime: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 min
      status: "COMPLETED",
      observations: "Visita sin inconvenientes",
    },
    {
      propertyId: property.id,
      unitId: units[1].id,
      authorizedBy: adminUser.id,
      visitorName: "Técnico de Internet",
      visitorPhone: "+57 320 444 5678",
      purpose: "Instalación de servicio",
      expectedDuration: "2 hours",
      status: "APPROVED",
      observations: "Instalación programada para mañana",
    },
    {
      propertyId: property.id,
      authorizedBy: adminUser.id,
      visitorName: "Inspector de Bomberos",
      visitorPhone: "+57 301 123 9999",
      visitorId: "9876543210",
      purpose: "Inspección de seguridad",
      expectedDuration: "3 hours",
      status: "PENDING",
      observations: "Inspección anual programada",
    },
  ];

  for (const visitorData of visitors) {
    await prisma.visitorLog.create({
      data: visitorData,
    });
  }

  console.log("✅ Control de acceso y seguridad creados");

  // ========================================
  // 13. SISTEMA DE COMUNICACIÓN
  // ========================================

  // Mensajes entre usuarios
  const messages = [
    {
      senderId: tenantUser.id,
      receiverId: adminUser.id,
      propertyId: property.id,
      subject: "Solicitud de mantenimiento - Apartamento 101",
      content:
        "Hola, tengo un problema con la llave del agua caliente en la ducha. ¿Podrían enviar a alguien a revisarla?",
      type: "MAINTENANCE_REQUEST",
      priority: "MEDIUM",
      status: "SENT",
    },
    {
      senderId: adminUser.id,
      receiverId: tenantUser.id,
      propertyId: property.id,
      subject: "Re: Solicitud de mantenimiento - Apartamento 101",
      content:
        "Estimado Carlos, hemos recibido su solicitud. El técnico Luis Fernando irá mañana entre 2-4 PM. Por favor confirme su disponibilidad.",
      type: "MAINTENANCE_REQUEST",
      priority: "MEDIUM",
      status: "READ",
      readAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      senderId: adminUser.id,
      receiverId: ownerUser.id,
      subject: "Recordatorio: Pago de administración",
      content:
        "Estimada María Elena, le recordamos que el pago de administración del mes vence el día 15. Monto: $200,000",
      type: "PAYMENT_REMINDER",
      priority: "HIGH",
      status: "DELIVERED",
    },
    {
      senderId: adminUser.id,
      receiverId: tenantUser.id,
      subject: "Anuncio: Mantenimiento del ascensor",
      content:
        "Estimados residentes, el ascensor estará fuera de servicio el sábado 25 de enero de 8:00 AM a 2:00 PM por mantenimiento preventivo.",
      type: "ANNOUNCEMENT",
      priority: "MEDIUM",
      status: "READ",
      readAt: new Date(),
    },
    {
      senderId: tenantUser.id,
      receiverId: adminUser.id,
      propertyId: property.id,
      subject: "Autorización de visitante",
      content:
        "Buenas tardes, necesito autorizar el ingreso de mi hermana Ana María González (CC: 1234567890) para el día de mañana a las 3:00 PM.",
      type: "VISITOR_REQUEST",
      priority: "LOW",
      status: "SENT",
    },
  ];

  const createdMessages = [];
  for (const messageData of messages) {
    const message = await prisma.message.create({
      data: messageData,
    });
    createdMessages.push(message);
  }

  // Crear algunas respuestas (hilos de conversación)
  await prisma.message.create({
    data: {
      senderId: tenantUser.id,
      receiverId: adminUser.id,
      subject: "Re: Solicitud de mantenimiento - Apartamento 101",
      content:
        "Perfecto, estaré disponible en ese horario. Muchas gracias por la pronta respuesta.",
      type: "MAINTENANCE_REQUEST",
      priority: "LOW",
      parentMessageId: createdMessages[1].id,
      threadId: createdMessages[0].id,
      status: "SENT",
    },
  });

  // Registro de comunicaciones
  const communicationLogs = [
    {
      propertyId: property.id,
      eventType: "MESSAGE_SENT",
      description: "Solicitud de mantenimiento enviada por inquilino",
      involvedUsers: JSON.stringify([tenantUser.id, adminUser.id]),
      eventData: JSON.stringify({
        messageType: "MAINTENANCE_REQUEST",
        subject: "Solicitud de mantenimiento - Apartamento 101",
        unit: "101",
      }),
      importance: "MEDIUM",
      followUpRequired: true,
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
    },
    {
      propertyId: property.id,
      eventType: "VISITOR_AUTHORIZED",
      description: "Visitante autorizado para apartamento 101",
      involvedUsers: JSON.stringify([adminUser.id, tenantUser.id]),
      eventData: JSON.stringify({
        visitorName: "Ana María González",
        unit: "101",
        purpose: "Visita familiar",
      }),
      importance: "LOW",
    },
    {
      propertyId: property.id,
      eventType: "MAINTENANCE_SCHEDULED",
      description: "Mantenimiento programado para sistema de bombeo",
      involvedUsers: JSON.stringify([adminUser.id, workerUser.id]),
      eventData: JSON.stringify({
        maintenanceType: "PREVENTIVE",
        equipment: "Sistema de bombeo",
        scheduledDate: new Date().toISOString(),
      }),
      importance: "MEDIUM",
      followUpRequired: true,
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En una semana
    },
  ];

  for (const logData of communicationLogs) {
    await prisma.communicationLog.create({
      data: logData,
    });
  }

  console.log("✅ Sistema de comunicación creado");

  // ========================================
  // 14. CONFIGURACIÓN AVANZADA DEL SISTEMA
  // ========================================

  const systemConfigs = [
    {
      configKey: "NOTIFICATION_EMAIL_SMTP",
      configValue: JSON.stringify({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        fromEmail: "noreply@properties.com",
      }),
      description: "Configuración SMTP para envío de correos",
      category: "NOTIFICATIONS",
    },
    {
      configKey: "SECURITY_PASSWORD_POLICY",
      configValue: JSON.stringify({
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAttempts: 5,
      }),
      description: "Política de contraseñas del sistema",
      category: "SECURITY",
    },
    {
      configKey: "PAYMENT_REMINDER_SCHEDULE",
      configValue: JSON.stringify({
        firstReminder: 5, // días antes del vencimiento
        secondReminder: 1,
        overdueNotification: 3, // días después del vencimiento
      }),
      description: "Programación de recordatorios de pago",
      category: "PAYMENTS",
    },
    {
      configKey: "MAINTENANCE_AUTO_SCHEDULE",
      configValue: JSON.stringify({
        enabled: true,
        defaultFrequency: "quarterly",
        autoAssignWorkers: true,
        notifyInAdvance: 7, // días
      }),
      description: "Configuración de mantenimiento automático",
      category: "MAINTENANCE",
    },
    {
      configKey: "VISITOR_DEFAULT_DURATION",
      configValue: JSON.stringify({
        maxHours: 8,
        requiresApproval: true,
        allowedTimeSlots: ["08:00-20:00"],
        autoExpire: true,
      }),
      description: "Configuración por defecto para visitantes",
      category: "SECURITY",
    },
  ];

  for (const configData of systemConfigs) {
    await prisma.systemConfiguration.upsert({
      where: { configKey: configData.configKey },
      update: {},
      create: configData,
    });
  }

  console.log("✅ Configuración avanzada del sistema creada");

  console.log("🎉 ¡Seed completado exitosamente!");
  console.log("📊 Datos creados:");
  console.log("   - 4 usuarios con roles");
  console.log("   - 1 propiedad completa");
  console.log("   - 5 apartamentos (2 ocupados)");
  console.log("   - 4 servicios públicos");
  console.log("   - Equipos y elementos arquitectónicos");
  console.log("   - Transacciones y mantenimientos");
  console.log("   - Notificaciones y configuraciones");
  console.log("   - Sistema de control de acceso completo");
  console.log(
    "   - 4 llaves gestionadas (física, digital, maestra, mantenimiento)"
  );
  console.log("   - 3 registros de visitantes");
  console.log("   - 5+ mensajes del sistema de comunicación");
  console.log("   - Logs de comunicación y eventos");
  console.log("   - 5 configuraciones avanzadas del sistema");
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
