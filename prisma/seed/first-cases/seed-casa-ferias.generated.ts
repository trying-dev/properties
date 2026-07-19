// GENERADO por scripts/gen-seed-from-md.ts desde data/ferias.md — no editar a mano.
import { prisma } from '+/lib/prisma'

const PROPERTY_ID = 'case-casa-ferias'

const units = [
    {
      unitNumber: "CF-01-LOCAL-001",
      floor: 1,
      area: 2,
      bedrooms: 0,
      bathrooms: 1,
      status: "VACANT",
      baseRent: 800000,
      deposit: 0,
      description: "Local comercial con entrada independiente y baño independiente que comparte servicios de agua y luz.",
      images: JSON.stringify(['https://picsum.photos/seed/cf01local0011/800/600', 'https://picsum.photos/seed/cf01local0012/800/600', 'https://picsum.photos/seed/cf01local0013/800/600']),
    },
    {
      unitNumber: "CG-01-APST-001",
      floor: 1,
      bedrooms: 1,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      petFriendly: true,
      status: "VACANT",
      baseRent: 500000,
      deposit: 500000,
      description: "Aparta estudio con baño y cocina que comparte servicios de agua, luz y gas.",
      images: JSON.stringify(['https://picsum.photos/seed/cg01apst0011/800/600', 'https://picsum.photos/seed/cg01apst0012/800/600', 'https://picsum.photos/seed/cg01apst0013/800/600']),
    },
    {
      unitNumber: "CG-01-APST-002",
      floor: 1,
      bedrooms: 1,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      petFriendly: true,
      status: "VACANT",
      baseRent: 500000,
      deposit: 500000,
      description: "Aparta estudio con baño y cocina que comparte servicios de agua, luz y gas.",
      images: JSON.stringify(['https://picsum.photos/seed/cg01apst0021/800/600', 'https://picsum.photos/seed/cg01apst0022/800/600', 'https://picsum.photos/seed/cg01apst0023/800/600']),
    },
    {
      unitNumber: "CG-01-APST-003",
      floor: 2,
      bedrooms: 1,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      petFriendly: true,
      status: "VACANT",
      baseRent: 600000,
      deposit: 600000,
      description: "Aparta estudio con baño y cocina que comparte espacio le lavado, servicios de agua, luz y gas.",
      images: JSON.stringify(['https://picsum.photos/seed/cg01apst0031/800/600', 'https://picsum.photos/seed/cg01apst0032/800/600', 'https://picsum.photos/seed/cg01apst0033/800/600']),
    },
    {
      unitNumber: "CG-01-APT-001",
      floor: 1,
      area: 2,
      bedrooms: 3,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      petFriendly: true,
      status: "VACANT",
      baseRent: 900000,
      deposit: 0,
      description: "Apartamento con 3 habitaciones, cocina y baño privado que comparte espacio le lavado, servicios de agua, luz y gas.",
      images: JSON.stringify(['https://picsum.photos/seed/cg01apt0011/800/600', 'https://picsum.photos/seed/cg01apt0012/800/600', 'https://picsum.photos/seed/cg01apt0013/800/600']),
    },
    {
      unitNumber: "CG-01-APT-002",
      floor: 1,
      area: 2,
      bedrooms: 2,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      laundry: true,
      petFriendly: true,
      status: "VACANT",
      baseRent: 800000,
      deposit: 0,
      description: "Apartamento con 2 habitaciones, sala-comedor, cocina, baño, que comparte espacio le lavado, servicios de agua, luz y gas.",
      images: JSON.stringify(['https://picsum.photos/seed/cg01apt0021/800/600', 'https://picsum.photos/seed/cg01apt0022/800/600', 'https://picsum.photos/seed/cg01apt0023/800/600']),
    },
    {
      unitNumber: "CG-01-APT-003",
      floor: 2,
      area: 2,
      bedrooms: 1,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      livingDiningRoom: true,
      status: "VACANT",
      baseRent: 700000,
      deposit: 0,
      description: "Apartamento con 1 habitacion, sala-comedor, cocina, baño, que comparte espacio le lavado, servicios de agua, luz y gas.",
      images: JSON.stringify(['https://picsum.photos/seed/cg01apt0031/800/600', 'https://picsum.photos/seed/cg01apt0032/800/600', 'https://picsum.photos/seed/cg01apt0033/800/600']),
    },
    {
      unitNumber: "CG-01-APT-004",
      floor: 2,
      area: 2,
      bedrooms: 1,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      livingDiningRoom: true,
      status: "VACANT",
      baseRent: 700000,
      deposit: 0,
      description: "Apartamento con 1 habitacion, sala-comedor, cocina, baño, que comparte espacio le lavado, servicios de agua, luz y gas.",
      images: JSON.stringify(['https://picsum.photos/seed/cg01apt0041/800/600', 'https://picsum.photos/seed/cg01apt0042/800/600', 'https://picsum.photos/seed/cg01apt0043/800/600']),
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
      petFriendly: true,
      status: "VACANT",
      baseRent: 800000,
      deposit: 0,
      description: "Apartamento con 2 habitacion, sala-comedor, cocina, baño, espacio le lavado, que comparte servicios de agua, luz y gas.",
      images: JSON.stringify(['https://picsum.photos/seed/cg01apt0031/800/600', 'https://picsum.photos/seed/cg01apt0032/800/600', 'https://picsum.photos/seed/cg01apt0033/800/600']),
    },
]

export const seedCasaFerias = async () => {
  const admin = await prisma.admin.findFirst({
    where: { user: { email: 'admin1@propiedades.com' } },
  })
  if (!admin) {
    throw new Error('No existe admin1@propiedades.com. Ejecuta el seed principal primero.')
  }

  const data = {
      name: "Casa Ferias",
      description: "Casa de 3 pisos con local y unidades residenciales.",
      street: "",
      number: "",
      city: "Bogotá",
      neighborhood: "Ferias",
      state: "Cundinamarca",
      postalCode: "# fallback 00000",
      country: "Colombia",
      gpsCoordinates: "4.686104904869476, -74.08861814559945 #  confirmar",
      propertyType: "BUILDING",
      status: "ACTIVE",
      totalLandArea: 8,
      builtArea: 2,
      floors: 2,
      age: 20,
      stratum: 3,
      district: "Engativa",
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
    console.log('✅ ferias actualizada (' + units.length + ' unidades).')
    return
  }
  await prisma.property.create({ data: { id: PROPERTY_ID, ...data } })
  console.log('✅ ferias creada (' + units.length + ' unidades).')
}

if (process.argv[1]?.includes('seed-casa-ferias')) {
  seedCasaFerias()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
}
