/**
 * Generador: data/<slug>.md  ->  seed-casa-<slug>.generated.ts
 *
 * Uso:  npx tsx scripts/gen-seed-from-md.ts <slug> [--write]
 *   sin --write  -> emite  seed-casa-<slug>.generated.ts  (seguro, no pisa el seed real)
 *   con  --write -> emite  seed-casa-<slug>.ts            (reemplaza el seed real)
 *
 * Es el puente del formato de texto (fuente de verdad) al seed de Prisma.
 */
import fs from 'node:fs'
import path from 'node:path'

const DATA_DIR = path.join(__dirname, '../prisma/seed/first-cases/data')
const OUT_DIR = path.join(__dirname, '../prisma/seed/first-cases')
const ADMIN_EMAIL = 'admin1@propiedades.com'

// ---- mapeos palabra -> modelo -------------------------------------------------
const TYPE: Record<string, string> = {
  CASA: 'HOUSE', EDIFICIO: 'BUILDING', APARTAMENTO: 'APARTMENT',
  LOCAL: 'COMMERCIAL_SPACE', OFICINA: 'OFFICE', LOTE: 'LAND',
}
const PSTATUS: Record<string, string> = {
  ACTIVA: 'ACTIVE', INACTIVA: 'INACTIVE', MANTENIMIENTO: 'MAINTENANCE', VENDIDA: 'SOLD',
}
const USTATUS: Record<string, string> = {
  LIBRE: 'VACANT', OCUPADA: 'OCCUPIED', RESERVADA: 'RESERVED',
  MANTENIMIENTO: 'MAINTENANCE', NO_DISPONIBLE: 'UNAVAILABLE',
}
const TIENE: Record<string, string> = {
  cocina: 'kitchen', baño: 'bathroom', bano: 'bathroom', 'sala-comedor': 'livingDiningRoom',
  sala: 'livingRoom', comedor: 'diningRoom', lavado: 'laundry', 'balcón': 'balcony',
  balcon: 'balcony', parqueo: 'parking', depósito: 'storage', deposito: 'storage',
}
const COMPARTE: Record<string, string> = {
  cocina: 'sharedKitchen', baño: 'sharedBathroom', bano: 'sharedBathroom',
  lavado: 'sharedLaundry', 'sala-comedor': 'sharedLivingDiningRoom',
}
const SERVICIOS: Record<string, string> = {
  internet: 'internet', tv: 'cableTV', agua: 'waterIncluded', gas: 'gasIncluded',
}

// ---- helpers de limpieza ------------------------------------------------------
const stripComment = (s: string) => s.replace(/\s{2,}#.*$/, '') // # de comentario = 2+ espacios antes
const clean = (v: string) =>
  stripComment(v).replace(/\(est[^)]*\)/gi, '').replace(/\[CONSULTAR\]/gi, '').trim()
const isEmpty = (v: string) => v === '' || v === '???' || v === '—' || v === '-' || /^\(.*\)$/.test(v)

const num = (v: string): number | undefined => {
  const c = clean(v)
  if (isEmpty(c)) return undefined
  const m = c.match(/[\d.,]+/)
  if (!m) return undefined
  let t = m[0]
  if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '') // 1.800.000 -> 1800000 (miles)
  else t = t.replace(/,/g, '.')
  const n = parseFloat(t)
  return Number.isNaN(n) ? undefined : n
}
const int = (v: string) => { const n = num(v); return n === undefined ? undefined : Math.round(n) }
const yesNo = (v: string) => /^(sí|si|yes|true|x)$/i.test(clean(v))
const list = (v: string) => {
  const c = clean(v)
  if (isEmpty(c)) return []
  return c.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean)
}

