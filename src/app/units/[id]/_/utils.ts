export const formatPrice = (amount?: number | null) =>
  amount != null ? `${new Intl.NumberFormat('de-DE').format(amount)} €` : 'Precio a consultar'

export const formatArea = (area?: number | null) => (area ? `${area} m²` : 'N/D')

export const parseImages = (images?: string | null): string[] => {
  if (!images) return []
  try {
    return JSON.parse(images) as string[]
  } catch {
    return []
  }
}
