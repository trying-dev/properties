// Retorno tras el login: cuando alguien llega a una ruta protegida sin sesión (p. ej. desde un
// correo), se guarda a dónde quería ir y, al iniciar sesión, se le lleva ahí en vez de al inicio.
// Solo rutas internas: nunca se acepta una URL externa (open redirect).

const STORAGE_KEY = 'postLoginRedirect'
const MAX_AGE_MS = 15 * 60 * 1000
const ALLOWED_PREFIXES = ['/dashboard', '/process']

export const sanitizeNext = (value: string | null | undefined): string | null => {
  if (!value) return null
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null
  const path = value.split('?')[0].split('#')[0]
  const allowed = ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
  return allowed ? value : null
}

// URL del inicio con el modal de login abierto y el destino codificado.
export const buildLoginUrl = (nextPath: string) => {
  const next = sanitizeNext(nextPath)
  return next ? `/?login=1&next=${encodeURIComponent(next)}` : '/?login=1'
}

export const storePostLoginRedirect = (nextPath: string | null) => {
  const next = sanitizeNext(nextPath)
  if (!next) return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ path: next, at: Date.now() }))
  } catch {
    // sessionStorage no disponible: se usa el destino por rol.
  }
}

// Solo lee. Se limpia al llegar al dashboard (clearPostLoginRedirect) para tolerar
// que el efecto del formulario corra dos veces.
export const peekPostLoginRedirect = (): string | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { path?: string; at?: number }
    if (!parsed.at || Date.now() - parsed.at > MAX_AGE_MS) return null
    return sanitizeNext(parsed.path)
  } catch {
    return null
  }
}

export const clearPostLoginRedirect = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // nada que limpiar
  }
}
