// GENERADO por scripts/gen-seed-from-md.ts desde data/villa-maria.md — no editar a mano.
import { prisma } from '+/lib/prisma'

const PROPERTY_ID = 'case-casa-villa-maria'

const units = [
    {
      unitNumber: "CVLL-01-APT-001",
      floor: 1,
      area: 6,
      bedrooms: 1,
      bathrooms: 2,
      kitchen: true,
      livingRoom: true,
      diningRoom: true,
      status: "VACANT",
      baseRent: 0,
      deposit: 0,
      description: "Apartamento con 1 habitacion en L con closet y baño privado, cocina, sala, comedor, punnto de lavanderia, patio de ropas, parqueadero independiente.",
      images: JSON.stringify(['https://picsum.photos/seed/cvll01apt0011/800/600', 'https://picsum.photos/seed/cvll01apt0012/800/600', 'https://picsum.photos/seed/cvll01apt0013/800/600']),
    },
]

export const seedCasaVillaMaria = async () => {
  const admin = await prisma.admin.findFirst({
    where: { user: { email: 'admin1@propiedades.com' } },
  })
  if (!admin) {
    throw new Error('No existe admin1@propiedades.com. Ejecuta el seed principal primero.')
  }

  const data = {
      name: "Apartamento Villa Maria",
      description: "Apartamento ubicado en casa de 3 pisos.",
      street: "Cll 138 A",
      number: "113 - 18",
      city: "Bogotá",
      neighborhood: "Villa maria",
      state: "Cundinamarca",
      postalCode: "# fallback 00000",
      country: "Colombia",
      gpsCoordinates: "4.743183458406693, -74.10431807664398 #  confirmar",
      propertyType: "APARTMENT",
      status: "ACTIVE",
      totalLandArea: 6,
      builtArea: 2,
      floors: 1,
      age: 30,
      stratum: 2,
      district: "Suba",
      structuralMaterial: "ladrillo, bloque, placa masisa",
      complex: "No",
      building: "No",
      yardOrGarden: "si",
      parking: 1,
      parkingLocation: "frente a la entrada",
      balconiesAndTerraces: "No",
      recreationalAreas: "No",
      commonZones: JSON.stringify([{"name":"no"}]),
      admins: { connect: [{ id: admin.id }] },
      units: { create: units },
  }

  const existing = await prisma.property.findUnique({ where: { id: PROPERTY_ID } })
  if (existing) {
    await prisma.unit.deleteMany({ where: { propertyId: PROPERTY_ID } })
    await prisma.property.update({ where: { id: PROPERTY_ID }, data })
    console.log('✅ villa-maria actualizada (' + units.length + ' unidades).')
    return
  }
  await prisma.property.create({ data: { id: PROPERTY_ID, ...data } })
  console.log('✅ villa-maria creada (' + units.length + ' unidades).')
}

if (process.argv[1]?.includes('seed-casa-villa-maria')) {
  seedCasaVillaMaria()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
}
