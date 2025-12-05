// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')

/**
 * Función para limpiar completamente la base de datos
 * Elimina todos los registros de todas las tablas en el orden correcto
 * para evitar errores de foreign keys
 */
const resetDatabase = async (prisma) => {
  console.log('🧹 Iniciando limpieza completa de la base de datos...')

  try {
    // ========================================
    // PASO 1: Eliminar datos en orden inverso de dependencias
    // ========================================

    // 1. Configuraciones y logs (sin dependencias)
    console.log('   🗑️  Limpiando configuraciones del sistema...')
    await prisma.systemConfiguration.deleteMany({})
    await prisma.communicationLog.deleteMany({})

    // 2. Mensajes y comunicación
    console.log('   🗑️  Limpiando sistema de comunicación...')
    await prisma.message.deleteMany({})
    await prisma.notification.deleteMany({})

    // 3. Control de acceso y seguridad
    console.log('   🗑️  Limpiando control de acceso...')
    await prisma.visitorLog.deleteMany({})
    await prisma.keyManagement.deleteMany({})
    await prisma.accessControl.deleteMany({})

    // 4. Finanzas y transacciones
    console.log('   🗑️  Limpiando finanzas...')
    await prisma.transaction.deleteMany({})
    await prisma.servicePayment.deleteMany({})
    await prisma.incidentService.deleteMany({})
    await prisma.propertyClaim.deleteMany({})

    // 5. Mantenimiento
    console.log('   🗑️  Limpiando mantenimiento...')
    await prisma.maintenance.deleteMany({})

    // 6. Equipos y arquitectura
    console.log('   🗑️  Limpiando equipos y arquitectura...')
    await prisma.equipment.deleteMany({})
    await prisma.architecture.deleteMany({})

    // 7. Servicios e seguros
    console.log('   🗑️  Limpiando servicios y seguros...')
    await prisma.service.deleteMany({})
    await prisma.insurance.deleteMany({})

    // 8. Economía de propiedades
    console.log('   🗑️  Limpiando economía...')
    await prisma.economy.deleteMany({})

    // 9. Contratos y unidades
    console.log('   🗑️  Limpiando contratos y unidades...')
    await prisma.contract.deleteMany({})
    await prisma.unit.deleteMany({})

    // 10. Configuraciones de propiedades
    console.log('   🗑️  Limpiando configuraciones de propiedades...')
    await prisma.setting.deleteMany({})

    // 11. Información legal (y sus dependencias)
    console.log('   🗑️  Limpiando información legal...')
    await prisma.regulationAndNorm.deleteMany({})
    await prisma.policyAndWarranty.deleteMany({})
    await prisma.fiscalDetail.deleteMany({})
    await prisma.legalHistory.deleteMany({})
    await prisma.usage.deleteMany({})
    await prisma.titleDocument.deleteMany({})

    // 12. Propietarios (antes de legal)
    console.log('   🗑️  Limpiando propietarios...')
    await prisma.owner.deleteMany({})

    // 13. Información legal base
    await prisma.legal.deleteMany({})

    // 14. Propiedades principales (ya no hay tabla information separada)
    console.log('   🗑️  Limpiando propiedades...')
    await prisma.property.deleteMany({})

    // 16. Permisos de administradores
    console.log('   🗑️  Limpiando permisos...')
    await prisma.adminPermission.deleteMany({})

    // 17. Roles de usuarios
    console.log('   🗑️  Limpiando roles...')
    await prisma.subTenant.deleteMany({})
    await prisma.tenant.deleteMany({})
    await prisma.worker.deleteMany({})
    await prisma.admin.deleteMany({})

    // 18. Usuarios base (al final)
    console.log('   🗑️  Limpiando usuarios...')
    await prisma.user.deleteMany({})

    console.log('✅ Limpieza completa exitosa')
    console.log('📊 Base de datos completamente vacía')
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message)
    throw error
  }
}

/**
 * Función para resetear solo tablas específicas
 * Útil cuando solo quieres limpiar ciertas secciones
 */
