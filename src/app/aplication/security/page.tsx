'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { FileText, Upload } from 'lucide-react'

import ApplicationLayout from '../_/ApplicationLayout'
import StepSecurity from './_/StepSecurity'
import { securityOptions } from '../_/profiles'
import { Field, ProfileId, UploadedDocsState, profileIds } from '../_/types'

import { useDispatch, useSelector } from '+/redux'
import { setProcessState, setUploadedDocs } from '+/redux/slices/process'

const SecurityStepPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const processState = useSelector((state) => state.process)
  const { selectedSecurity, profile, uploadedDocs } = processState
  const isProfileId = (value: string): value is ProfileId => profileIds.includes(value as ProfileId)
  const resolvedProfile = isProfileId(profile) ? profile : ''

  useEffect(() => {
    if (!resolvedProfile) router.replace('/aplication/profile')
  }, [router, resolvedProfile])

  const handleFileChange = (fieldId: string, files: FileList | null) => {
    if (!files) return
    dispatch(setUploadedDocs({ [fieldId]: files }))
  }

  const createMockFile = (fileName: string) => new File([''], fileName, { type: 'application/pdf' })

  const fillMockDataStep3 = () => {
    if (!selectedSecurity) return
    const mockDocs: UploadedDocsState = { ...uploadedDocs }
    const securityOption = securityOptions.find((opt) => opt.id === selectedSecurity)
    if (!securityOption) return

    securityOption.fields.forEach((field) => {
      if (field.type === 'file') {
        if (field.multiple) {
          mockDocs[field.id] = [createMockFile(`${field.id}_1.pdf`), createMockFile(`${field.id}_2.pdf`)]
        } else {
          mockDocs[field.id] = [createMockFile(`${field.id}.pdf`)]
        }
      }
    })
    dispatch(setUploadedDocs(mockDocs))
  }

  const renderField = (field: Field) => {
    if (field.type === 'file') {
      return (
        <label key={field.id} className="flex flex-col gap-2 text-sm text-gray-700">
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

  const handleBack = () => router.push('/aplication/complementInfo')

  const handleSelectSecurity = (securityId: string) => {
    dispatch(setProcessState({ selectedSecurity: securityId, step: 4 }))
  }

  return (
    <ApplicationLayout>
      <StepSecurity
        selectedSecurity={selectedSecurity}
        setSelectedSecurity={handleSelectSecurity}
        renderField={renderField}
        fillMockDataStep3={fillMockDataStep3}
        onBack={handleBack}
      />
    </ApplicationLayout>
  )
}

export default SecurityStepPage
