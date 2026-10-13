import type { ReactNode } from 'react'
import PrintButton from './PrintButton'

type FormatSheetProps = {
  code: string
  title: string
  children: ReactNode
  signatures?: string[]
}

export const FormatField = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="border-b border-gray-300 pb-1">
    <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
    <p className="min-h-5 text-sm text-gray-900">{value === null || value === undefined || value === '' ? ' ' : value}</p>
  </div>
)

export const FormatBlock = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-6">
    <h2 className="mb-2 border-b border-gray-900 pb-1 text-xs font-bold uppercase tracking-wide text-gray-900">{title}</h2>
    {children}
  </section>
)

// Hoja imprimible. El navegador la guarda como PDF desde Imprimir.
export default function FormatSheet({ code, title, children, signatures = [] }: FormatSheetProps) {
  return (
    <div className="min-h-screen bg-gray-100 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-3xl justify-end print:hidden">
        <PrintButton />
      </div>
      <article className="mx-auto max-w-3xl bg-white p-10 shadow print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between border-b-2 border-gray-900 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Manual de Convivencia MC-001</p>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>
          <p className="rounded border border-gray-900 px-2 py-1 text-sm font-bold text-gray-900">{code}</p>
        </header>

        {children}

        {signatures.length > 0 && (
          <div className="mt-16 grid grid-cols-2 gap-10">
            {signatures.map((label) => (
              <div key={label} className="border-t border-gray-900 pt-1 text-center text-xs text-gray-700">
                {label}
              </div>
            ))}
          </div>
        )}

        <p className="mt-10 text-[10px] text-gray-400">Generado el {new Date().toLocaleDateString('es-CO')} desde la plataforma de administración.</p>
      </article>
    </div>
  )
}
