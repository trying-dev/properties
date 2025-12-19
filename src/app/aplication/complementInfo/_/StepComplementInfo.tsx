'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react'

import { useDispatch, useSelector } from '+/redux'
import { setProcessState, setUploadedDocs, updateBasicInfo } from '+/redux/slices/process'

import { mockDataByProfile } from '../../_/mockData'
import { profiles } from '../../_/profiles'
import { pickBasicInfoUpdates } from '../../_/basicInfoUtils'
import { UploadedDocsState } from '../../_/types'
import { DepositConfirmation, DocumentsSection } from '../../_/ApplicantInfoSections'

const createMockFile = (fileName: string) => new File([''], fileName, { type: 'application/pdf' })

const StepComplementInfo = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const processState = useSelector((state) => state.process)
  const { basicInfo, acceptedDeposit, profile, selectedSecurity, uploadedDocs } = processState

  const hasBasicInfo = useMemo(() => {
    return Boolean(
      basicInfo.name.trim() &&
      basicInfo.lastName.trim() &&
      basicInfo.monthlyIncome.trim()
    )
  }, [basicInfo])

  useEffect(() => {
    if (processState.step === 3) return
    dispatch(setProcessState({ step: 3 }))
  }, [dispatch, processState.step])

  useEffect(() => {
    if (!profile) {
      router.replace('/aplication/profile')
      return
    }
    if (!hasBasicInfo) {
      router.replace('/aplication/basicInformation')
    }
  }, [hasBasicInfo, router, profile])

  const handleFileChange = (fieldId: string, files: FileList | null) => {
    if (!files) return
    dispatch(setUploadedDocs({ [fieldId]: files }))
  }

  const handleAcceptDepositChange = (accepted: boolean) => {
    dispatch(setProcessState({ acceptedDeposit: accepted }))
  }

  const handleBack = () => {
    router.push('/aplication/basicInformation')
  }

  const handleNext = () => {
    dispatch(
      setProcessState({
        basicInfo,
        profile: profile,
        selectedSecurity,
        acceptedDeposit,
        step: 4,
      })
    )
    router.push('/aplication/security')
  }

  const fillMockData = () => {
    if (!profile) return

    const updates = pickBasicInfoUpdates(basicInfo, mockDataByProfile[profile])
    if (Object.keys(updates).length > 0) {
      dispatch(updateBasicInfo(updates))
    }

    const mockDocs: UploadedDocsState = {}
    profiles[profile].fields.forEach((field) => {
      if (field.type === 'file') {
        if (field.multiple) {
          mockDocs[field.id] = [
            createMockFile(`${field.id}_1.pdf`),
            createMockFile(`${field.id}_2.pdf`),
            createMockFile(`${field.id}_3.pdf`),
          ]
        } else {
          mockDocs[field.id] = [createMockFile(`${field.id}.pdf`)]
        }
      }
    })

    dispatch(setUploadedDocs(mockDocs))
    dispatch(setProcessState({ acceptedDeposit: true }))
  }

  const canProceedToSecurity = useMemo(() => {
    if (!profile) return false
    return Boolean(hasBasicInfo && acceptedDeposit)
  }, [acceptedDeposit, hasBasicInfo, profile])

  if (!profile) {
    return null
  }

  return (
    <div className="p-8 animate-fadeIn">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Información Complementaria</h2>
          <p className="text-gray-600">Sube documentos y confirma el depósito</p>
        </div>

        <button
          onClick={fillMockData}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md text-sm"
        >
          <Zap size={16} />
          <span>Datos de prueba</span>
        </button>
      </div>

      <DocumentsSection profile={profile} uploadedDocs={uploadedDocs} onFileChange={handleFileChange} />

      <DepositConfirmation
        deposit={profiles[profile].deposit}
        acceptedDeposit={acceptedDeposit}
        onAcceptChange={handleAcceptDepositChange}
      />

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
        >
          <ArrowLeft size={20} />
          <span>Atrás</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceedToSecurity}
          className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
            canProceedToSecurity
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>Continuar</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  )
}

export default StepComplementInfo
