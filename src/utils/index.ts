export const capitalize = (text: string | null | undefined) => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const serializeDate = (value?: Date | null) => {
  if (!value) return null
  return value.toISOString()
}
