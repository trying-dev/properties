'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { DocumentType, Gender, MaritalStatus } from '@prisma/client'

export interface ReferenceForm {
  name: string
  phone: string
  relationship: string
}

export interface TenantFormData {
  // Autenticación / Usuario
  email: string
  name: string
  lastName: string

  documentType: DocumentType
  documentNumber: string

  phone?: string
  birthDate?: string // yyyy-MM-dd (input date)
  gender: Gender
  maritalStatus: MaritalStatus

  // Dirección
  address?: string
  city?: string
  state?: string
  country: string

  // Profesional
  profession?: string
  profile?: string
  monthlyIncome?: number | '' // mantenemos "" en UI y convertimos al enviar

  // Emergencia
  emergencyContact?: string
  emergencyContactPhone?: string
}

export interface CreateTenantSubmit {
  // Payload sugerido para el backend
  user: {
    email: string
    name: string
    lastName: string
    documentType: DocumentType
    documentNumber: string
    phone?: string
    birthDate?: string // ISO string
    gender: Gender
    maritalStatus: MaritalStatus
    address?: string
    city?: string
    state?: string
    country?: string
    profession?: string
  }
  tenant: {
    profile?: string
    monthlyIncome?: number
    emergencyContact?: string
    emergencyContactPhone?: string
  }
  references: ReferenceForm[]
}

type Props = {
  isOpen: boolean
  onClose: () => void

  onSubmit: (data: CreateTenantSubmit) => void
}

