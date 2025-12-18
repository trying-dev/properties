'use client'

import { useEffect, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { FileText, Upload } from 'lucide-react'

import ApplicationLayout from '../_components/ApplicationLayout'
import StepApplicantInfo from '../_components/StepApplicantInfo'
import useApplicationProcess from '../_/useApplicationProcess'
import { mockDataByProfile } from '../_/mockData'
import { profiles } from '../_/profiles'
import { ApplicantInfo, Field, ProfileId, UploadedDocsState } from '../_/types'

import { useDispatch } from '+/redux'
import { setApplicationState, setUploadedDocs, updateApplicantInfo } from '+/redux/slices/application'

const isProfileId = (value: string): value is ProfileId => value in profiles

const InformationStepPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { application, processState, persistProcess } = useApplicationProcess(2)
  const { applicantInfo, acceptedDeposit, uploadedDocs, selectedSecurity } = application
  const selectedProfile = isProfileId(application.selectedProfile) ? application.selectedProfile : ''

  useEffect(() => {
    if (!selectedProfile) router.replace('/aplication/profile')
  }, [router, selectedProfile])

  const handleApplicantInfoChange = (field: keyof ApplicantInfo, value: string) => {
    dispatch(updateApplicantInfo({ [field]: value } as Partial<ApplicantInfo>))
  }

  const handleFileChange = (fieldId: string, files: FileList | null) => {
    if (!files) return
    dispatch(setUploadedDocs({ [fieldId]: files }))
  }

  const createMockFile = (fileName: string) => new File([''], fileName, { type: 'application/pdf' })

  const fillMockDataStep2 = () => {
    if (!selectedProfile) return
    dispatch(updateApplicantInfo(mockDataByProfile[selectedProfile]))
    dispatch(setApplicationState({ uploadedDocs: {} }))
    const mockDocs: UploadedDocsState = {}
    profiles[selectedProfile].fields.forEach((field) => {
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
    dispatch(setApplicationState({ acceptedDeposit: true }))
  }

  const renderField = (field: Field) => {
    if (field.type === 'file') {
      return (
        <label
          key={field.id}
          className={`flex flex-col gap-2 text-sm text-gray-700 ${field.multiple ? 'md:col-span-2' : ''}`}
        >
          <span className="font-medium">
            {field.label} {field.required !== false && <span className="text-red-500">*</span>}
          </span>
          <div className="relative">
            <input
              type="file"
              accept={field.accept}
              multiple={field.multiple}
              onChange={(e) => handleFileChange(field.id, e.target.files)}
              className="hidden"
              id={field.id}
            />
            <label
              htmlFor={field.id}
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Upload size={20} className="text-gray-500" />
              <span className="text-gray-600">
                {uploadedDocs[field.id]
                  ? `${uploadedDocs[field.id]?.length ?? 0} archivo(s) seleccionado(s)`
                  : 'Haz clic para subir archivo'}
              </span>
            </label>
            {uploadedDocs[field.id] &&
              (() => {
                const files = uploadedDocs[field.id]
                if (!files) return null
                const fileArray = Array.from(files)
                return (
                  <div className="mt-2 space-y-1">
                    {fileArray.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                        <FileText size={14} />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )
              })()}
          </div>
        </label>
      )
    }

    if (field.type === 'checkbox') {
      return (
        <label
          key={field.id}
          className="flex items-center gap-3 text-sm text-gray-700 md:col-span-2 p-3 bg-gray-50 rounded-lg"
        >
          <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
          <span>{field.label}</span>
        </label>
      )
    }

    return (
      <label key={field.id} className="flex flex-col gap-2 text-sm text-gray-700">
        <span className="font-medium">
          {field.label} {field.required !== false && <span className="text-red-500">*</span>}
        </span>
        <input
          type={field.type}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={field.type === 'tel' ? '+57 300 000 0000' : ''}
        />
      </label>
    )
  }

  const canProceedToStep3 = useMemo(
    () =>
      Boolean(
        selectedProfile &&
          applicantInfo.fullName.trim() &&
          applicantInfo.email.trim() &&
          applicantInfo.phone.trim() &&
          applicantInfo.documentNumber.trim() &&
          applicantInfo.monthlyIncome.trim() &&
          acceptedDeposit
      ),
    [acceptedDeposit, applicantInfo, selectedProfile]
  )

  const handleBack = () => router.push('/aplication/profile')

  const handleNext = () => {
    const payload = {
      applicantInfo,
      selectedProfile,
      selectedSecurity,
      acceptedDeposit,
      activeStep: 3,
      tenantId: processState.tenantId,
      unitId: processState.unitId,
    }
    persistProcess({ payload, step: 3, immediate: true })
    router.push('/aplication/security')
  }

  return (
    <ApplicationLayout currentStep={2}>
      <StepApplicantInfo
        applicantInfo={applicantInfo}
        selectedProfile={selectedProfile}
        renderField={renderField}
        onApplicantInfoChange={handleApplicantInfoChange}
        fillMockDataStep2={fillMockDataStep2}
        acceptedDeposit={acceptedDeposit}
        setAcceptedDeposit={(value) => {
          const nextValue = typeof value === 'function' ? value(acceptedDeposit) : value
          dispatch(setApplicationState({ acceptedDeposit: Boolean(nextValue) }))
        }}
        canProceedToStep3={canProceedToStep3}
        onBack={handleBack}
        onNext={handleNext}
      />
    </ApplicationLayout>
  )
}

export default InformationStepPage
