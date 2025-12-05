/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs')
const path = require('path')

const provider = process.env.DB_PROVIDER || 'sqlite'
const templateContent = `generator client {
    provider      = "prisma-client-js"
    binaryTargets = ["native"]
}

datasource db {
    provider = "${provider}"
    url      = env("DATABASE_URL")
}
`

const schemaPath = path.join(__dirname, '../prisma/schema.prisma')

console.log(`🔧 Generando schema.prisma con provider: ${provider}`)

try {
  // Eliminar schema existente y crear nuevo
  if (fs.existsSync(schemaPath)) {
    fs.unlinkSync(schemaPath)
  }

  fs.writeFileSync(schemaPath, templateContent)

  console.log(`✅ Schema generado para ${provider.toUpperCase()}`)
} catch (error) {
  console.error('❌ Error generando schema:', error.message)
  process.exit(1)
}
