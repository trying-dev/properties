import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

const getSchemaPath = (): string => {
  const databaseUrl = process.env.DATABASE_URL?.toLowerCase()

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined')
  }

  if (databaseUrl.startsWith('postgres')) {
    return './prisma/schema.postgresql.prisma'
  }

  return './prisma/schema.sqlite.prisma'
}

export default defineConfig({
  schema: getSchemaPath(),
  datasource: { url: env('DATABASE_URL') },
})
