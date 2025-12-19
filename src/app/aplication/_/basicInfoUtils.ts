import { BasicInfo } from './types'

const isEmptyValue = (value: BasicInfo[keyof BasicInfo]) => {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  return false
}

export const pickBasicInfoUpdates = (current: BasicInfo, incoming: Partial<BasicInfo>) => {
  const updates: Partial<BasicInfo> = {}
  const entries = Object.entries(incoming) as [keyof BasicInfo, BasicInfo[keyof BasicInfo]][]

  entries.forEach(([key, value]) => {
    if (value == null) return
    if (typeof value === 'string' && value.trim().length === 0) return
    if (isEmptyValue(current[key])) {
      updates[key] = value
    }
  })

  return updates
}
