// GENERADO por scripts/gen-seed-from-md.ts desde data/puertas-del-sol-2.md — no editar a mano.
import { prisma } from '+/lib/prisma'

const PROPERTY_ID = 'case-casa-puertas-del-sol-2'

const units = [
    {
      unitNumber: "CPS-01-CS-001",
      floor: 1,
      area: 3,
      bedrooms: 5,
      bathrooms: 2,
      kitchen: true,
      livingRoom: true,
      diningRoom: true,
      status: "VACANT",
      baseRent: 1800000,
      deposit: 0,
      description: "Casa con 5 habitacion, sala, comedor, cocina, baño, espacio le lavado y soilar amplio en el 4 piso con servicios independientes.",
      images: JSON.stringify(['https://picsum.photos/seed/cps01cs0011/800/600', 'https://picsum.photos/seed/cps01cs0012/800/600', 'https://picsum.photos/seed/cps01cs0013/800/600']),
    },
]

export const seedCasaPuertasDelSol2 = async () => {
  const admin = await prisma.admin.findFirst({
    where: { user: { email: 'admin1@propiedades.com' } },
  })
  if (!admin) {
    throw new Error('No existe admin1@propiedades.com. Ejecuta el seed principal primero.')
  }

  const data = {
      name: "Casa Puertas del Sol 2",
      description: "Casa de 4 conformado por 1 unidad residencial.",
      street: "Cll 139 C",
      number: "114 - 96",
      city: "Bogotá",
      neighborhood: "Piertas del sol",
      state: "Cundinamarca",
      postalCode: "# fallback 00000",
      country: "Colombia",
      gpsCoordinates: "4.7453508666160085, -74.10525170582646 #  confirmar",
      propertyType: "HOUSE",
      status: "ACTIVE",
      totalLandArea: 3,
      builtArea: 2,
      floors: 4,
      age: 30,
      stratum: 2,
      district: "Suba",
      structuralMaterial: "ladrillo, bloque, placa masisa, tejas en eternil y estructura en marquesina con vidrios",
      complex: "No",
      building: "No",
      parking: 0,
      commonZones: JSON.stringify([{"name":"escaleras"},{"name":"pasillo primer piso"},{"name":"pasillo segundo piso"}]),
      admins: { connect: [{ id: admin.id }] },
      units: { create: units },
  }

  const existing = await prisma.property.findUnique({ where: { id: PROPERTY_ID } })
  if (existing) {
    await prisma.unit.deleteMany({ where: { propertyId: PROPERTY_ID } })
    await prisma.property.update({ where: { id: PROPERTY_ID }, data })
    console.log('✅ puertas-del-sol-2 actualizada (' + units.length + ' unidades).')
    return
  }
  await prisma.property.create({ data: { id: PROPERTY_ID, ...data } })
  console.log('✅ puertas-del-sol-2 creada (' + units.length + ' unidades).')
}

if (process.argv[1]?.includes('seed-casa-puertas-del-sol-2')) {
  seedCasaPuertasDelSol2()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
}
