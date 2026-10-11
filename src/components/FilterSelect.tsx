import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'

type FilterSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
  label: string
}

export default function FilterSelect({ label, children, ...props }: FilterSelectProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      <span className="relative block">
        <select
          {...props}
          className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3.5 pr-10 text-sm text-gray-900 shadow-sm transition hover:border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </span>
    </label>
  )
}
