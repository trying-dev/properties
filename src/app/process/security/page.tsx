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

const SecurityStepPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const processState = useSelector((state) => state.process)
  const { selectedSecurity, profile, uploadedDocs, securityFields, processId } = processState
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const isProfileId = (value: string): value is ProfileId => profileIds.includes(value as ProfileId)
  const resolvedProfile = isProfileId(profile) ? profile : ''

  useEffect(() => {
    if (!resolvedProfile) router.replace('/process/profile')
  }, [router, resolvedProfile])

  useEffect(() => {
    if (!isSuccess) return
    const timeout = setTimeout(() => {
      router.push('/dashboard/tenant')
    }, 5000)
    return () => clearTimeout(timeout)
  }, [isSuccess, router])

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

    const resolveSuffix = (fieldId: string) => {
      const match = fieldId.match(/_([12])\b/)
      return match ? Number(match[1]) : null
    }

    securityOption.fields.forEach((field) => {
      if (field.type === 'file') {
        if (field.id.includes('extractos')) {
          mockDocs[field.id] = [
            createMockFile(`${field.id}_mes_1.pdf`),
            createMockFile(`${field.id}_mes_2.pdf`),
            createMockFile(`${field.id}_mes_3.pdf`),
          ]
          return
        }
        if (field.id.includes('cedula')) {
          mockDocs[field.id] = [createMockFile(`${field.id}_frente.pdf`), createMockFile(`${field.id}_reverso.pdf`)]
          return
        }
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
        const suffix = resolveSuffix(field.id)
        mockFields[field.id] = suffix === 2 ? '1992-02-02' : '1990-01-01'
        return
      }

      if (field.type === 'email') {
        const suffix = resolveSuffix(field.id)
        mockFields[field.id] = suffix === 2 ? 'codeudor2@example.com' : 'codeudor1@example.com'
        return
      }

      if (field.type === 'tel') {
        const suffix = resolveSuffix(field.id)
        mockFields[field.id] = suffix === 2 ? '+57 300 000 0002' : '+57 300 000 0001'
        return
      }

      const suffix = resolveSuffix(field.id)
      if (field.id.includes('full_name')) {
        mockFields[field.id] = suffix === 2 ? 'Codeudor Dos' : 'Codeudor Uno'
        return
      }
      if (field.id.includes('_id')) {
        mockFields[field.id] = suffix === 2 ? '9876543210' : '1234567890'
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

  const requiresCoDebtorConsent = useMemo(() => ['double', 'reinforced', 'mixed'].includes(selectedSecurity), [selectedSecurity])

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

  const handleBack = () => router.push('/process/complementInfo')

  const handleSelectSecurity = (securityId: string) => {
    setSubmitError(null)
    dispatch(setProcessState({ selectedSecurity: securityId, step: 4 }))
  }

  const buildCoDebtor = (prefix: string) => {
    const pickValue = (id: string) => String(securityFields[id] ?? '').trim()
    const fullName = pickValue(`${prefix}full_name`)
    const [firstName, ...rest] = fullName.split(' ').filter(Boolean)
    const lastName = rest.join(' ')
    return {
      name: firstName || fullName,
      lastName: lastName || '',
      birthDate: pickValue(`${prefix}birthdate`),
      documentNumber: pickValue(`${prefix}id`),
      email: pickValue(`${prefix}email`),
      phone: pickValue(`${prefix}phone`),
      fullName,
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
      (coDebtor) => !coDebtor.fullName || !coDebtor.birthDate || !coDebtor.documentNumber || !coDebtor.email || !coDebtor.phone
    )
    if (missing) {
      return {
        coDebtors: [],
        error: 'Completa todos los datos de los codeudores antes de continuar.',
      }
    }
    const normalized = coDebtors.map(({ fullName, ...rest }) => ({
      ...rest,
      name: rest.name || fullName,
      lastName: rest.lastName || '',
    }))
    return { coDebtors: normalized, error: null }
  }

  const handleSubmit = async () => {
    if (isSubmitting || isSuccess || !selectedSecurity) return
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
      status: 'IN_EVALUATION',
    })

    if (!updateResult.success) {
      setSubmitError(updateResult.error ?? 'No se pudo guardar la informacion de seguridad.')
      setIsSubmitting(false)
      return
    }

    if (requiresCoDebtorConsent) {
      const { error } = validateCoDebtors()
      if (error) {
        setSubmitError(error)
        setIsSubmitting(false)
        return
      }
    }

    setIsSubmitting(false)
    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <div className="p-8 animate-fadeIn">
        <div className="rounded-xl border border-green-200 bg-green-50 px-6 py-5 text-green-800">
          <h2 className="text-2xl font-bold text-green-900 mb-2">Solicitud enviada</h2>
          <p className="text-sm">
            Tu solicitud fue enviada correctamente y ahora está en validación. Te avisaremos por correo y también podrás seguir el estado desde tu
            dashboard.
          </p>
        </div>
        <div className="mt-6 flex flex-col items-start gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/tenant')}
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-5 py-2.5 text-white font-semibold hover:bg-green-700 transition"
            >
              Ir a mi dashboard
            </button>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center rounded-lg border border-green-200 bg-white px-5 py-2.5 text-green-700 font-semibold hover:border-green-300 hover:bg-green-50 transition"
            >
              Seguir explorando unidades
            </button>
          </div>
          <span className="text-xs text-gray-500">Redirigiendo automáticamente en unos segundos...</span>
        </div>
      </div>
    )
  }

  return (
    <StepSecurity
      selectedSecurity={selectedSecurity}
      setSelectedSecurity={handleSelectSecurity}
      renderField={renderField}
      fillMockDataStep3={fillMockDataStep3}
      onBack={handleBack}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
    />
  )
}

export default SecurityStepPage
