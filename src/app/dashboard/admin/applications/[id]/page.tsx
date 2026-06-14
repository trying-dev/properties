'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import Header from '+/components/Header'
import { getProcessDetailsAction } from '+/actions/processes'
import type { ProcessDetail as ProcessDetailPayload } from '+/actions/processes'
import ApplicationDetail from './_/ApplicationDetail'

type ProcessDetail = NonNullable<ProcessDetailPayload>

export default function AdminApplicationDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const processId = params?.id
  const [processDetail, setProcessDetail] = useState<ProcessDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!processId) return

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
  }, [processId])

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

        {!processId ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">No se encontro el proceso.</div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando detalle...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : processDetail ? (
          <ApplicationDetail detail={processDetail} />
        ) : null}
      </main>
    </div>
  )
}
