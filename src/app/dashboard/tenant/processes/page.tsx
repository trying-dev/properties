'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Header from '+/components/Header'
import Footer from '+/components/Footer'
import { getProcessAction, getTenantProcessesAction } from '+/actions/processes'
import { getUserTenant } from '+/actions/user'
import { useSession } from '+/hooks/useSession'
import { useDispatch } from '+/redux'
import { setProcessState } from '+/redux/slices/process'
import { BasicInfo, ProfileId } from '+/app/aplication/_/types'
import { pickBasicInfoUpdates } from '+/app/aplication/_/basicInfoUtils'

type ProcessListItem = {
  id: string
  status: string
  currentStep: number | null
  updatedAt: string | Date
  unitId: string | null
}

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

export default function TenantProcessesPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading } = useSession()
  const [processes, setProcesses] = useState<ProcessListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [tenantProfile, setTenantProfile] = useState<ProfileId | ''>('')
  const [tenantBasicInfo, setTenantBasicInfo] = useState<BasicInfo | null>(null)

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

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      OPEN: { label: 'Abierto', className: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { label: 'En progreso', className: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { label: 'Completado', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
    }
    const data = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${data.className}`}>{data.label}</span>
    )
  }

  const getStatusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle className="w-4 h-4 text-green-600" />
    if (status === 'CANCELLED') return <XCircle className="w-4 h-4 text-red-600" />
    if (status === 'IN_PROGRESS') return <Clock className="w-4 h-4 text-yellow-600" />
    return <Clock className="w-4 h-4 text-blue-600" />
  }

  const resolveNextRoute = (step: number | null, profile?: ProfileId | '') => {
    if (!profile) return '/aplication/profile'
    if (step && step >= 4) return '/aplication/security'
    if (step && step >= 3) return '/aplication/complementInfo'
    return '/aplication/basicInformation'
  }

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
      : tenantBasicInfo ?? undefined
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

    if (typeof window !== 'undefined') {
      localStorage.setItem('applicationProcessId', result.data.id)
      if (result.data.tenantId ?? tenantId) {
        localStorage.setItem('selectedTenantId', (result.data.tenantId ?? tenantId) as string)
      }
      if (result.data.unitId) localStorage.setItem('np:selectedUnitId', result.data.unitId)
    }

    const nextRoute = resolveNextRoute(result.data.currentStep, resolvedProfile)
    router.push(nextRoute)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard/tenant')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
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
              <button
                key={process.id}
                className="border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 hover:shadow-sm transition"
                onClick={() => {
                  void resumeProcess(process.id)
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(process.status)}
                    <span className="text-sm text-gray-800 font-medium">
                      Proceso #{process.id.slice(0, 6)}
                    </span>
                  </div>
                  {statusBadge(process.status)}
                </div>
                <p className="text-sm text-gray-600">Paso actual: {process.currentStep}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Última actualización: {new Date(process.updatedAt).toLocaleDateString('es-CO')}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
