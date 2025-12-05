// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient, PropertyType, UnitType } = require('@prisma/client')

/**
 * Seed edificio de 5 pisos usando la nueva estructura optimizada
 * - Property con información directa (sin tabla separada)
 * - Units con información granular específica
 * - Common areas como unidades gestionables
 * - Información detallada por cada espacio
 */
const createOptimizedBuildingFiveFloors = async (prisma, adminId) => {
  console.log('🏢 Creando edificio optimizado de 5 pisos...')

  // ========================================
  // 1. CREAR PROPIEDAD CON INFORMACIÓN DIRECTA
  // ========================================

  const property = await prisma.property.create({
    data: {
      adminId: adminId,
      name: 'Casa de Tibabuyes',
      description: 'Edificio de uso mixto con gestión granular de espacios',
      status: 'ACTIVE',

      // ✅ Información de ubicación directa en Property
      streetAndNumber: 'Carrera 13 #85-32',
      neighborhood: 'Tibabuyes',
      city: 'Bogotá',
      state: 'Cundinamarca',
      postalCode: '110221',
      gpsCoordinates: '4.6690,-74.0547',
      country: 'Colombia',

      // ✅ Características generales del edificio
      propertyType: PropertyType.MIXED_USE,
      totalLandArea: 200.0,
      builtArea: 850.0, // Se calculará sumando todas las unidades
      floors: 5,
      age: 8,

      // ✅ Información general de exteriores
      yardOrGarden: 'Jardín frontal gestionado como área común',
      parking: 3,
      parkingLocation: 'Parqueadero lateral cubierto',
      balconiesAndTerraces: 'Balcones en departamentos superiores',
      recreationalAreas: 'Terraza comunal en quinto piso',
    },
  })

  console.log(`✅ Propiedad creada: ${property.name}`)

  // ========================================
  // 2. CREAR ÁREAS COMUNES COMO UNIDADES GESTIONABLES
  // ========================================

  console.log('🏛️ Creando áreas comunes como unidades...')

  const commonAreasData = [
    {
      unitNumber: 'COMMON-HALL-P1',
      unitType: UnitType.COMMON_AREA,
      area: 25.0,
      bedrooms: 0,
      bathrooms: 0,
      description: 'Hall principal con portería y control de acceso',
      additionalRooms: 'Portería, área de espera, buzones',
    },
    {
      unitNumber: 'COMMON-STAIRS-ALL',
      unitType: UnitType.COMMON_AREA,
      area: 40.0,
      bedrooms: 0,
      bathrooms: 0,
      description: 'Escaleras principales del edificio (todos los pisos)',
      additionalRooms: 'Escalones antideslizantes, pasamanos, iluminación LED',
    },
    {
      unitNumber: 'COMMON-BATHROOM-P3',
      unitType: UnitType.COMMON_AREA,
      area: 8.0,
      bedrooms: 0,
      bathrooms: 1,
      kitchen: 'No aplica',
      livingAndDining: 'No aplica',
      description: 'Baño compartido para habitaciones del piso 3',
      additionalRooms: 'Ducha, inodoro, lavamanos, ventilación forzada',
    },
    {
      unitNumber: 'COMMON-KITCHEN-P3',
      unitType: UnitType.COMMON_AREA,
      area: 12.0,
      bedrooms: 0,
      bathrooms: 0,
      kitchen: 'Cocina compartida completa',
      livingAndDining: 'Área de comedor informal',
      description: 'Cocina compartida para habitaciones del piso 3',
      additionalRooms: 'Estufa 4 puestos, horno, nevera grande, microondas, alacenas',
    },
    {
      unitNumber: 'COMMON-LAUNDRY-P3',
      unitType: UnitType.COMMON_AREA,
      area: 6.0,
      bedrooms: 0,
      bathrooms: 0,
      description: 'Área de lavandería con lavadora compartida',
      additionalRooms: 'Lavadora 18kg, tendedero cubierto, estantes',
    },
    {
      unitNumber: 'COMMON-TERRACE-P5',
      unitType: UnitType.COMMON_AREA,
      area: 35.0,
      bedrooms: 0,
      bathrooms: 0,
      livingAndDining: 'Área social exterior',
      description: 'Terraza comunal en el quinto piso',
      additionalRooms: 'Mobiliario exterior, zona BBQ, jardín vertical',
    },
    {
      unitNumber: 'COMMON-GARDEN-FRONT',
      unitType: UnitType.COMMON_AREA,
      area: 20.0,
      bedrooms: 0,
      bathrooms: 0,
      description: 'Jardín frontal del edificio',
      additionalRooms: 'Césped, arbustos decorativos, iluminación solar',
    },
    {
      unitNumber: 'COMMON-UTILITY-ROOM',
      unitType: UnitType.COMMON_AREA,
      area: 8.0,
      bedrooms: 0,
      bathrooms: 0,
      description: 'Cuarto de máquinas y equipos del edificio',
      additionalRooms: 'Bomba de agua, calentador central, tableros eléctricos',
    },
  ]

  const commonAreas = []
  for (const areaData of commonAreasData) {
    const commonArea = await prisma.unit.create({
      data: {
        propertyId: property.id,
        isAvailable: false, // Las áreas comunes no se arriendan
        rent: 0, // Sin renta directa, pero generan gastos de mantenimiento
        ...areaData,
      },
    })
    commonAreas.push(commonArea)
  }

  console.log(`✅ ${commonAreas.length} áreas comunes creadas`)

  // ========================================
  // 3. CREAR ESPACIOS DE PARQUEO INDIVIDUALES
  // ========================================

  console.log('🚗 Creando espacios de parqueo...')

  const parkingSpots = []
  for (let i = 1; i <= 3; i++) {
    const parkingSpot = await prisma.unit.create({
      data: {
        propertyId: property.id,
        unitType: UnitType.PARKING_SPOT,
        unitNumber: `PARKING-${i.toString().padStart(2, '0')}`,
        isAvailable: i > 1, // Solo el primero está ocupado
        area: 15.0,
        rent: 150000,
        bedrooms: 0,
        bathrooms: 0,
        description: `Espacio de parqueadero cubierto #${i}`,
        additionalRooms: 'Espacio techado, iluminación, seguridad CCTV',
      },
    })
    parkingSpots.push(parkingSpot)
  }

  console.log(`✅ ${parkingSpots.length} espacios de parqueo creados`)

  // ========================================
  // 4. PRIMER PISO - LOCALES COMERCIALES
  // ========================================

  console.log('🏪 Creando primer piso - Locales comerciales...')

  const local1 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      unitType: UnitType.LOCAL,
      unitNumber: 'LOCAL-101',
      isAvailable: true,
      area: 45.0,
      rent: 1500000,
      bedrooms: 0,
      bathrooms: 1,
      halfBathrooms: 0,
      kitchen: 'No incluida - Espacio comercial',
      livingAndDining: 'Área abierta para negocio',
      description: 'Local comercial esquinero con excelente visibilidad',
      additionalRooms: 'Vitrina frontal, bodega pequeña, punto eléctrico trifásico',
    },
  })

  const local2 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      unitType: UnitType.LOCAL,
      unitNumber: 'LOCAL-102',
      isAvailable: false, // Ocupado
      area: 55.0,
      rent: 1800000,
      bedrooms: 0,
      bathrooms: 1,
      halfBathrooms: 1,
      kitchen: 'Área preparación básica',
      livingAndDining: 'Salón principal comercial',
      description: 'Local comercial amplio con área de preparación',
      additionalRooms: 'Dos vitrinas, bodega grande, instalación para restaurante',
    },
  })

  const floor1Units = [local1, local2]
  console.log(`✅ Piso 1: ${floor1Units.length} locales comerciales`)

  // ========================================
  // 5. SEGUNDO PISO - APARTAMENTOS 1 AMBIENTE
  // ========================================

  console.log('🏠 Creando segundo piso - Apartamentos 1 ambiente...')

  const apt201 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      unitType: UnitType.APARTMENT,
      unitNumber: 'APT-201',
      isAvailable: false, // Ocupado
      area: 35.0,
      rent: 800000,
      bedrooms: 1,
      bathrooms: 1,
      halfBathrooms: 0,
      kitchen: 'Cocina integral compacta',
      livingAndDining: 'Sala-comedor integrado',
      description: 'Apartamento 1 ambiente luminoso',
      additionalRooms: 'Balcón, closet empotrado, calentador eléctrico',
    },
  })

  const apt202 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      unitType: UnitType.APARTMENT,
      unitNumber: 'APT-202',
      isAvailable: true,
      area: 32.0,
      rent: 750000,
      bedrooms: 1,
      bathrooms: 1,
      halfBathrooms: 0,
      kitchen: 'Kitchenette moderna',
      livingAndDining: 'Sala-comedor compacto',
      description: 'Apartamento 1 ambiente luminoso',
      additionalRooms: 'Ventana grande, closet, instalación lavadora',
    },
  })

  const floor2Units = [apt201, apt202]
  console.log(`✅ Piso 2: ${floor2Units.length} apartamentos 1 ambiente`)

  // ========================================
  // 6. TERCER PISO - HABITACIONES INDIVIDUALES
  // ========================================

  console.log('🛏️ Creando tercer piso - Habitaciones individuales...')

  const room301 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      unitType: UnitType.ROOM,
      unitNumber: 'ROOM-301',
      isAvailable: false, // Ocupado
      area: 12.0,
      rent: 450000,
      bedrooms: 1,
      bathrooms: 0, // Usa baño compartido
      halfBathrooms: 0,
      kitchen: 'Acceso a cocina compartida COMMON-KITCHEN-P3',
      livingAndDining: 'No aplica - Habitación individual',
      description: 'Habitación individual con acceso a áreas comunes',
      additionalRooms: 'Closet empotrado, escritorio fijo, ventana',
    },
  })

  const room302 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      unitType: UnitType.ROOM,
      unitNumber: 'ROOM-302',
      isAvailable: true,
      area: 15.0,
      rent: 500000,
      bedrooms: 1,
      bathrooms: 0, // Usa baño compartido
      halfBathrooms: 0,
      kitchen: 'Acceso a cocina compartida COMMON-KITCHEN-P3',
      livingAndDining: 'Pequeña área de estar',
      description: 'Habitación individual más amplia',
      additionalRooms: 'Closet grande, escritorio, silla, ventilador de techo',
    },
  })

  const room303 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      unitType: UnitType.ROOM,
      unitNumber: 'ROOM-303',
      isAvailable: false, // Ocupado
      area: 13.0,
      rent: 470000,
      bedrooms: 1,
      bathrooms: 0, // Usa baño compartido
      halfBathrooms: 0,
      kitchen: 'Acceso a cocina compartida COMMON-KITCHEN-P3',
      livingAndDining: 'No aplica - Habitación individual',
      description: 'Habitación individual estándar',
      additionalRooms: 'Closet, escritorio pequeño, buena iluminación natural',
    },
  })

  const floor3Units = [room301, room302, room303]
  console.log(`✅ Piso 3: ${floor3Units.length} habitaciones individuales`)

  // ========================================
  // 7. CUARTO PISO - DEPARTAMENTO FAMILIAR GRANDE
  // ========================================

  console.log('🏨 Creando cuarto piso - Departamento familiar...')

  const apt401 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      unitType: UnitType.APARTMENT,
      unitNumber: 'APT-401',
      isAvailable: true,
      area: 85.0,
      rent: 1400000,
      bedrooms: 3, // 1 habitación grande + 2 normales
      bathrooms: 2, // 1 en habitación principal + 1 compartido
      halfBathrooms: 0,
      kitchen: 'Cocina integral grande con isla',
      livingAndDining: 'Sala-comedor amplio integrado',
      description: 'Departamento familiar con 3 habitaciones y 2 baños',
      additionalRooms:
        'Habitación principal con baño privado, balcón grande, área de lavandería, closets empotrados',
    },
  })

  const floor4Units = [apt401]
  console.log(`✅ Piso 4: ${floor4Units.length} departamento familiar`)

  // ========================================
  // 8. QUINTO PISO - DOS APARTAMENTOS VARIADOS
  // ========================================

  console.log('🌟 Creando quinto piso - Apartamentos variados...')

  const apt501 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      unitType: UnitType.APARTMENT,
      unitNumber: 'APT-501',
      isAvailable: false, // Ocupado
      area: 60.0,
      rent: 1100000,
      bedrooms: 2,
      bathrooms: 1,
      halfBathrooms: 0,
      kitchen: 'Cocina integral completa',
      livingAndDining: 'Sala-comedor independiente',
      description: 'Apartamento 2 habitaciones con sala independiente',
      additionalRooms: 'Balcón, área de ropas, closets en ambas habitaciones, acceso terraza',
    },
  })

  const apt502 = await prisma.unit.create({
    data: {
      propertyId: property.id,
      unitType: UnitType.APARTMENT,
      unitNumber: 'APT-502',
      isAvailable: true,
      area: 28.0,
      rent: 650000,
      bedrooms: 1,
      bathrooms: 1,
      halfBathrooms: 0,
      kitchen: 'Kitchenette básica',
      livingAndDining: 'No aplica - Solo habitación',
      description: 'Apartamento tipo estudio sin sala',
      additionalRooms: 'Closet compacto, ventana grande, acceso terraza comunal',
    },
  })

  const floor5Units = [apt501, apt502]
  console.log(`✅ Piso 5: ${floor5Units.length} apartamentos variados`)

  // ========================================
  // 9. CONSOLIDAR TODAS LAS UNIDADES
  // ========================================

  const allPrivateUnits = [...floor1Units, ...floor2Units, ...floor3Units, ...floor4Units, ...floor5Units]

  const allUnits = [...allPrivateUnits, ...parkingSpots]

  console.log(`✅ Total unidades privadas: ${allPrivateUnits.length}`)
  console.log(`✅ Total unidades rentables: ${allUnits.length}`)
  console.log(`✅ Total áreas comunes: ${commonAreas.length}`)

  // ========================================
  // 10. CREAR INFORMACIÓN LEGAL
  // ========================================

  const legal = await prisma.legal.create({
    data: {
      propertyId: property.id,
    },
  })

  await prisma.titleDocument.create({
    data: {
      legalId: legal.id,
      deedNumber: 'ESC-2018-ZONROSA-001',
      notary: 'Notaría 23 de Bogotá',
      deedDate: new Date('2018-07-22'),
      publicRegistry: 'REG-BOG-2018-9876',
      documentLink: 'https://docs.example.com/building-deed.pdf',
      isCurrent: true,
    },
  })

  console.log('✅ Información legal creada')

  // ========================================
  // 11. CALCULAR ESTADÍSTICAS REALES
  // ========================================

  const occupiedUnits = allUnits.filter((unit) => !unit.isAvailable)
  const availableUnits = allUnits.filter((unit) => unit.isAvailable)

  // Áreas
  const totalPrivateArea = allPrivateUnits.reduce((sum, unit) => sum + unit.area, 0)
  const totalCommonArea = commonAreas.reduce((sum, unit) => sum + unit.area, 0)
  const totalBuiltArea = totalPrivateArea + totalCommonArea

  // Finanzas
  const potentialMonthlyIncome = allUnits.reduce((sum, unit) => sum + unit.rent, 0)
  const currentMonthlyIncome = occupiedUnits.reduce((sum, unit) => sum + unit.rent, 0)
  const lostMonthlyIncome = potentialMonthlyIncome - currentMonthlyIncome

  // Ocupación
  const occupancyRate = Math.round((occupiedUnits.length / allUnits.length) * 100)

  // Actualizar área construida real en la propiedad
  await prisma.property.update({
    where: { id: property.id },
    data: { builtArea: totalBuiltArea },
  })

  // ========================================
  // 12. CREAR ECONOMÍA CON DATOS REALES
  // ========================================

  const economy = await prisma.economy.create({
    data: {
      propertyId: property.id,
      annualBudget: potentialMonthlyIncome * 12 * 1.3, // 30% buffer para gastos
      accumulatedCosts: currentMonthlyIncome * 2.5, // ~2.5 meses de gastos acumulados
      costDistribution: JSON.stringify({
        commonAreaMaintenance: {
          monthlyBudget: 600000,
          distribution: 'proportional_by_area',
          includedAreas: ['COMMON-HALL-P1', 'COMMON-STAIRS-ALL', 'COMMON-TERRACE-P5', 'COMMON-GARDEN-FRONT'],
          paidBy: 'all_units_proportionally',
        },
        sharedFloor3: {
          monthlyBudget: 200000,
          distribution: 'equal_split',
          includedAreas: ['COMMON-BATHROOM-P3', 'COMMON-KITCHEN-P3', 'COMMON-LAUNDRY-P3'],
          paidBy: 'floor_3_rooms_only',
        },
        utilities: {
          electricity: 'individual_meters_plus_common_proportional',
          water: 'individual_meters_plus_common_proportional',
          gas: 'individual_meters',
          internet: 'optional_individual',
        },
        security: {
          monthlyBudget: 400000,
          distribution: 'equal_among_all_units',
          service: '24_7_monitoring',
        },
        adminFee: {
          percentage: 8, // 8% de la renta como administración
          calculatedOn: 'monthly_rent',
          paidBy: 'tenants',
        },
      }),
    },
  })

  console.log('✅ Economía con datos reales creada')

  // ========================================
  // 13. RESUMEN FINAL CON ESTADÍSTICAS DETALLADAS
  // ========================================

  const buildingStats = {
    property: {
      id: property.id,
      name: property.name,
      address: `${property.streetAndNumber}, ${property.neighborhood}, ${property.city}`,
      type: property.propertyType,
      floors: property.floors,
      age: property.age,
    },
    areas: {
      totalBuilt: totalBuiltArea,
      privateArea: totalPrivateArea,
      commonArea: totalCommonArea,
      commonPercentage: Math.round((totalCommonArea / totalBuiltArea) * 100),
      landArea: property.totalLandArea,
    },
    units: {
      total: allUnits.length,
      byType: {
        locals: allPrivateUnits.filter((u) => u.unitType === 'LOCAL').length,
        apartments: allPrivateUnits.filter((u) => u.unitType === 'APARTMENT').length,
        rooms: allPrivateUnits.filter((u) => u.unitType === 'ROOM').length,
        parking: parkingSpots.length,
        commonAreas: commonAreas.length,
      },
      byFloor: {
        floor1: floor1Units.length + ' locales comerciales',
        floor2: floor2Units.length + ' apartamentos 1 ambiente',
        floor3: floor3Units.length + ' habitaciones individuales',
        floor4: floor4Units.length + ' departamento familiar',
        floor5: floor5Units.length + ' apartamentos variados',
      },
    },
    occupancy: {
      total: allUnits.length,
      occupied: occupiedUnits.length,
      available: availableUnits.length,
      rate: occupancyRate,
    },
    financial: {
      potentialMonthlyIncome: potentialMonthlyIncome,
      currentMonthlyIncome: currentMonthlyIncome,
      lostMonthlyIncome: lostMonthlyIncome,
      annualPotential: potentialMonthlyIncome * 12,
      currentAnnual: currentMonthlyIncome * 12,
      adminFeeIncome: currentMonthlyIncome * 0.08, // 8% administración
    },
    features: {
      parking: property.parking,
      recreationalAreas: property.recreationalAreas,
      garden: property.yardOrGarden,
      balconies: property.balconiesAndTerraces,
    },
  }

  // ========================================
  // 14. MOSTRAR RESUMEN DETALLADO
  // ========================================

  console.log('🎉 ¡Edificio optimizado creado exitosamente!')
  console.log('═══════════════════════════════════════════')
  console.log(`🏢 ${buildingStats.property.name}`)
  console.log(`📍 ${buildingStats.property.address}`)
  console.log(
    `🏗️ ${buildingStats.property.type} - ${buildingStats.property.floors} pisos - ${buildingStats.property.age} años`
  )
  console.log('')

  console.log('📐 DISTRIBUCIÓN DE ÁREAS:')
  console.log(`  • Total construida: ${buildingStats.areas.totalBuilt} m²`)
  console.log(
    `  • Área privada: ${buildingStats.areas.privateArea} m² (${100 - buildingStats.areas.commonPercentage}%)`
  )
  console.log(
    `  • Área común: ${buildingStats.areas.commonArea} m² (${buildingStats.areas.commonPercentage}%)`
  )
  console.log(`  • Terreno: ${buildingStats.areas.landArea} m²`)
  console.log('')

  console.log('🏠 UNIDADES POR TIPO:')
  console.log(`  • Locales comerciales: ${buildingStats.units.byType.locals}`)
  console.log(`  • Apartamentos: ${buildingStats.units.byType.apartments}`)
  console.log(`  • Habitaciones: ${buildingStats.units.byType.rooms}`)
  console.log(`  • Parqueaderos: ${buildingStats.units.byType.parking}`)
  console.log(`  • Áreas comunes: ${buildingStats.units.byType.commonAreas}`)
  console.log('')

  console.log('🏗️ DISTRIBUCIÓN POR PISOS:')
  console.log(`  • Piso 1: ${buildingStats.units.byFloor.floor1}`)
  console.log(`  • Piso 2: ${buildingStats.units.byFloor.floor2}`)
  console.log(`  • Piso 3: ${buildingStats.units.byFloor.floor3}`)
  console.log(`  • Piso 4: ${buildingStats.units.byFloor.floor4}`)
  console.log(`  • Piso 5: ${buildingStats.units.byFloor.floor5}`)
  console.log('')

  console.log('📊 OCUPACIÓN:')
  console.log(
    `  • Ocupadas: ${buildingStats.occupancy.occupied}/${buildingStats.occupancy.total} (${buildingStats.occupancy.rate}%)`
  )
  console.log(`  • Disponibles: ${buildingStats.occupancy.available}`)
  console.log('')

  console.log('💰 ANÁLISIS FINANCIERO:')
  console.log(
    `  • Ingreso potencial mensual: $${buildingStats.financial.potentialMonthlyIncome.toLocaleString()}`
  )
  console.log(`  • Ingreso actual mensual: $${buildingStats.financial.currentMonthlyIncome.toLocaleString()}`)
  console.log(`  • Ingreso perdido mensual: $${buildingStats.financial.lostMonthlyIncome.toLocaleString()}`)
  console.log(`  • Potencial anual: $${buildingStats.financial.annualPotential.toLocaleString()}`)
  console.log(`  • Fee administración mensual: $${buildingStats.financial.adminFeeIncome.toLocaleString()}`)

  return buildingStats
}

// Función principal para ejecutar directamente
const main = async () => {
  const prisma = new PrismaClient()

  try {
    const admin = await prisma.admin.findFirst({
      include: { user: true },
    })

    if (!admin) {
      console.error('❌ No se encontró un administrador. Ejecuta primero el seed de usuarios.')
      process.exit(1)
    }

    console.log(`🔑 Usando administrador: ${admin.user.name} ${admin.user.lastName}`)

    const buildingStats = await createOptimizedBuildingFiveFloors(prisma, admin.id)

    console.log('\n🎯 ¡Edificio con información granular creado exitosamente!')
    console.log('💡 Cada unidad tiene información específica y detallada')
    console.log('🏛️ Áreas comunes gestionables como unidades independientes')
    console.log('📊 Estadísticas calculadas basadas en datos reales')
  } catch (error) {
    console.error('💥 Error creando el edificio:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exportar la función
module.exports = { createOptimizedBuildingFiveFloors }

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
}