const resetSpecificTables = async (prisma, tables = []) => {
  console.log(`🧹 Limpiando tablas específicas: ${tables.join(', ')}...`)

  const tableDeleteFunctions = {
    // Configuraciones
    systemConfiguration: () => prisma.systemConfiguration.deleteMany({}),
    communicationLog: () => prisma.communicationLog.deleteMany({}),

    // Comunicación
    message: () => prisma.message.deleteMany({}),
    notification: () => prisma.notification.deleteMany({}),

    // Seguridad
    visitorLog: () => prisma.visitorLog.deleteMany({}),
    keyManagement: () => prisma.keyManagement.deleteMany({}),
    accessControl: () => prisma.accessControl.deleteMany({}),

    // Finanzas
    transaction: () => prisma.transaction.deleteMany({}),
    servicePayment: () => prisma.servicePayment.deleteMany({}),
    incidentService: () => prisma.incidentService.deleteMany({}),
    propertyClaim: () => prisma.propertyClaim.deleteMany({}),

    // Mantenimiento
    maintenance: () => prisma.maintenance.deleteMany({}),

    // Arquitectura
    equipment: () => prisma.equipment.deleteMany({}),
    architecture: () => prisma.architecture.deleteMany({}),

    // Servicios
    service: () => prisma.service.deleteMany({}),
    insurance: () => prisma.insurance.deleteMany({}),

    // Propiedades (ya no hay tabla information)
    economy: () => prisma.economy.deleteMany({}),
    contract: () => prisma.contract.deleteMany({}),
    unit: () => prisma.unit.deleteMany({}),
    setting: () => prisma.setting.deleteMany({}),
    property: () => prisma.property.deleteMany({}),

    // Legal
    regulationAndNorm: () => prisma.regulationAndNorm.deleteMany({}),
    policyAndWarranty: () => prisma.policyAndWarranty.deleteMany({}),
    fiscalDetail: () => prisma.fiscalDetail.deleteMany({}),
    legalHistory: () => prisma.legalHistory.deleteMany({}),
    usage: () => prisma.usage.deleteMany({}),
    titleDocument: () => prisma.titleDocument.deleteMany({}),
    legal: () => prisma.legal.deleteMany({}),
    owner: () => prisma.owner.deleteMany({}),

    // Usuarios
    adminPermission: () => prisma.adminPermission.deleteMany({}),
    subTenant: () => prisma.subTenant.deleteMany({}),
    tenant: () => prisma.tenant.deleteMany({}),
    worker: () => prisma.worker.deleteMany({}),
    admin: () => prisma.admin.deleteMany({}),
    user: () => prisma.user.deleteMany({}),
  }

  for (const table of tables) {
    if (tableDeleteFunctions[table]) {
      try {
        console.log(`   🗑️  Limpiando tabla: ${table}`)
        await tableDeleteFunctions[table]()
      } catch (error) {
        console.error(`❌ Error limpiando tabla ${table}:`, error.message)
      }
    } else {
      console.log(`⚠️  Tabla desconocida: ${table}`)
    }
  }

  console.log('✅ Limpieza de tablas específicas completada')
}

/**
 * Función para verificar el estado de la base de datos
 * Muestra cuántos registros hay en cada tabla
 */
const checkDatabaseStatus = async (prisma) => {
  console.log('📊 ESTADO ACTUAL DE LA BASE DE DATOS:')
  console.log('=====================================')

  const tables = [
    { name: 'Usuarios', model: prisma.user },
    { name: 'Administradores', model: prisma.admin },
    { name: 'Propiedades', model: prisma.property },
    { name: 'Unidades', model: prisma.unit },
    { name: 'Contratos', model: prisma.contract },
    { name: 'Transacciones', model: prisma.transaction },
    { name: 'Mantenimientos', model: prisma.maintenance },
    { name: 'Servicios', model: prisma.service },
    { name: 'Equipos', model: prisma.equipment },
    { name: 'Mensajes', model: prisma.message },
    { name: 'Visitantes', model: prisma.visitorLog },
    { name: 'Llaves', model: prisma.keyManagement },
    { name: 'Notificaciones', model: prisma.notification },
    { name: 'Configuraciones', model: prisma.systemConfiguration },
  ]

  for (const table of tables) {
    try {
      const count = await table.model.count()
      console.log(`${table.name}: ${count} registro(s)`)
    } catch (error) {
      console.log(`${table.name}: Error al contar`)
    }
  }

  console.log('=====================================')
}

// Función principal para uso directo
const main = async () => {
  const prisma = new PrismaClient()

  try {
    // Mostrar estado inicial
    await checkDatabaseStatus(prisma)

    // Resetear completamente
    await resetDatabase(prisma)

    // Mostrar estado final
    await checkDatabaseStatus(prisma)
  } catch (error) {
    console.error('💥 Error en el reset:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exportar las funciones
module.exports = {
  resetDatabase,
  resetSpecificTables,
  checkDatabaseStatus,
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
}
