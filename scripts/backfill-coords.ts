/**
 * Completa Property.gpsCoordinates (vacío, "0,0" o ilegible) geocodificando la dirección.
 * Uso:  npm run geo:backfill            (solo muestra qué haría)
 *       npm run geo:backfill -- --write (guarda en la base de datos)
 */
import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import { geocodeAddress } from '../src/lib/geocode'
import { parseGpsCoordinates } from '../src/components/Map/geo'

const write = process.argv.includes('--write')
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const properties = await prisma.property.findMany({
    select: { id: true, name: true, street: true, number: true, neighborhood: true, city: true, state: true, country: true, gpsCoordinates: true },
  })
  for (const p of properties) {
    if (parseGpsCoordinates(p.gpsCoordinates)) continue
    const coords = await geocodeAddress(p)
    console.log(`${p.name}: ${p.gpsCoordinates ?? '(vacío)'} -> ${coords ?? 'no encontrada'}`)
    if (coords && write) await prisma.property.update({ where: { id: p.id }, data: { gpsCoordinates: coords } })
    await sleep(1100) // Nominatim: 1 req/s
  }
  if (!write) console.log('\nSimulación. Agrega --write para guardar.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
