import blocksJson from '+/content/manual/manual.json'

// Identidad y versión vigente del manual. Subir MANUAL_VERSION obliga a todos a aceptar de nuevo.
export const MANUAL_CODE = 'MC-001'
export const MANUAL_VERSION = '1.0'
export const MANUAL_TITLE = 'Manual de Convivencia y Uso de Inmuebles Administrados'

export type ManualBlockType = 'tomo' | 'titulo' | 'capitulo' | 'articulo' | 'seccion' | 'p' | 'li' | 'term' | 'letra'
export type ManualBlock = { type: ManualBlockType; text: string }

export const manualBlocks = blocksJson as ManualBlock[]

export type ManualGroup = { id: string; title: string; blocks: ManualBlock[] }

// Agrupa por TOMO para el índice; lo anterior al primer tomo es "Disposiciones preliminares".
export const getManualGroups = (): ManualGroup[] => {
  const groups: ManualGroup[] = [{ id: 'preliminares', title: 'Disposiciones preliminares y definiciones', blocks: [] }]
  for (const block of manualBlocks) {
    if (block.type === 'tomo') {
      const [label, ...rest] = block.text.split(' · ')
      groups.push({ id: label.toLowerCase().replace(/\s+/g, '-'), title: `${label}: ${rest.join(' · ')}`, blocks: [] })
      continue
    }
    groups[groups.length - 1].blocks.push(block)
  }
  // El Tomo II del PDF no tiene contenido todavía: no se muestra vacío.
  return groups.filter((g) => g.blocks.length > 0)
}
