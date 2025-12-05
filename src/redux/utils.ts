/* eslint-disable @typescript-eslint/no-explicit-any */
export const serialize = (data: any): any =>
  JSON.parse(JSON.stringify(data, (key, value) => (value instanceof Date ? value.toISOString() : value)))

export const deserialize = (data: any): any =>
  JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (typeof value === 'string' && !isNaN(Date.parse(value))) {
        return new Date(value)
      }
      return value
    })
  )
