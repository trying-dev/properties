'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react'

import { useDispatch, useSelector } from '+/redux'
import { setProcessState, setUploadedDocs, updateBasicInfo } from '+/redux/slices/process'
import { updateUserBasicInfo as updateUserBasicInfoInStore } from '+/redux/slices/user'

import { updateUserBasicInfo } from '+/actions/user'
import { createProcessAction, updateProcessAction } from '+/actions/processes'
import { mockDataByProfile } from '../../_/mockData'
import { profiles } from '../../_/profiles'
import { pickBasicInfoUpdates } from '../../_/basicInfoUtils'
import { BasicInfo, UploadedDocsState } from '../../_/types'
import { SelectInput, TextInput } from '../../_/ApplicantInfoSections'

const createMockFile = (fileName: string) => new File([''], fileName, { type: 'application/pdf' })

const genderOptions = [
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Femenino' },
  { value: 'OTHER', label: 'Otro' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefiero no decir' },
]

const maritalStatusOptions = [
  { value: 'SINGLE', label: 'Soltero/a' },
  { value: 'MARRIED', label: 'Casado/a' },
  { value: 'DIVORCED', label: 'Divorciado/a' },
  { value: 'WIDOWED', label: 'Viudo/a' },
  { value: 'SEPARATED', label: 'Separado/a' },
  { value: 'COMMON_LAW', label: 'Unión libre' },
]

const documentNumberPlaceholders: Record<string, string> = {
  CC: '1234567890',
  CE: '1234567890',
  PASSPORT: 'AA1234567',
}

const BasicInformation = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const processState = useSelector((state) => state.process)
  const user = useSelector((state) => state.user)
  const { basicInfo, profile } = processState
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasMountedRef = useRef(false)
  const hasSyncedUserRef = useRef(false)
  const isCreatingProcessRef = useRef(false)

  const isMinor = useMemo(() => {
    if (!basicInfo.birthDate) return false
    const birthDate = new Date(basicInfo.birthDate)
    if (Number.isNaN(birthDate.getTime())) return false
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1
    }
    return age < 18
  }, [basicInfo.birthDate])

  const documentTypeOptions = useMemo(() => {
    const baseOptions = [
      { value: 'CC', label: 'Cédula de ciudadanía' },
      { value: 'CE', label: 'Cédula de extranjería' },
    ]

    if (profile === 'FOREIGN' || profile === 'NOMAD') {
      return [{ value: 'PASSPORT', label: 'Pasaporte' }, ...baseOptions]
    }

    return baseOptions
  }, [profile])

  const canProceedToComplement = useMemo(() => {
    if (!profile) return false

    const hasBasicInfo = basicInfo.name.trim() && basicInfo.lastName.trim() && basicInfo.monthlyIncome.trim()

    return Boolean(hasBasicInfo)
  }, [basicInfo, profile])

  useEffect(() => {
    if (!profile) {
      router.replace('/aplication')
    }
  }, [router, profile])

  useEffect(() => {
    if (!user || hasSyncedUserRef.current) return

    const birthDate =
      typeof user.birthDate === 'string' && user.birthDate.length >= 10 ? user.birthDate.slice(0, 10) : ''

    const userInfo: Partial<BasicInfo> = {
      name: user.name?.trim() ? user.name : undefined,
      lastName: user.lastName?.trim() ? user.lastName : undefined,
      email: user.email?.trim() ? user.email : undefined,
      phone: user.phone?.trim() ? user.phone : undefined,
      birthDate: birthDate || undefined,
      birthPlace: user.birthPlace?.trim() ? user.birthPlace : undefined,
      documentType: user.documentType ?? undefined,
      documentNumber: user.documentNumber?.trim() ? user.documentNumber : undefined,
      gender: user.gender ?? undefined,
      maritalStatus: user.maritalStatus ?? undefined,
      profession: user.profession?.trim() ? user.profession : undefined,
      monthlyIncome: user.monthlyIncome != null ? String(user.monthlyIncome) : undefined,
    }

    const updates = pickBasicInfoUpdates(basicInfo, userInfo)
    if (Object.keys(updates).length > 0) {
      dispatch(updateBasicInfo(updates))
    }

    hasSyncedUserRef.current = true
  }, [basicInfo, dispatch, user])

  useEffect(() => {
    if (!profile) return
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      const monthlyIncomeNumber = Number(basicInfo.monthlyIncome.trim())
      const monthlyIncome = Number.isFinite(monthlyIncomeNumber) ? monthlyIncomeNumber : null

      const payload = {
        name: basicInfo.name,
        lastName: basicInfo.lastName,
        phone: basicInfo.phone ?? null,
        birthDate: basicInfo.birthDate ?? null,
        birthPlace: basicInfo.birthPlace ?? null,
        documentType: basicInfo.documentType ? basicInfo.documentType : null,
        documentNumber: basicInfo.documentNumber ?? null,
        gender: basicInfo.gender ? basicInfo.gender : null,
        maritalStatus: basicInfo.maritalStatus ? basicInfo.maritalStatus : null,
        profession: basicInfo.profession ?? null,
        monthlyIncome: basicInfo.monthlyIncome,
      }

      dispatch(
        updateUserBasicInfoInStore({
          name: payload.name,
          lastName: payload.lastName,
          phone: payload.phone ?? undefined,
          birthDate: payload.birthDate ?? undefined,
          birthPlace: payload.birthPlace ?? undefined,
          documentType: payload.documentType ?? undefined,
          documentNumber: payload.documentNumber ?? undefined,
          gender: payload.gender ?? undefined,
          maritalStatus: payload.maritalStatus ?? undefined,
          profession: payload.profession ?? undefined,
          monthlyIncome,
        })
      )

      void updateUserBasicInfo({ data: payload })

      if (processState.processId) {
        void updateProcessAction({
          processId: processState.processId,
          currentStep: 2,
          payloadPatch: { basicInfo, profile },
        })
          .then((result) => {
            if (!result.success) {
              console.error('No se pudo actualizar el proceso', result.error)
            }
          })
        return
      }

      if (isCreatingProcessRef.current) return
      isCreatingProcessRef.current = true
      void createProcessAction({
        tenantId: processState.tenantId,
        unitId: processState.unitId,
        currentStep: 2,
        payload: { basicInfo, profile },
      })
        .then((result) => {
          if (result.success && result.data) {
            dispatch(setProcessState({ processId: result.data.id }))
          } else {
            console.error('No se pudo crear el proceso', result.error)
          }
        })
        .finally(() => {
          isCreatingProcessRef.current = false
        })
    }, 700)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [basicInfo, dispatch, processState.processId, processState.tenantId, processState.unitId, profile])

  if (!profile) return null

  const handleInfoChange = (field: keyof BasicInfo, value: string | undefined) => {
    dispatch(updateBasicInfo({ [field]: value } as Partial<BasicInfo>))
  }

  const handleBack = () => {
    router.push('/aplication/profile')
  }

  const handleNext = () => {
    dispatch(setProcessState({ step: 3 }))
    router.push('/aplication/complementInfo')
  }

  const fillMockData = () => {
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

  return (
    <div className="p-8 animate-fadeIn">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Información Básica</h2>
          <p className="text-gray-600">Completa tus datos personales</p>
        </div>

        <button
          onClick={fillMockData}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md text-sm"
        >
          <Zap size={16} />
          <span>Datos de prueba</span>
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold">1</span>
          </div>
          Información Básica
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
          <TextInput
            label="Nombre(s)"
            value={basicInfo.name}
            onChange={(value) => handleInfoChange('name', value)}
            placeholder="Juan Pérez"
          />

          <TextInput
            label="Apellido(s)"
            value={basicInfo.lastName}
            onChange={(value) => handleInfoChange('lastName', value)}
            placeholder="Juan Pérez"
          />

          <SelectInput
            label="Tipo de documento"
            value={basicInfo.documentType ?? ''}
            onChange={(value) => handleInfoChange('documentType', value || undefined)}
            options={documentTypeOptions}
            required={false}
            showPlaceholder={false}
          />

          <TextInput
            label="Número de documento"
            value={basicInfo.documentNumber ?? ''}
            onChange={(value) => handleInfoChange('documentNumber', value)}
            placeholder={documentNumberPlaceholders[basicInfo.documentType ?? ''] || '1234567890'}
            required={false}
          />

          <TextInput
            label="Fecha de nacimiento"
            type="date"
            value={basicInfo.birthDate ?? ''}
            onChange={(value) => handleInfoChange('birthDate', value)}
            required={false}
          />
          {isMinor && (
            <p className="text-xs text-red-600 md:col-span-2 -mt-2 pl-1">
              No se puede ofrecer una aplicación a menores de edad.
            </p>
          )}

          <TextInput
            label="Lugar de nacimiento: Ciudad, Pais"
            value={basicInfo.birthPlace ?? ''}
            onChange={(value) => handleInfoChange('birthPlace', value)}
            placeholder="Bogotá"
            required={false}
          />

          <TextInput
            label="Teléfono"
            type="tel"
            value={basicInfo.phone ?? ''}
            onChange={(value) => handleInfoChange('phone', value)}
            placeholder="+57 300 000 0000"
            required={false}
          />

          <SelectInput
            label="Género"
            value={basicInfo.gender ?? ''}
            onChange={(value) => handleInfoChange('gender', value || undefined)}
            options={genderOptions}
            required={false}
          />

          <SelectInput
            label="Estado civil"
            value={basicInfo.maritalStatus ?? ''}
            onChange={(value) => handleInfoChange('maritalStatus', value || undefined)}
            options={maritalStatusOptions}
            required={false}
          />

          <TextInput
            label="Profesión"
            value={basicInfo.profession ?? ''}
            onChange={(value) => handleInfoChange('profession', value)}
            placeholder="Ingeniero/a"
            required={false}
          />

          <TextInput
            label="Ingreso mensual (COP)"
            type="number"
            value={basicInfo.monthlyIncome}
            onChange={(value) => handleInfoChange('monthlyIncome', value)}
            placeholder="5,000,000"
          />
        </div>
      </div>

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
          disabled={!canProceedToComplement}
          className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
            canProceedToComplement
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

export default BasicInformation