export const CreateTenantForm = ({ isOpen, onClose, onSubmit }: Props) => {
  const initialForm = useMemo(
    () =>
      ({
        email: '',
        name: '',
        lastName: '',
        documentType: 'CC',
        documentNumber: '',
        phone: '',
        birthDate: '',
        gender: 'PREFER_NOT_TO_SAY',
        maritalStatus: 'SINGLE',
        address: '',
        city: '',
        state: '',
        country: 'Colombia',
        profession: '',
        profile: '',
        monthlyIncome: '',
        emergencyContact: '',
        emergencyContactPhone: '',
      }) as TenantFormData,
    []
  )
  const profileOptions = useMemo(
    () => [
      { value: 'EMPLOYED', label: 'Empleado/a' },
      { value: 'INDEPENDENT', label: 'Independiente' },
      { value: 'RETIRED', label: 'Pensionado/a' },
      { value: 'ENTREPRENEUR', label: 'Empresario/a' },
      { value: 'INVESTOR', label: 'Inversionista' },
      { value: 'STUDENT', label: 'Estudiante' },
      { value: 'FOREIGN', label: 'Extranjero/a' },
      { value: 'NOMAD', label: 'Nómada' },
      { value: 'UNEMPLOYED', label: 'Desempleado/a' },
    ],
    []
  )

  const [formData, setFormData] = useState<TenantFormData>(initialForm)
  const [references, setReferences] = useState<ReferenceForm[]>([{ name: '', phone: '', relationship: '' }])

  const handleInputChange = <K extends keyof TenantFormData>(field: K, value: TenantFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addReference = () => {
    setReferences((prev) => [...prev, { name: '', phone: '', relationship: '' }])
  }

  const removeReference = (index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index))
  }

  const updateReference = <K extends keyof ReferenceForm>(
    index: number,
    field: K,
    value: ReferenceForm[K]
  ) => {
    setReferences((prev) => prev.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref)))
  }

  const resetForm = () => {
    setFormData(initialForm)
    setReferences([{ name: '', phone: '', relationship: '' }])
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Sanitización/conversión
    const monthlyIncomeNumber =
      formData.monthlyIncome === '' || formData.monthlyIncome == null
        ? undefined
        : Number(formData.monthlyIncome)

    const birthDateISO =
      formData.birthDate && formData.birthDate.trim() !== ''
        ? new Date(formData.birthDate).toISOString()
        : undefined

    const filteredRefs = references
      .map((r) => ({
        name: r.name?.trim() ?? '',
        phone: r.phone?.trim() ?? '',
        relationship: r.relationship?.trim() ?? '',
      }))
      .filter((r) => r.name !== '')

    const payload: CreateTenantSubmit = {
      user: {
        email: formData.email.trim(),
        name: formData.name.trim(),
        lastName: formData.lastName.trim(),
        documentType: formData.documentType,
        documentNumber: formData.documentNumber.trim(),
        phone: formData.phone?.trim() || undefined,
        birthDate: birthDateISO,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        address: formData.address?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        state: formData.state?.trim() || undefined,
        country: formData.country?.trim() || undefined,
        profession: formData.profession?.trim() || undefined,
      },
      tenant: {
        profile: formData.profile?.trim() || undefined,
        monthlyIncome: monthlyIncomeNumber,
        emergencyContact: formData.emergencyContact?.trim() || undefined,
        emergencyContactPhone: formData.emergencyContactPhone?.trim() || undefined,
      },
      references: filteredRefs,
    }

    console.log({ payload })

    onSubmit(payload)
  }

  useEffect(() => {
    if (!isOpen) resetForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-tenant-title"
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 id="new-tenant-title" className="text-xl font-semibold text-gray-900">
              Crear Nuevo Inquilino
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Cerrar"
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {/* Información Básica */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    autoComplete="given-name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                {/* Apellido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    autoComplete="family-name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>

                {/* Tipo Doc */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento *</label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.documentType}
                    onChange={(e) => handleInputChange('documentType', e.target.value as DocumentType)}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="PASSPORT">Pasaporte</option>
                    <option value="NIT">NIT</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>

                {/* Número Doc */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.documentNumber}
                    onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    autoComplete="tel"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                {/* Fecha Nacimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  />
                </div>

                {/* Género */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value as Gender)}
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                    <option value="OTHER">Otro</option>
                    <option value="PREFER_NOT_TO_SAY">Prefiero no decir</option>
                  </select>
                </div>

                {/* Estado civil */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.maritalStatus}
                    onChange={(e) => handleInputChange('maritalStatus', e.target.value as MaritalStatus)}
                  >
                    <option value="SINGLE">Soltero</option>
                    <option value="MARRIED">Casado</option>
                    <option value="DIVORCED">Divorciado</option>
                    <option value="WIDOWED">Viudo</option>
                    <option value="SEPARATED">Separado</option>
                    <option value="COMMON_LAW">Unión Libre</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Dirección */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    autoComplete="address-line1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    autoComplete="address-level2"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento/Estado</label>
                  <input
                    type="text"
                    autoComplete="address-level1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <input
                    type="text"
                    autoComplete="country-name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Información Profesional */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Profesional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profesión</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.profile}
                    onChange={(e) => handleInputChange('profile', e.target.value)}
                  >
                    <option value="">Selecciona un perfil</option>
                    {profileOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingresos Mensuales</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.monthlyIncome}
                    onChange={(e) => {
                      const val = e.target.value
                      // Permitimos "" para limpiar el campo
                      handleInputChange(
                        'monthlyIncome',
                        val === '' ? '' : (Number(val) as TenantFormData['monthlyIncome'])
                      )
                    }}
                    placeholder="1000000"
                  />
                </div>
              </div>
            </section>

            {/* Contacto de Emergencia */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contacto de Emergencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Contacto</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono del Contacto
                  </label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Referencias */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Referencias</h3>
                <button
                  type="button"
                  onClick={addReference}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Agregar Referencia
                </button>
              </div>

              <div className="space-y-4">
                {references.map((reference, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Referencia {index + 1}</span>
                      {references.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeReference(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={reference.name}
                          onChange={(e) => updateReference(index, 'name', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input
                          type="tel"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={reference.phone}
                          onChange={(e) => updateReference(index, 'phone', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Relación</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={reference.relationship}
                          onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                          placeholder="Familiar, Amigo, Jefe..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Crear Inquilino
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
