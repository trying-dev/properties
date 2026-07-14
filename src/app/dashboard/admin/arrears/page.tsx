'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

import Header from '+/components/Header'
import { getArrearsReport, type ArrearsReport } from '+/actions/arrears'

const formatMoney = (value?: number | null) => (value == null ? '-' : `$${value.toLocaleString('es-CO')}`)
const formatDate = (value?: Date | string | null) => (value ? new Date(value).toLocaleDateString('es-CO') : '-')

// Severidad por días de atraso: leve <30, medio <60, grave 60+.
const daysStyle = (days: number) =>
  days >= 60 ? 'bg-red-100 text-red-700' : days >= 30 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'

export default function AdminArrearsPage() {
  const [data, setData] = useState<ArrearsReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setData(await getArrearsReport())
      } catch (err) {
        console.error('Error loading arrears:', err)
        setError('No se pudo cargar la cartera')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Cartera / mora</h1>
        <p className="text-sm text-gray-500 mb-6">
          Cuotas vencidas e impagas por contrato. Se calcula sobre los pagos vencidos; no es una tabla separada.
        </p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {isLoading ? (
          <p className="text-gray-500">Cargando…</p>
        ) : !data || data.rows.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin cartera vencida. Todos los contratos al día. 🎉</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Total vencido</p>
                <p className="text-2xl font-bold text-red-600">{formatMoney(data.totalOverdue)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Recargos por mora</p>
                <p className="text-2xl font-bold text-gray-900">{formatMoney(data.totalLateFees)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Contratos en mora</p>
                <p className="text-2xl font-bold text-gray-900">{data.contractsInArrears}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                    <th className="py-3 px-4">Inquilino</th>
                    <th className="py-3 px-4">Unidad</th>
                    <th className="py-3 px-4">Cuotas</th>
                    <th className="py-3 px-4">Vencido</th>
                    <th className="py-3 px-4">Recargos</th>
                    <th className="py-3 px-4">Más antigua</th>
                    <th className="py-3 px-4">Atraso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.rows.map((r) => (
                    <tr key={r.contractId} className="text-gray-700">
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900">{r.tenantName}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {r.property} · {r.unitNumber}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{r.overdueCount}</td>
                      <td className="py-3 px-4 whitespace-nowrap font-semibold text-red-600">{formatMoney(r.totalOverdue)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{formatMoney(r.lateFees)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{formatDate(r.oldestDueDate)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${daysStyle(r.daysOverdue)}`}>
                          <AlertTriangle className="h-3 w-3" />
                          {r.daysOverdue} d
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
