#!/usr/bin/env node
// Corre un comando apuntando a la base de PRODUCCIÓN desde local.
// Lee PROD_DATABASE_URL del único .env y lo pone como DATABASE_URL para el hijo.
// Uso: node scripts/prod-db.mjs <cmd> [args...]
import 'dotenv/config'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join, delimiter } from 'node:path'

// node_modules/.bin al PATH para resolver prisma/next/tsx aunque se invoque fuera de pnpm.
const binDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'node_modules', '.bin')

const prod = process.env.PROD_DATABASE_URL
if (!prod) {
  console.error('⛔ PROD_DATABASE_URL no está definido en .env')
  process.exit(1)
}

const [cmd, ...args] = process.argv.slice(2)
if (!cmd) {
  console.error('uso: node scripts/prod-db.mjs <cmd> [args...]')
  process.exit(1)
}

console.warn(`🌐 Apuntando a PROD (${prod.split('://')[0]}://…) → ${cmd} ${args.join(' ')}`)

const child = spawn(cmd, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    PATH: `${binDir}${delimiter}${process.env.PATH ?? ''}`,
    DATABASE_URL: prod,
    PRISMA_DATABASE_URL: process.env.PROD_PRISMA_DATABASE_URL ?? '',
  },
})
child.on('exit', (code) => process.exit(code ?? 0))
