'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, FileText } from 'lucide-react'

import Header from '+/components/Header'
import { getProcessDetailsAction } from '+/actions/processes'

type ProcessDetail = {
  id: string
  status: string
  currentStep: number
  createdAt: string
  updatedAt: string
  payload: unknown
  tenant: {
    id: string
    user: { name: string | null; lastName: string | null; email: string | null; phone: string | null }
  } | null
  unit: {
    id: string
    unitNumber: string
    property: { id: string; name: string; city: string }
  } | null
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleString('es-MX')
}

export default function AdminApplicationDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [processDetail, setProcessDetail] = useState<ProcessDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processId = params?.id
    if (!processId) {
      setError('No se encontro el proceso.')
      setIsLoading(false)
      return
    }

    const loadDetail = async () => {
      setIsLoading(true)
      setError(null)
      const result = await getProcessDetailsAction(processId)
      if (!result.success || !result.data) {
        setError(result.error ?? 'No se pudo cargar el detalle.')
        setIsLoading(false)
        return
      }
      setProcessDetail(result.data as ProcessDetail)
      setIsLoading(false)
    }

    void loadDetail()
  }, [params])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <button
          onClick={() => router.push('/dashboard/admin/applications')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a aplicaciones
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando detalle...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : processDetail ? (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Detalle de aplicacion</h1>
                  <p className="text-sm text-gray-500">ID: {processDetail.id}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Paso {processDetail.currentStep}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Estado</p>
                  <p className="text-sm font-semibold text-gray-900">{processDetail.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ultima actualizacion</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(processDetail.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Creado</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(processDetail.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Inquilino</h2>
                {processDetail.tenant ? (
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-semibold">Nombre:</span>{' '}
                      {[processDetail.tenant.user.name, processDetail.tenant.user.lastName].filter(Boolean).join(' ') ||
                        processDetail.tenant.user.email ||
                        '-'}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span> {processDetail.tenant.user.email || '-'}
                    </p>
                    <p>
                      <span className="font-semibold">Telefono:</span> {processDetail.tenant.user.phone || '-'}
                    </p>
                    <p>
                      <span className="font-semibold">Tenant ID:</span> {processDetail.tenant.id}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Sin inquilino asociado.</p>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Unidad</h2>
                {processDetail.unit ? (
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-semibold">Propiedad:</span> {processDetail.unit.property.name}
                    </p>
                    <p>
                      <span className="font-semibold">Ciudad:</span> {processDetail.unit.property.city}
                    </p>
                    <p>
                      <span className="font-semibold">Unidad:</span> {processDetail.unit.unitNumber}
                    </p>
                    <p>
                      <span className="font-semibold">Unit ID:</span> {processDetail.unit.id}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Sin unidad asociada.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Payload completo</h2>
              </div>
              <pre className="overflow-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-700">
                {JSON.stringify(processDetail.payload ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
