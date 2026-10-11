import { seedAdminsFirstRound } from './seed-admins-first-round'
import { seedCasaFerias } from './seed-casa-ferias'
import { seedCasaGaitana } from './seed-casa-gaitana'
import { seedCasaPuertasDelSol } from './seed-casa-puertas-del-sol'
import { seedCasaPuertasDelSol2 } from './seed-casa-puertas-del-sol-2'
import { seedCasaTibabuyes } from './seed-casa-tibabuyes'
import { seedCasaTibabuyesModules } from './seed-casa-tibabuyes-modules'
import { seedCasaTibabuyesOwners } from './seed-casa-tibabuyes-owners'
import { seedCasaTibabuyesRentals } from './seed-casa-tibabuyes-rentals'
import { seedCasaVillaMaria } from './seed-casa-villa-maria'

export const runFirstCasesSeeds = async () => {
  await seedAdminsFirstRound()
  await seedCasaTibabuyes()
  await seedCasaTibabuyesOwners()
  await seedCasaTibabuyesRentals()
  await seedCasaTibabuyesModules()
  await seedCasaFerias()
  await seedCasaGaitana()
  await seedCasaPuertasDelSol()
  await seedCasaPuertasDelSol2()
  await seedCasaVillaMaria()
}

if (process.argv[1]?.includes('seed/first-cases/index.ts')) {
  runFirstCasesSeeds()
    .catch((error) => {
      console.error('❌ Error ejecutando seeds de first-cases:', error)
      process.exit(1)
    })
    .finally(async () => {
      const { prisma } = await import('+/lib/prisma')
      await prisma.$disconnect()
    })
}
