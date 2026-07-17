import { seedAdminsFirstRound } from './seed-admins-first-round'
import { seedCasaTibabuyes } from './seed-casa-tibabuyes'
import { seedCasaTibabuyesModules } from './seed-casa-tibabuyes-modules'
import { seedCasaTibabuyesOwners } from './seed-casa-tibabuyes-owners'
import { seedCasaTibabuyesRentals } from './seed-casa-tibabuyes-rentals'

export const runFirstCasesSeeds = async () => {
  await seedAdminsFirstRound()
  await seedCasaTibabuyes()
  await seedCasaTibabuyesOwners()
  await seedCasaTibabuyesRentals()
  await seedCasaTibabuyesModules()
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
