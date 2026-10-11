'use client'

import type { LucideIcon } from 'lucide-react'

export type ViewModeOption<T extends string> = {
  mode: T
  label: string
  Icon: LucideIcon
}

type ViewModeToggleProps<T extends string> = {
  value: T
  options: ViewModeOption<T>[]
  onChange: (mode: T) => void
}

export default function ViewModeToggle<T extends string>({ value, options, onChange }: ViewModeToggleProps<T>) {
  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label="Tipo de vista">
      {options.map(({ mode, label, Icon }) => {
        const isActive = value === mode

        return (
          <button
            key={mode}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            title={label}
            onClick={() => onChange(mode)}
            className={`rounded-md p-2 transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.75 : 1.5} />
          </button>
        )
      })}
    </div>
  )
}
