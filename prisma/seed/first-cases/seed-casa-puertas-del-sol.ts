// GENERADO por scripts/gen-seed-from-md.ts desde data/puertas-del-sol.md — no editar a mano.
import { prisma } from '+/lib/prisma'

const PROPERTY_ID = 'case-casa-puertas-del-sol'

const units = [
    {
      unitNumber: "PDS-CASA",
      floor: 1,
      area: 2,
      bedrooms: 2,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      livingDiningRoom: true,
      laundry: true,
      status: "VACANT",
      description: "Casa completa de 2 pisos.",
      images: JSON.stringify(['https://picsum.photos/seed/pdscasa1/800/600', 'https://picsum.photos/seed/pdscasa2/800/600', 'https://picsum.photos/seed/pdscasa3/800/600']),
    },
]

export const seedCasaPuertasDelSol = async () => {
  const admin = await prisma.admin.findFirst({
    where: { user: { email: 'admin1@propiedades.com' } },
  })
  if (!admin) {
    throw new Error('No existe admin1@propiedades.com. Ejecuta el seed principal primero.')
  }

  const data = {
      name: "Casa Puertas del Sol",
      description: "Casa de 2 pisos, 2.90 m de frente × 12 m de fondo.",
      street: "???",
      number: "",
      city: "Bogotá",
      neighborhood: "",
      state: "Bogotá",
      postalCode: "00000",
      country: "Colombia",
      propertyType: "HOUSE",
      status: "ACTIVE",
      totalLandArea: 2,
      builtArea: 2,
      floors: 2,
      age: 0,
      yardOrGarden: "patio con lavadero (piso 1)",
      parking: 0,
      commonZones: JSON.stringify([{"name":"patio"},{"name":"lavadero"}]),
      admins: { connect: [{ id: admin.id }] },
      units: { create: units },
  }

  const existing = await prisma.property.findUnique({ where: { id: PROPERTY_ID } })
  if (existing) {
    await prisma.unit.deleteMany({ where: { propertyId: PROPERTY_ID } })
    await prisma.property.update({ where: { id: PROPERTY_ID }, data })
    console.log('✅ puertas-del-sol actualizada (' + units.length + ' unidades).')
    return
  }
  await prisma.property.create({ data: { id: PROPERTY_ID, ...data } })
  console.log('✅ puertas-del-sol creada (' + units.length + ' unidades).')
}

if (process.argv[1]?.includes('seed-casa-puertas-del-sol')) {
  seedCasaPuertasDelSol()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
}
