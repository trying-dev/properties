'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, ArrowLeft } from 'lucide-react'

import { useDispatch } from '+/redux'

import Header from '+/components/Header'
import Footer from '+/components/Footer'

import { deleteTenantProcessAction, getProcessAction, getTenantProcessesAction } from '+/actions/processes'
import type { TenantProcessItem } from '+/actions/processes'

import { setProcessState } from '+/redux/slices/process'

import { getUserTenant } from '+/actions/user'

import { useSession } from '+/hooks/useSession'

import { BasicInfo, ProfileId } from '+/app/process/_/types'
import { pickBasicInfoUpdates } from '+/app/process/_/basicInfoUtils'

import CardProcess from './_/CardProcess'
import ProcessReviewModal, { type ProcessPayload } from './_/ProcessReviewModal'

type UserTenantResult = Awaited<ReturnType<typeof getUserTenant>>

const normalizeBirthDate = (value?: string | Date | null) => {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return value.toISOString().slice(0, 10)
}

const buildBasicInfoFromUser = (user: UserTenantResult): BasicInfo | null => {
  if (!user) return null
  return {
    name: user.name ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    birthDate: normalizeBirthDate(user.birthDate),
    birthPlace: user.birthPlace ?? '',
    documentType: (user.documentType ?? undefined) as BasicInfo['documentType'],
    documentNumber: user.documentNumber ?? '',
    gender: (user.gender ?? undefined) as BasicInfo['gender'],
    maritalStatus: (user.maritalStatus ?? undefined) as BasicInfo['maritalStatus'],
    profession: user.profession ?? '',
    monthlyIncome: user.monthlyIncome != null ? String(user.monthlyIncome) : '',
  }
}

const resolveNextRoute = (step: number | null, profile?: ProfileId | '') => {
  if (!profile) return '/process/profile'
  if (step && step >= 4) return '/process/security'
  if (step && step >= 3) return '/process/complementInfo'
  return '/process/basicInformation'
}

const canResumeFromStatus = (status: string) => status === 'IN_PROGRESS' || status === 'WAITING_FOR_FEEDBACK'
const canDeleteFromStatus = (status: string) => status === 'IN_PROGRESS'

export default function TenantProcessesPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading } = useSession()
  const [processes, setProcesses] = useState<TenantProcessItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [tenantProfile, setTenantProfile] = useState<ProfileId | ''>('')
  const [tenantBasicInfo, setTenantBasicInfo] = useState<BasicInfo | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [reviewProcess, setReviewProcess] = useState<TenantProcessItem | null>(null)
  const [reviewPayload, setReviewPayload] = useState<ProcessPayload | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isReviewLoading, setIsReviewLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    const load = async () => {
      setLoading(true)
      const user = await getUserTenant()
      const userTenantId = user?.tenant?.id ?? null
      const userTenantProfile = (user?.tenant?.profile ?? '') as ProfileId | ''
      const userBasicInfo = buildBasicInfoFromUser(user)
      setTenantId(userTenantId)
      setTenantProfile(userTenantProfile)
      setTenantBasicInfo(userBasicInfo)
      if (!userTenantId) {
        setProcesses([])
        setLoading(false)
        return
      }
      const result = await getTenantProcessesAction(userTenantId)
      if (result.success && result.data) {
        setProcesses(result.data)
      }
      setLoading(false)
    }
    load()
  }, [isAuthenticated])

  const resumeProcess = async (processId: string) => {
    const result = await getProcessAction(processId)
    if (!result.success || !result.data) {
      console.error('No se pudo cargar el proceso', result.error)
      return
    }

    const payload = (result.data.payload ?? {}) as {
      basicInfo?: BasicInfo
      profile?: ProfileId
    }

    const resolvedProfile = payload.profile ?? tenantProfile ?? ''
    const resolvedBasicInfo = payload.basicInfo
      ? {
          ...payload.basicInfo,
          ...(tenantBasicInfo ? pickBasicInfoUpdates(payload.basicInfo, tenantBasicInfo) : {}),
        }
      : (tenantBasicInfo ?? undefined)

    const nextState = {
      processId: result.data.id,
      tenantId: result.data.tenantId ?? tenantId,
      unitId: result.data.unitId ?? null,
      step: result.data.currentStep ?? 1,
      profile: resolvedProfile,
    }

    if (resolvedBasicInfo) {
      Object.assign(nextState, { basicInfo: resolvedBasicInfo })
    }

    dispatch(setProcessState(nextState))

    const nextRoute = resolveNextRoute(result.data.currentStep, resolvedProfile)
    router.push(nextRoute)
  }

  const handleDeleteProcess = async (processId: string) => {
    if (!tenantId) return
    const result = await deleteTenantProcessAction(processId, tenantId)
    if (!result.success) {
      console.error('No se pudo eliminar el proceso', result.error)
      return
    }
    setProcesses((prev) => prev.filter((process) => process.id !== processId))
    setDeleteConfirmId((current) => (current === processId ? null : current))
  }

  const onResumeProcess = (processId: string) => () => {
    void resumeProcess(processId)
  }

  const onConfirmDeleteProcess = (processId: string) => () => {
    void handleDeleteProcess(processId)
  }

  const onStartDeleteProcess = (processId: string) => () => {
    setDeleteConfirmId(processId)
  }

  const onCancelDeleteProcess = () => {
    setDeleteConfirmId(null)
  }

  const openReview = async (process: TenantProcessItem) => {
    setReviewProcess(process)
    setReviewPayload(null)
    setIsReviewOpen(true)
    setIsReviewLoading(true)
    const result = await getProcessAction(process.id)
    if (result.success && result.data) {
      setReviewPayload((result.data.payload ?? {}) as ProcessPayload)
    }
    setIsReviewLoading(false)
  }

  const closeReview = () => {
    setIsReviewOpen(false)
    setReviewProcess(null)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => router.push('/dashboard/tenant')} className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Mis Procesos</h1>
        </div>

        {loading || isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando procesos...</p>
          </div>
        ) : processes.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes procesos abiertos</h2>
            <p className="text-gray-600">Cuando inicies un proceso, aparecerá aquí para que lo retomes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processes.map((process) => (
              <CardProcess
                key={process.id}
                process={process}
                canResume={canResumeFromStatus(process.status)}
                deleteConfirmId={deleteConfirmId}
                onResume={onResumeProcess(process.id)}
                onView={() => openReview(process)}
                canDelete={canDeleteFromStatus(process.status)}
                onConfirmDelete={onConfirmDeleteProcess(process.id)}
                onStartDelete={onStartDeleteProcess(process.id)}
                onCancelDelete={onCancelDeleteProcess}
              />
            ))}
          </div>
        )}
      </main>

      <ProcessReviewModal
        isOpen={isReviewOpen}
        onClose={closeReview}
        process={reviewProcess}
        payload={reviewPayload}
        isLoading={isReviewLoading}
      />

      <Footer />
    </div>
  )
}
