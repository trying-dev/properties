// Helpers puros de ocupación (sin 'use server' → exports síncronos permitidos).
// Fuente de verdad = Unit.status. Acá se agrega a nivel propiedad.

export type PropertyOccupancy = 'VACANT' | 'PARTIAL' | 'OCCUPIED' | 'NONE'

// VACANT  = todas las unidades libres
// PARTIAL = algunas libres, otras no (típico edificio)
// OCCUPIED= ninguna libre
// NONE    = propiedad sin unidades
export const deriveOccupancy = (totalUnits: number, vacantUnits: number): PropertyOccupancy => {
  if (totalUnits === 0) return 'NONE'
  if (vacantUnits === 0) return 'OCCUPIED'
  if (vacantUnits >= totalUnits) return 'VACANT'
  return 'PARTIAL'
}
