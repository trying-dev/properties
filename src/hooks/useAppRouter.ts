import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

type SafePushOptions = {
  replace?: boolean
  fallbackDelayMs?: number
}

const getHrefKey = (href: string) => {
  if (typeof window === 'undefined') return href
  try {
    const url = new URL(href, window.location.origin)
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return href
  }
}

export const useAppRouter = () => {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const push = (href: string, options: SafePushOptions = {}) => {
    const { replace = false, fallbackDelayMs = 500 } = options

    startTransition(() => {
      if (replace) {
        router.replace(href)
        return
      }
      router.push(href)
    })

    if (typeof window === 'undefined') return
    const targetKey = getHrefKey(href)
    window.setTimeout(() => {
      const currentKey = getHrefKey(window.location.href)
      if (currentKey !== targetKey) {
        window.location.assign(href)
      }
    }, fallbackDelayMs)
  }

  return push
}
