// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient, PropertyType, PropertyStatus, UnitStatus } = require('@prisma/client')

const prisma = new PrismaClient()

const main = async () => {
  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: 'asc' },
  })

  if (admins.length < 2) {
    throw new Error('Se necesitan al menos 2 administradores para el seed.')
  }

  const ADMIN_ID = admins[1].id

  console.log('Usando el segundo admin con ID:', ADMIN_ID)

  const commonZonesHouse1 = [
    {
      id: 'zone_patio_laureles',
      name: 'Patio Trasero',
      description: 'Amplio patio con zona BBQ y jardín',
      available: true,
      openingTime: '06:00',
      closingTime: '22:00',
      capacity: 10,
      adminId: ADMIN_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'zone_garden_laureles',
      name: 'Jardín Frontal',
      description: 'Jardín decorativo en la entrada',
      available: true,
      adminId: ADMIN_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const commonZonesHouse2 = [
    {
      id: 'zone_terrace_teusa',
      name: 'Terraza Superior',
      description: 'Terraza amplia en el segundo piso',
      available: true,
      openingTime: '07:00',
      closingTime: '21:00',
      capacity: 8,
      adminId: ADMIN_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'zone_garage_teusa',
      name: 'Garaje Cubierto',
      description: 'Área de parqueadero para 2 vehículos',
      available: true,
      adminId: ADMIN_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'zone_reading_teusa',
      name: 'Zona de Lectura',
      description: 'Espacio tranquilo para lectura y estudio',
      available: true,
      openingTime: '08:00',
      closingTime: '20:00',
      capacity: 4,
      adminId: ADMIN_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const properties = [
    {
      id: 'house-seed-1',
      adminId: ADMIN_ID,
      name: 'Casa Laureles',
      description: 'Casa amplia de dos pisos con patio trasero.',
      street: 'Calle 34',
      number: '78-12',
      city: 'Medellín',
      neighborhood: 'Laureles',
      state: 'Antioquia',
      postalCode: '050022',
      gpsCoordinates: '6.2442,-75.5812',
      country: 'Colombia',
      propertyType: PropertyType.HOUSE,
      totalLandArea: 240,
      builtArea: 180,
      floors: 2,
      age: 8,
      yardOrGarden: 'Patio y jardín posterior',
      parking: 1,
      parkingLocation: 'Cochera',
      balconiesAndTerraces: 'Balcón segundo piso',
      recreationalAreas: 'BBQ',
      status: PropertyStatus.ACTIVE,
      commonZones: JSON.stringify(commonZonesHouse1), // Zonas comunes como JSON
      units: {
        create: [
          {
            unitNumber: '101',
            floor: 1,
            area: 60,
            bedrooms: 2,
            bathrooms: 1,
            furnished: false,
            balcony: false,
            parking: true,
            storage: false,
            petFriendly: true,
            smokingAllowed: false,
            internet: true,
            cableTV: false,
            waterIncluded: false,
            gasIncluded: false,
            status: UnitStatus.VACANT,
            baseRent: 1800000,
            deposit: 1800000,
            description: 'Apartamento 2H/1B, primer piso, acceso al patio.',
            images: JSON.stringify(['https://picsum.photos/seed/laureles101/800/600']), // Array como JSON string
          },
          {
            unitNumber: '102',
            floor: 1,
            area: 55,
            bedrooms: 1,
            bathrooms: 1,
            furnished: true,
            balcony: false,
            parking: false,
            storage: false,
            petFriendly: false,
            smokingAllowed: false,
            internet: true,
            cableTV: true,
            waterIncluded: false,
            gasIncluded: false,
            status: UnitStatus.VACANT,
            baseRent: 1600000,
            deposit: 1600000,
            description: 'Estudio amoblado, ideal para 1 persona.',
            images: JSON.stringify(['https://picsum.photos/seed/laureles102/800/600']),
          },
          {
            unitNumber: '201',
            floor: 2,
            area: 75,
            bedrooms: 3,
            bathrooms: 1.5,
            furnished: false,
            balcony: true,
            parking: true,
            storage: true,
            petFriendly: true,
            smokingAllowed: false,
            internet: true,
            cableTV: true,
            waterIncluded: false,
            gasIncluded: false,
            status: UnitStatus.VACANT,
            baseRent: 2200000,
            deposit: 2200000,
            description: '3H/1.5B con balcón, segundo piso.',
            images: JSON.stringify(['https://picsum.photos/seed/laureles201/800/600']),
          },
        ],
      },
    },
    {
      id: 'house-seed-2',
      adminId: ADMIN_ID,
      name: 'Casa Teusaquillo',
      description: 'Casa clásica de dos niveles en barrio tranquilo.',
      street: 'Carrera 28',
      number: '45-09',
      city: 'Bogotá',
      neighborhood: 'Teusaquillo',
      state: 'Cundinamarca',
      postalCode: '111311',
      gpsCoordinates: '4.6394,-74.0850',
      country: 'Colombia',
      propertyType: PropertyType.HOUSE,
      totalLandArea: 260,
      builtArea: 190,
      floors: 2,
      age: 12,
      yardOrGarden: 'Jardín frontal',
      parking: 2,
      parkingLocation: 'Garaje cubierto',
      balconiesAndTerraces: 'Terraza amplia',
      recreationalAreas: 'Zona de lectura',
      status: PropertyStatus.ACTIVE,
      commonZones: JSON.stringify(commonZonesHouse2), // Zonas comunes como JSON
      units: {
        create: [
          {
            unitNumber: '101',
            floor: 1,
            area: 62,
            bedrooms: 2,
            bathrooms: 1,
            furnished: false,
            balcony: false,
            parking: true,
            storage: false,
            petFriendly: false,
            smokingAllowed: false,
            internet: true,
            cableTV: false,
            waterIncluded: false,
            gasIncluded: true,
            status: UnitStatus.VACANT,
            baseRent: 2100000,
            deposit: 2100000,
            description: '2H/1B, primer piso, garaje incluido.',
            images: JSON.stringify(['https://picsum.photos/seed/teusa101/800/600']),
          },
          {
            unitNumber: '102',
            floor: 1,
            area: 58,
            bedrooms: 1,
            bathrooms: 1,
            furnished: true,
            balcony: false,
            parking: false,
            storage: false,
            petFriendly: true,
            smokingAllowed: false,
            internet: true,
            cableTV: true,
            waterIncluded: true,
            gasIncluded: false,
            status: UnitStatus.VACANT,
            baseRent: 1750000,
            deposit: 1750000,
            description: '1H/1B amoblado con servicios incluidos.',
            images: JSON.stringify(['https://picsum.photos/seed/teusa102/800/600']),
          },
          {
            unitNumber: '201',
            floor: 2,
            area: 80,
            bedrooms: 3,
            bathrooms: 2,
            furnished: false,
            balcony: true,
            parking: true,
            storage: true,
            petFriendly: true,
            smokingAllowed: false,
            internet: true,
            cableTV: true,
            waterIncluded: false,
            gasIncluded: false,
            status: UnitStatus.VACANT,
            baseRent: 2600000,
            deposit: 2600000,
            description: '3H/2B, segundo piso con terraza.',
            images: JSON.stringify(['https://picsum.photos/seed/teusa201/800/600']),
          },
        ],
      },
    },
  ]

  console.log('🏠 Creando propiedades...')

  for (const p of properties) {
    const result = await prisma.property.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        description: p.description,
        street: p.street,
        number: p.number,
        city: p.city,
        neighborhood: p.neighborhood,
        state: p.state,
        postalCode: p.postalCode,
        gpsCoordinates: p.gpsCoordinates,
        country: p.country,
        propertyType: p.propertyType,
        totalLandArea: p.totalLandArea,
        builtArea: p.builtArea,
        floors: p.floors,
        age: p.age,
        yardOrGarden: p.yardOrGarden,
        parking: p.parking,
        parkingLocation: p.parkingLocation,
        balconiesAndTerraces: p.balconiesAndTerraces,
        recreationalAreas: p.recreationalAreas,
        status: p.status,
        commonZones: p.commonZones, // Actualizar zonas comunes
      },
      create: p,
      include: {
        units: true,
      },
    })

    console.log(`✅ Propiedad creada/actualizada: ${result.name}`)
    console.log(`   - Ubicación: ${result.neighborhood}, ${result.city}`)
    console.log(`   - Unidades: ${result.units.length}`)

    // Parsear y mostrar zonas comunes
    try {
      const zones = JSON.parse(result.commonZones || '[]')
      console.log(`   - Zonas comunes: ${zones.length}`)
      zones.forEach((zone) => console.log(`     • ${zone.name}`))
    } catch (e) {
      console.log(`   - Zonas comunes: Error al parsear`)
    }
  }

  // Estadísticas finales
  const totalProperties = await prisma.property.count()
  const totalUnits = await prisma.unit.count()

  console.log('\n📊 RESUMEN:')
  console.log('═══════════════════════')
  console.log(`🏠 Total propiedades: ${totalProperties}`)
  console.log(`🏢 Total unidades: ${totalUnits}`)
  console.log(`📍 Ciudades: Medellín, Bogotá`)
  console.log(`🎯 Tipo: Casas residenciales`)
  console.log(`💰 Rango de precios: $1.6M - $2.6M`)

  console.log('\n✅ Seed de propiedades y unidades completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('💥 Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
