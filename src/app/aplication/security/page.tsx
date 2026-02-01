'use client'

import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { FileText, Upload } from 'lucide-react'

import StepSecurity from './_/StepSecurity'
import { securityOptions } from '../_/profiles'
import { Field, ProfileId, SecurityFieldValue, UploadedDocsState, profileIds } from '../_/types'

import { useDispatch, useSelector } from '+/redux'
import { setProcessState, setSecurityFields, setUploadedDocs } from '+/redux/slices/process'
import { updateProcessAction } from '+/actions/processes'
import { sendCoDebtorConfirmationEmailsAction } from '+/actions/codeudor'

const SecurityStepPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const processState = useSelector((state) => state.process)
  const { selectedSecurity, profile, uploadedDocs, securityFields, processId } = processState
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isProfileId = (value: string): value is ProfileId => profileIds.includes(value as ProfileId)
  const resolvedProfile = isProfileId(profile) ? profile : ''

  useEffect(() => {
    if (!resolvedProfile) router.replace('/aplication/profile')
  }, [router, resolvedProfile])

  useEffect(() => {
    setSubmitError(null)
  }, [selectedSecurity])

  const handleFileChange = (fieldId: string, files: FileList | null) => {
    if (!files) return
    dispatch(setUploadedDocs({ [fieldId]: files }))
  }

  const createMockFile = (fileName: string) => new File([''], fileName, { type: 'application/pdf' })

  const fillMockDataStep3 = () => {
    if (!selectedSecurity) return
    const mockDocs: UploadedDocsState = { ...uploadedDocs }
    const mockFields: Record<string, SecurityFieldValue> = { ...securityFields }
    const securityOption = securityOptions.find((opt) => opt.id === selectedSecurity)
    if (!securityOption) return

    securityOption.fields.forEach((field) => {
      if (field.type === 'file') {
        if (field.multiple) {
          mockDocs[field.id] = [createMockFile(`${field.id}_1.pdf`), createMockFile(`${field.id}_2.pdf`)]
        } else {
          mockDocs[field.id] = [createMockFile(`${field.id}.pdf`)]
        }
        return
      }

      if (field.type === 'checkbox') {
        mockFields[field.id] = true
        return
      }

      if (field.type === 'date') {
        mockFields[field.id] = '1990-01-01'
        return
      }

      if (field.type === 'email') {
        mockFields[field.id] = 'codeudor@example.com'
        return
      }

      if (field.type === 'tel') {
        mockFields[field.id] = '+57 300 000 0000'
        return
      }

      mockFields[field.id] = 'Dato de prueba'
    })
    dispatch(setUploadedDocs(mockDocs))
    dispatch(setSecurityFields(mockFields))
  }

  const handleSecurityFieldChange = (fieldId: string, value: SecurityFieldValue) => {
    dispatch(setSecurityFields({ [fieldId]: value }))
  }

  const coDebtorConsentId = 'co_debtor_consent'
  const requiresCoDebtorConsent = useMemo(() => ['double', 'reinforced', 'mixed'].includes(selectedSecurity), [selectedSecurity])
  const coDebtorConsentChecked = Boolean(securityFields[coDebtorConsentId])

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
                {uploadedDocs[field.id] ? `${uploadedDocs[field.id]?.length ?? 0} archivo(s) seleccionado(s)` : 'Haz clic para subir archivo'}
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
        <label key={field.id} className="flex items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={Boolean(securityFields[field.id])}
            onChange={(e) => handleSecurityFieldChange(field.id, e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="font-medium">
            {field.label} {field.required !== false && <span className="text-red-500">*</span>}
          </span>
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
          value={String(securityFields[field.id] ?? '')}
          onChange={(e) => handleSecurityFieldChange(field.id, e.target.value)}
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

  const buildCoDebtor = (prefix: string) => {
    const pickValue = (id: string) => String(securityFields[id] ?? '').trim()
    return {
      name: pickValue(`${prefix}name`),
      lastName: pickValue(`${prefix}last_name`),
      birthDate: pickValue(`${prefix}birthdate`),
      documentNumber: pickValue(`${prefix}id`),
      email: pickValue(`${prefix}email`),
      phone: pickValue(`${prefix}phone`),
    }
  }

  const getCoDebtors = () => {
    if (!requiresCoDebtorConsent) return []
    if (selectedSecurity === 'double') {
      return [buildCoDebtor('codeudor_1_'), buildCoDebtor('codeudor_2_')]
    }
    return [buildCoDebtor('codeudor_')]
  }

  const validateCoDebtors = () => {
    const coDebtors = getCoDebtors()
    const missing = coDebtors.some(
      (coDebtor) => !coDebtor.name || !coDebtor.lastName || !coDebtor.birthDate || !coDebtor.documentNumber || !coDebtor.email || !coDebtor.phone
    )
    if (missing) {
      return {
        coDebtors: [],
        error: 'Completa todos los datos de los codeudores antes de continuar.',
      }
    }
    return { coDebtors, error: null }
  }

  const handleSubmit = async () => {
    if (isSubmitting || !selectedSecurity) return
    if (requiresCoDebtorConsent && !coDebtorConsentChecked) {
      setSubmitError('Debes aceptar el envio de emails a los codeudores.')
      return
    }
    if (!processId) {
      setSubmitError('No se encontro el proceso activo para enviar la solicitud.')
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    const payloadPatch = {
      security: {
        selectedSecurity,
        securityFields,
      },
    }

    const updateResult = await updateProcessAction({
      processId,
      currentStep: 4,
      payloadPatch,
    })

    if (!updateResult.success) {
      setSubmitError(updateResult.error ?? 'No se pudo guardar la informacion de seguridad.')
      setIsSubmitting(false)
      return
    }

    if (requiresCoDebtorConsent) {
      const { coDebtors, error } = validateCoDebtors()
      if (error) {
        setSubmitError(error)
        setIsSubmitting(false)
        return
      }

      const emailResult = await sendCoDebtorConfirmationEmailsAction({
        processId,
        selectedSecurity,
        coDebtors,
      })

      if (!emailResult.success) {
        setSubmitError(emailResult.error ?? 'No se pudieron enviar los correos a los codeudores.')
        setIsSubmitting(false)
        return
      }
    }

    setIsSubmitting(false)
  }

  return (
    <StepSecurity
      selectedSecurity={selectedSecurity}
      setSelectedSecurity={handleSelectSecurity}
      renderField={renderField}
      fillMockDataStep3={fillMockDataStep3}
      onBack={handleBack}
      onSubmit={handleSubmit}
      requiresCoDebtorConsent={requiresCoDebtorConsent}
      coDebtorConsentChecked={coDebtorConsentChecked}
      onCoDebtorConsentChange={(checked) => handleSecurityFieldChange(coDebtorConsentId, checked)}
      isSubmitting={isSubmitting}
      submitError={submitError}
    />
  )
}

export default SecurityStepPage
