import { BasicInfo } from './types'

const isEmptyValue = (value: BasicInfo[keyof BasicInfo]) => {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  return false
}

export const pickBasicInfoUpdates = (current: BasicInfo, incoming: Partial<BasicInfo>): Partial<BasicInfo> => {
  type BasicInfoKey = keyof BasicInfo
  const updates: Partial<BasicInfo> = {}
  const keys = Object.keys(incoming) as BasicInfoKey[]

  keys.forEach((key) => {
    const value = incoming[key]
    if (value == null) return
    if (typeof value === 'string' && value.trim().length === 0) return
    if (isEmptyValue(current[key])) {
      Object.assign(updates, { [key]: value } as Partial<BasicInfo>)
    }
  })

  return updates
}
