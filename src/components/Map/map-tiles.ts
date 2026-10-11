/**
 * Fuente de tiles. Por defecto usa el servidor público de OpenStreetMap (válido para desarrollo;
 * en producción define NEXT_PUBLIC_MAP_TILE_URL y NEXT_PUBLIC_MAP_ATTRIBUTION con un proveedor propio).
 */
export const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
