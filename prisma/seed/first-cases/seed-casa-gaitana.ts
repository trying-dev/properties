// GENERADO por scripts/gen-seed-from-md.ts desde data/gaitana.md — no editar a mano.
import { prisma } from '+/lib/prisma'

const PROPERTY_ID = 'case-casa-gaitana'

const units = [
    {
      unitNumber: "101",
      floor: 1,
      area: 2,
      bedrooms: 0,
      bathrooms: 1,
      bathroom: true,
      status: "VACANT",
      baseRent: 800000,
      deposit: 0,
      description: "Local comercial en L con entrada independiente y bañoindependiente que comparte servicios de agua y luz.",
      images: JSON.stringify(['https://picsum.photos/id/20/800/600', 'https://picsum.photos/id/27/800/600', 'https://picsum.photos/id/28/800/600']),
    },
    {
      unitNumber: "102",
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
      images: JSON.stringify(['https://picsum.photos/id/30/800/600', 'https://picsum.photos/id/42/800/600', 'https://picsum.photos/id/49/800/600']),
    },
    {
      unitNumber: "201",
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
      images: JSON.stringify(['https://picsum.photos/id/57/800/600', 'https://picsum.photos/id/78/800/600', 'https://picsum.photos/id/121/800/600']),
    },
    {
      unitNumber: "202",
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
      images: JSON.stringify(['https://picsum.photos/id/122/800/600', 'https://picsum.photos/id/142/800/600', 'https://picsum.photos/id/193/800/600']),
    },
    {
      unitNumber: "301",
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
      images: JSON.stringify(['https://picsum.photos/id/214/800/600', 'https://picsum.photos/id/232/800/600', 'https://picsum.photos/id/249/800/600']),
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
