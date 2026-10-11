// GENERADO por scripts/gen-seed-from-md.ts desde data/tibabuyes.md — no editar a mano.
import { prisma } from '+/lib/prisma'

const PROPERTY_ID = 'case-casa-tibabuyes'

const units = [
    {
      unitNumber: "101",
      floor: 1,
      area: 40,
      bedrooms: 0,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      status: "VACANT",
      baseRent: 1800000,
      deposit: 1800000,
      description: "Local comercial con cocina y baño privado.",
      images: JSON.stringify(['https://picsum.photos/id/30/800/600', 'https://picsum.photos/id/42/800/600', 'https://picsum.photos/id/49/800/600']),
    },
    {
      unitNumber: "102",
      floor: 1,
      area: 30,
      bedrooms: 0,
      bathrooms: 0,
      status: "VACANT",
      baseRent: 1200000,
      deposit: 1200000,
      description: "Local comercial tipo open space.",
      images: JSON.stringify(['https://picsum.photos/id/57/800/600', 'https://picsum.photos/id/78/800/600', 'https://picsum.photos/id/121/800/600']),
    },
    {
      unitNumber: "201",
      floor: 2,
      area: 45,
      bedrooms: 1,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      petFriendly: true,
      status: "VACANT",
      baseRent: 1300000,
      deposit: 1300000,
      description: "Unidad con cocina y baño privado.",
      images: JSON.stringify(['https://picsum.photos/id/122/800/600', 'https://picsum.photos/id/142/800/600', 'https://picsum.photos/id/193/800/600']),
    },
    {
      unitNumber: "202",
      floor: 2,
      area: 48,
      bedrooms: 1,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      petFriendly: true,
      status: "VACANT",
      baseRent: 1350000,
      deposit: 1350000,
      description: "Unidad con cocina y baño privado.",
      images: JSON.stringify(['https://picsum.photos/id/214/800/600', 'https://picsum.photos/id/232/800/600', 'https://picsum.photos/id/249/800/600']),
    },
    {
      unitNumber: "301",
      floor: 3,
      area: 120,
      bedrooms: 3,
      bathrooms: 2,
      kitchen: true,
      bathroom: true,
      livingDiningRoom: true,
      laundry: true,
      balcony: true,
      petFriendly: true,
      status: "VACANT",
      baseRent: 3500000,
      deposit: 3500000,
      description: "Apartamento completo con 3 habitaciones, sala-comedor, cocina, baño y área de lavado.",
      images: JSON.stringify(['https://picsum.photos/id/257/800/600', 'https://picsum.photos/id/265/800/600', 'https://picsum.photos/id/288/800/600']),
    },
    {
      unitNumber: "401",
      floor: 4,
      area: 18,
      bedrooms: 1,
      bathrooms: 0,
      sharedKitchen: true,
      sharedBathroom: true,
      sharedLaundry: true,
      status: "VACANT",
      baseRent: 650000,
      deposit: 650000,
      description: "Habitación en piso compartido.",
      images: JSON.stringify(['https://picsum.photos/id/299/800/600', 'https://picsum.photos/id/10/800/600', 'https://picsum.photos/id/13/800/600']),
    },
    {
      unitNumber: "402",
      floor: 4,
      area: 20,
      bedrooms: 1,
      bathrooms: 0,
      sharedKitchen: true,
      sharedBathroom: true,
      sharedLaundry: true,
      status: "VACANT",
      baseRent: 680000,
      deposit: 680000,
      description: "Habitación en piso compartido.",
      images: JSON.stringify(['https://picsum.photos/id/17/800/600', 'https://picsum.photos/id/18/800/600', 'https://picsum.photos/id/19/800/600']),
    },
    {
      unitNumber: "403",
      floor: 4,
      area: 19,
      bedrooms: 1,
      bathrooms: 0,
      sharedKitchen: true,
      sharedBathroom: true,
      sharedLaundry: true,
      status: "VACANT",
      baseRent: 670000,
      deposit: 670000,
      description: "Habitación en piso compartido.",
      images: JSON.stringify(['https://picsum.photos/id/20/800/600', 'https://picsum.photos/id/27/800/600', 'https://picsum.photos/id/28/800/600']),
    },
    {
      unitNumber: "404",
      floor: 4,
      area: 21,
      bedrooms: 1,
      bathrooms: 0,
      sharedKitchen: true,
      sharedBathroom: true,
      sharedLaundry: true,
      status: "VACANT",
      baseRent: 690000,
      deposit: 690000,
      description: "Habitación en piso compartido.",
      images: JSON.stringify(['https://picsum.photos/id/30/800/600', 'https://picsum.photos/id/42/800/600', 'https://picsum.photos/id/49/800/600']),
    },
    {
      unitNumber: "501",
      floor: 5,
      area: 85,
      bedrooms: 2,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      livingDiningRoom: true,
      balcony: true,
      status: "VACANT",
      baseRent: 2400000,
      deposit: 2400000,
      description: "Unidad con 2 habitaciones, sala-comedor, cocina y baño.",
      images: JSON.stringify(['https://picsum.photos/id/57/800/600', 'https://picsum.photos/id/78/800/600', 'https://picsum.photos/id/121/800/600']),
    },
    {
      unitNumber: "502",
      floor: 5,
      area: 55,
      bedrooms: 1,
      bathrooms: 1,
      kitchen: true,
      bathroom: true,
      status: "VACANT",
      baseRent: 1700000,
      deposit: 1700000,
      description: "Unidad con 1 habitación, cocina y baño.",
      images: JSON.stringify(['https://picsum.photos/id/122/800/600', 'https://picsum.photos/id/142/800/600', 'https://picsum.photos/id/193/800/600']),
    },
]

export const seedCasaTibabuyes = async () => {
  const admin = await prisma.admin.findFirst({
    where: { user: { email: 'admin1@propiedades.com' } },
  })
  if (!admin) {
    throw new Error('No existe admin1@propiedades.com. Ejecuta el seed principal primero.')
  }

  const data = {
      name: "Casa Tibabuyes",
      description: "Casa de 5 pisos con locales y unidades residenciales.",
      street: "Calle 137B",
      number: "105B-10",
      city: "Bogotá",
      neighborhood: "Tibabuyes",
      state: "Bogotá",
      postalCode: "00000",
      country: "Colombia",
      gpsCoordinates: "4.74097,-74.09929",
      propertyType: "BUILDING",
      status: "ACTIVE",
      images: JSON.stringify(['https://picsum.photos/id/214/800/600', 'https://picsum.photos/id/232/800/600', 'https://picsum.photos/id/249/800/600']),
      totalLandArea: 160,
      builtArea: 420,
      floors: 5,
      age: 8,
      district: "Suba",
      parking: 0,
      commonZones: JSON.stringify([{"name":"escaleras"},{"name":"cocina compartida piso 4"},{"name":"baño compartido piso 4"},{"name":"lavado compartido piso 4"}]),
      admins: { connect: [{ id: admin.id }] },
      units: { create: units },
  }

  const existing = await prisma.property.findUnique({ where: { id: PROPERTY_ID } })
  if (existing) {
    await prisma.unit.deleteMany({ where: { propertyId: PROPERTY_ID } })
    await prisma.property.update({ where: { id: PROPERTY_ID }, data })
    console.log('✅ tibabuyes actualizada (' + units.length + ' unidades).')
    return
  }
  await prisma.property.create({ data: { id: PROPERTY_ID, ...data } })
  console.log('✅ tibabuyes creada (' + units.length + ' unidades).')
}

if (process.argv[1]?.includes('seed-casa-tibabuyes')) {
  seedCasaTibabuyes()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
}
