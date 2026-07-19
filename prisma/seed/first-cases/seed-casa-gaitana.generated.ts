// GENERADO por scripts/gen-seed-from-md.ts desde data/gaitana.md — no editar a mano.
import { prisma } from '+/lib/prisma'

const PROPERTY_ID = 'case-casa-gaitana'

const units = [
    {
      unitNumber: "CG-01-LOCAL-001",
      floor: 1,
      area: 2,
      bedrooms: 0,
      bathrooms: 1,
      bathroom: true,
      status: "VACANT",
      baseRent: 800000,
      deposit: 0,
      description: "Local comercial en L con entrada independiente y bañoindependiente que comparte servicios de agua y luz.",
      images: JSON.stringify(['https://picsum.photos/seed/cg01local0011/800/600', 'https://picsum.photos/seed/cg01local0012/800/600', 'https://picsum.photos/seed/cg01local0013/800/600']),
    },
    {
      unitNumber: "CG-01-APT-001",
      floor: 1,
      bedrooms: 2,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      diningRoom: true,
      petFriendly: true,
      status: "VACANT",
      baseRent: 700000,
      deposit: 700000,
      description: "Unidad con cocina y baño privado.",
      images: JSON.stringify(['https://picsum.photos/seed/cg01apt0011/800/600', 'https://picsum.photos/seed/cg01apt0012/800/600', 'https://picsum.photos/seed/cg01apt0013/800/600']),
    },
    {
      unitNumber: "CG-01-APT-002",
      floor: 2,
      area: 2,
      bedrooms: 2,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      livingDiningRoom: true,
      petFriendly: true,
      status: "VACANT",
      baseRent: 750000,
      deposit: 0,
      description: "Apartamento con 2 habitaciones, cocina, sala-comedor y baño privado que comparte servicios de agua, luz y gas.",
      images: JSON.stringify(['https://picsum.photos/seed/cg01apt0021/800/600', 'https://picsum.photos/seed/cg01apt0022/800/600', 'https://picsum.photos/seed/cg01apt0023/800/600']),
    },
    {
      unitNumber: "CG-01-APT-003",
      floor: 2,
      area: 2,
      bedrooms: 2,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      livingDiningRoom: true,
      laundry: true,
      petFriendly: true,
      status: "VACANT",
      baseRent: 800000,
      deposit: 0,
      description: "Apartamento con 2 habitaciones, sala-comedor, cocina, baño y área de lavado, que comparte servicios de agua, luz y gas.",
      images: JSON.stringify(['https://picsum.photos/seed/cg01apt0031/800/600', 'https://picsum.photos/seed/cg01apt0032/800/600', 'https://picsum.photos/seed/cg01apt0033/800/600']),
    },
    {
      unitNumber: "CG-01-APT-004",
      floor: 3,
      area: 2,
      bedrooms: 2,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      livingDiningRoom: true,
      status: "VACANT",
      baseRent: 700000,
      deposit: 0,
      description: "Habitación en piso compartido.",
      images: JSON.stringify(['https://picsum.photos/seed/cg01apt0041/800/600', 'https://picsum.photos/seed/cg01apt0042/800/600', 'https://picsum.photos/seed/cg01apt0043/800/600']),
    },
]

export const seedCasaGaitana = async () => {
  const admin = await prisma.admin.findFirst({
    where: { user: { email: 'admin1@propiedades.com' } },
  })
  if (!admin) {
    throw new Error('No existe admin1@propiedades.com. Ejecuta el seed principal primero.')
  }

  const data = {
      name: "Casa Gaitana",
      description: "Casa de 3 pisos con local y unidades residenciales.",
      street: "",
      number: "",
      city: "Bogotá",
      neighborhood: "Gaitana",
      state: "Cundinamarca",
      postalCode: "# fallback 00000",
      country: "Colombia",
      gpsCoordinates: "4.739513400735189, -74.10871951331606 #  confirmar",
      propertyType: "BUILDING",
      status: "ACTIVE",
      totalLandArea: 6,
      builtArea: 2,
      floors: 3,
      age: 20,
      stratum: 3,
      district: "Suba",
      structuralMaterial: "ladrillo, bloque, placa masisa, placa facil y tejas metalicas en estructura",
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
    console.log('✅ gaitana actualizada (' + units.length + ' unidades).')
    return
  }
  await prisma.property.create({ data: { id: PROPERTY_ID, ...data } })
  console.log('✅ gaitana creada (' + units.length + ' unidades).')
}

if (process.argv[1]?.includes('seed-casa-gaitana')) {
  seedCasaGaitana()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
}
