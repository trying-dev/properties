'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import Header from '+/components/Header'
import { getProcessDetailsAction } from '+/actions/processes'
import type { ProcessDetail as ProcessDetailPayload } from '+/actions/processes'
import { getProcessReviewBundleAction } from '+/actions/application-review'
import type { ProcessReviewBundle } from '+/actions/application-review'
import ApplicationDetail from './_/ApplicationDetail'

type ProcessDetail = NonNullable<ProcessDetailPayload>

export default function AdminApplicationDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const processId = params?.id
  const [processDetail, setProcessDetail] = useState<ProcessDetail | null>(null)
  const [reviewBundle, setReviewBundle] = useState<ProcessReviewBundle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDetail = useCallback(
    async ({ showLoader = true }: { showLoader?: boolean } = {}) => {
      if (!processId) return
      if (showLoader) setIsLoading(true)
      setError(null)

      const [detailResult, bundleResult] = await Promise.all([
        getProcessDetailsAction(processId),
        getProcessReviewBundleAction(processId),
      ])

      if (!detailResult.success || !detailResult.data) {
        setError(detailResult.error ?? 'No se pudo cargar el detalle.')
        setIsLoading(false)
        return
      }

      setProcessDetail(detailResult.data as ProcessDetail)
      setReviewBundle(bundleResult.success && bundleResult.data ? (bundleResult.data as ProcessReviewBundle) : null)
      setIsLoading(false)
    },
    [processId]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos, mismo patrón que Modal.tsx
    void loadDetail()
  }, [loadDetail])

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
          <ApplicationDetail detail={processDetail} bundle={reviewBundle} onChanged={() => void loadDetail({ showLoader: false })} />
        ) : null}
      </main>
    </div>
  )
}
