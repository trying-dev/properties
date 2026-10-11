'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import Header from '+/components/Header'
import { getManualAcceptanceReportAction } from '+/actions/manual'

type Row = { tenantId: string; name: string; email: string; acceptedAt: Date | null }

export default function AdminManualPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [version, setVersion] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const res = await getManualAcceptanceReportAction()
      if (res.success && res.data) {
        setRows(res.data.rows)
        setVersion(res.data.version)
      } else setError(res.error ?? 'No se pudo cargar el reporte')
      setLoading(false)
    }
    load()
  }, [])

  const accepted = rows.filter((r) => r.acceptedAt).length

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/dashboard/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Aceptación del manual</h1>
        <p className="mt-2 text-gray-600">
          Versión {version || '…'} ·{' '}
          <Link href="/manual" className="underline">
            ver manual
          </Link>
        </p>

        {loading && <p className="mt-8 text-gray-600">Cargando…</p>}
        {error && <p className="mt-8 text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <p className="mt-6 text-sm text-gray-700">
              {accepted} de {rows.length} inquilinos han aceptado esta versión.
            </p>
            <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Inquilino</th>
                    <th className="px-4 py-3 font-medium">Correo</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.tenantId} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-900">{r.name}</td>
                      <td className="px-4 py-3 text-gray-600">{r.email}</td>
                      <td className="px-4 py-3">
                        {r.acceptedAt ? (
                          <span className="text-green-700">Aceptó el {new Date(r.acceptedAt).toLocaleDateString('es-CO')}</span>
                        ) : (
                          <span className="text-amber-700">Pendiente</span>
                        )}
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