// ---- parseo del .md -----------------------------------------------------------
type KV = Record<string, string>
type Unit = KV
function parse(md: string): { prop: KV; units: Unit[] } {
  const lines = md.split('\n')
  const prop: KV = {}
  const units: Unit[] = []
  let section: 'none' | 'prop' | 'units' | 'end' = 'none'
  let cur: Unit | null = null

  const kv = (line: string): [string, string] | null => {
    const m = line.match(/^\s*-?\s*([A-Za-zñáéíóú_]+):\*?\s*(.*)$/)
    if (!m) return null
    return [m[1].trim(), m[2]]
  }

  for (const raw of lines) {
    const line = raw.replace(/\r$/, '')
    const t = line.trim()
    if (t.startsWith('>') || t.startsWith('---') || t === '') continue
    if (/^#/.test(t)) continue // comentario de línea completa (incluye opciones B)
    if (/^PROPIEDAD\b/.test(t)) { section = 'prop'; continue }
    if (/^UNIDADES\b/.test(t)) { section = 'units'; continue }
    if (/^PENDIENTES/.test(t)) { section = 'end'; break }
    if (section === 'end' || section === 'none') continue

    if (section === 'prop') {
      const p = kv(line); if (p) prop[p[0]] = p[1]
    } else if (section === 'units') {
      if (/^\s*-\s*codigo:/.test(line)) { cur = {}; units.push(cur) }
      const p = kv(line); if (p && cur) cur[p[0]] = p[1]
    }
  }
  return { prop, units }
}

// ---- construcción de objetos --------------------------------------------------
const images = (seed: string) =>
  `JSON.stringify([${[1, 2, 3].map((i) => `'https://picsum.photos/seed/${seed}${i}/800/600'`).join(', ')}])`

function buildUnit(u: Unit): string {
  const code = clean(u['codigo'] || '')
  const o: string[] = []
  const put = (k: string, v: unknown) => { if (v !== undefined) o.push(`      ${k}: ${v},`) }
  const str = (k: string, raw?: string) => { const c = raw === undefined ? undefined : clean(raw); if (c && !isEmpty(c)) put(k, JSON.stringify(c)) }

  put('unitNumber', JSON.stringify(code))
  str('internalCode', u['codigo_interno'])
  put('floor', int(u['piso'] || ''))
  put('area', num(u['area'] || ''))
  put('privateArea', num(u['area_privada'] || ''))
  put('commonArea', num(u['area_comun'] || ''))
  put('bedrooms', int(u['habitaciones'] || '0') ?? 0)
  put('bathrooms', num(u['baños'] || u['banos'] || '0') ?? 0)

  for (const tok of list(u['tiene'] || '')) if (TIENE[tok]) put(TIENE[tok], true)
  for (const tok of list(u['comparte'] || '')) if (COMPARTE[tok]) put(COMPARTE[tok], true)
  for (const tok of list(u['servicios_incluidos'] || '')) if (SERVICIOS[tok]) put(SERVICIOS[tok], true)

  if (yesNo(u['amoblado'] || '')) put('furnished', true)
  if (yesNo(u['mascotas'] || '')) put('petFriendly', true)
  if (yesNo(u['fumar'] || '')) put('smokingAllowed', true)

  put('status', JSON.stringify(USTATUS[clean(u['estado'] || 'LIBRE')] || 'VACANT'))
  const rent = num(u['renta'] || '')
  put('baseRent', rent)
  put('deposit', num(u['deposito'] || '') ?? rent) // depósito por defecto = 1 mes
  str('description', u['descripcion'])
  const dest = u['destacados'] ? clean(u['destacados']) : ''
  if (dest && !isEmpty(dest)) put('highlights', `JSON.stringify(${JSON.stringify(dest.split(',').map((s) => s.trim()))})`)
  put('images', images(code.toLowerCase().replace(/[^a-z0-9]/g, '')))
  return `    {\n${o.join('\n')}\n    },`
}

function build(slug: string, prop: KV, units: Unit[]): string {
  const id = `case-casa-${slug}`
  const d: string[] = []
  const put = (k: string, v: unknown) => { if (v !== undefined) d.push(`      ${k}: ${v},`) }
  const str = (k: string, raw?: string) => { const c = raw === undefined ? undefined : clean(raw); if (c && !isEmpty(c)) put(k, JSON.stringify(c)) }

  const [street, number] = (clean(prop['direccion'] || '').split('#').map((s) => s.trim()))
  str('name', prop['nombre'])
  str('description', prop['descripcion'])
  put('street', JSON.stringify(street || ''))
  put('number', JSON.stringify(number || ''))
  put('city', JSON.stringify(clean(prop['ciudad'] || 'Bogotá')))
  put('neighborhood', JSON.stringify(isEmpty(clean(prop['barrio'] || '')) ? '' : clean(prop['barrio'])))
  put('state', JSON.stringify(clean(prop['departamento'] || 'Bogotá')))
  put('postalCode', JSON.stringify(isEmpty(clean(prop['codigo_postal'] || '')) ? '00000' : clean(prop['codigo_postal'])))
  put('country', JSON.stringify(clean(prop['pais'] || 'Colombia')))
  str('gpsCoordinates', prop['gps'])
  put('propertyType', JSON.stringify(TYPE[clean(prop['tipo'] || '')] || 'HOUSE'))
  put('status', JSON.stringify(PSTATUS[clean(prop['estado'] || 'ACTIVA')] || 'ACTIVE'))
  put('totalLandArea', num(prop['area_lote'] || ''))
  put('builtArea', num(prop['area_construida'] || '') ?? 0)
  put('floors', int(prop['pisos'] || '1') ?? 1)
  put('age', int(prop['edad'] || '0') ?? 0)
  put('stratum', int(prop['estrato'] || ''))
  str('district', prop['localidad'])
  put('constructionYear', int(prop['año_construccion'] || prop['ano_construccion'] || ''))
  put('commercialValue', num(prop['valor_comercial'] || ''))
  put('cadastralValue', num(prop['valor_catastral'] || ''))
  str('structuralMaterial', prop['material'])
  str('complex', prop['conjunto'])
  str('building', prop['edificio'])
  str('yardOrGarden', prop['patio_jardin'])
  put('parking', int(prop['parqueaderos'] || '0') ?? 0)
  str('parkingLocation', prop['ubicacion_parqueo'])
  str('balconiesAndTerraces', prop['balcones_terrazas'])
  str('recreationalAreas', prop['areas_recreativas'])
  const zonas = list(prop['zonas_comunes'] || '')
  if (zonas.length) put('commonZones', `JSON.stringify(${JSON.stringify(zonas.map((z) => ({ name: z })))})`)

  const unitsSrc = units.filter((u) => !isEmpty(clean(u['codigo'] || ''))).map(buildUnit).join('\n')
  const fn = `seedCasa${slug.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('')}`

  return `// GENERADO por scripts/gen-seed-from-md.ts desde data/${slug}.md — no editar a mano.
import { prisma } from '+/lib/prisma'

const PROPERTY_ID = '${id}'

const units = [
${unitsSrc}
]

export const ${fn} = async () => {
  const admin = await prisma.admin.findFirst({
    where: { user: { email: '${ADMIN_EMAIL}' } },
  })
  if (!admin) {
    throw new Error('No existe ${ADMIN_EMAIL}. Ejecuta el seed principal primero.')
  }

  const data = {
${d.join('\n')}
      admins: { connect: [{ id: admin.id }] },
      units: { create: units },
  }

  const existing = await prisma.property.findUnique({ where: { id: PROPERTY_ID } })
  if (existing) {
    await prisma.unit.deleteMany({ where: { propertyId: PROPERTY_ID } })
    await prisma.property.update({ where: { id: PROPERTY_ID }, data })
    console.log('✅ ${slug} actualizada (' + units.length + ' unidades).')
    return
  }
  await prisma.property.create({ data: { id: PROPERTY_ID, ...data } })
  console.log('✅ ${slug} creada (' + units.length + ' unidades).')
}

if (process.argv[1]?.includes('seed-casa-${slug}')) {
  ${fn}()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
}
`
}

// ---- main ---------------------------------------------------------------------
const slug = process.argv[2]
const write = process.argv.includes('--write')
if (!slug) { console.error('Uso: npx tsx scripts/gen-seed-from-md.ts <slug> [--write]'); process.exit(1) }

const mdPath = path.join(DATA_DIR, `${slug}.md`)
if (!fs.existsSync(mdPath)) { console.error(`No existe ${mdPath}`); process.exit(1) }

const { prop, units } = parse(fs.readFileSync(mdPath, 'utf8'))
const out = build(slug, prop, units)
const outPath = path.join(OUT_DIR, write ? `seed-casa-${slug}.ts` : `seed-casa-${slug}.generated.ts`)
fs.writeFileSync(outPath, out)
console.log(`Generado ${path.relative(process.cwd(), outPath)}  (${units.filter((u) => !isEmpty(clean(u['codigo'] || ''))).length} unidades)`)
