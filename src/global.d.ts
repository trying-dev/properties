import type * as React from 'react'

declare global {
  type InputChangeEvent = React.ChangeEvent<HTMLInputElement>
  type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>
  type ButtonMouseEvent = React.MouseEvent<HTMLButtonElement>
}

export {}
