'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { User, MapPin, Briefcase, Users, Save, AlertCircle, CheckCircle2, Phone, Mail, CreditCard, Calendar, Home, Heart } from 'lucide-react'

import { DocumentType, Gender, MaritalStatus, Profile } from '@prisma/client'

interface UserData {
  name: string
  lastName: string
  email: string
  phone: string
  birthDate: string
  birthPlace: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  documentType: DocumentType
  documentNumber: string
  gender: Gender | ''
  maritalStatus: MaritalStatus | ''
  profession: string
}

interface TenantData {
  emergencyContact: string
  emergencyContactPhone: string
  profile: Profile | ''
  monthlyIncome: string
}

interface Reference {
  name: string
  phone: string
  relationship: string
}

interface FormErrors {
  [key: string]: string | null
}

interface SelectOption {
  value: string
  label: string
}

interface FormFieldProps {
  label: string
  name: keyof UserData | keyof TenantData
  type?: string
  required?: boolean
  options?: SelectOption[] | null
  section?: 'user' | 'tenant'
  icon?: ReactNode | null
}

export default function TenantCompleteForm() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)

  const [userData, setUserData] = useState<UserData>({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    birthPlace: '',
    address: '',
    city: '',
    state: '',
    country: 'Colombia',
    postalCode: '',
    documentType: 'CC',
    documentNumber: '',
    gender: '',
    maritalStatus: '',
    profession: '',
  })

  const [tenantData, setTenantData] = useState<TenantData>({
    emergencyContact: '',
    emergencyContactPhone: '',
    profile: '',
    monthlyIncome: '',
  })

  const [references, setReferences] = useState<Reference[]>([
    { name: '', phone: '', relationship: '' },
    { name: '', phone: '', relationship: '' },
  ])

  const documentTypes: SelectOption[] = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PASSPORT', label: 'Pasaporte' },
    { value: 'OTHER', label: 'Otro' },
  ]

  const genders: SelectOption[] = [
    { value: 'MALE', label: 'Masculino' },
    { value: 'FEMALE', label: 'Femenino' },
    { value: 'OTHER', label: 'Otro' },
    { value: 'PREFER_NOT_TO_SAY', label: 'Prefiero no decir' },
  ]

  const maritalStatuses: SelectOption[] = [
    { value: 'SINGLE', label: 'Soltero/a' },
    { value: 'MARRIED', label: 'Casado/a' },
    { value: 'DIVORCED', label: 'Divorciado/a' },
    { value: 'WIDOWED', label: 'Viudo/a' },
    { value: 'SEPARATED', label: 'Separado/a' },
    { value: 'COMMON_LAW', label: 'Unión libre' },
  ]

  const profileOptions: SelectOption[] = [
    { value: 'EMPLOYED', label: 'Empleado/a' },
    { value: 'INDEPENDENT', label: 'Independiente' },
    { value: 'RETIRED', label: 'Pensionado/a' },
    { value: 'ENTREPRENEUR', label: 'Empresario/a' },
    { value: 'INVESTOR', label: 'Inversionista' },
    { value: 'STUDENT', label: 'Estudiante' },
    { value: 'FOREIGN', label: 'Extranjero/a' },
    { value: 'NOMAD', label: 'Nómada' },
    { value: 'UNEMPLOYED', label: 'Desempleado/a' },
  ]

  const handleUserDataChange = (field: keyof UserData, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleTenantDataChange = (field: keyof TenantData, value: string) => {
    setTenantData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleReferenceChange = (index: number, field: keyof Reference, value: string) => {
    const newReferences = [...references]
    newReferences[index][field] = value
    setReferences(newReferences)
  }

  const addReference = () => {
    setReferences([...references, { name: '', phone: '', relationship: '' }])
  }

  const removeReference = (index: number) => {
    if (references.length > 1) {
      setReferences(references.filter((_, i) => i !== index))
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    // 🔴 VALIDACIONES USER - TODOS OBLIGATORIOS
    if (!userData.name.trim()) newErrors.name = 'Nombre es requerido'
    if (!userData.lastName.trim()) newErrors.lastName = 'Apellido es requerido'
    if (!userData.email.trim()) newErrors.email = 'Email es requerido'
    if (!userData.phone.trim()) newErrors.phone = 'Teléfono es requerido'
    if (!userData.birthDate) newErrors.birthDate = 'Fecha de nacimiento es requerida'
    if (!userData.birthPlace.trim()) newErrors.birthPlace = 'Lugar de nacimiento es requerido'
    if (!userData.address.trim()) newErrors.address = 'Dirección es requerida'
    if (!userData.city.trim()) newErrors.city = 'Ciudad es requerida'
    if (!userData.state.trim()) newErrors.state = 'Departamento/Estado es requerido'
    if (!userData.country.trim()) newErrors.country = 'País es requerido'
    if (!userData.postalCode.trim()) newErrors.postalCode = 'Código postal es requerido'
    if (!userData.documentNumber.trim()) newErrors.documentNumber = 'Número de documento es requerido'
    if (!userData.gender) newErrors.gender = 'Género es requerido'
    if (!userData.maritalStatus) newErrors.maritalStatus = 'Estado civil es requerido'
    if (!userData.profession.trim()) newErrors.profession = 'Profesión es requerida'

    // Validaciones adicionales de formato
    if (userData.email && !/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email no válido'
    }

    // 🔴 VALIDACIONES TENANT - TODOS OBLIGATORIOS
    if (!tenantData.profile) newErrors.profile = 'Perfil es requerido'
    if (!tenantData.monthlyIncome.trim()) newErrors.monthlyIncome = 'Ingresos mensuales son requeridos'
    if (!tenantData.emergencyContact.trim()) newErrors.emergencyContact = 'Contacto de emergencia es requerido'
    if (!tenantData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Teléfono de emergencia es requerido'

    // Validación de ingresos
    if (tenantData.monthlyIncome && parseFloat(tenantData.monthlyIncome) <= 0) {
      newErrors.monthlyIncome = 'Los ingresos deben ser mayor a 0'
    }

    // 🔴 VALIDAR REFERENCIAS - AL MENOS 2 COMPLETAS
    const validReferences = references.filter((ref) => ref.name.trim() && ref.phone.trim() && ref.relationship.trim())
    if (validReferences.length < 2) {
      newErrors.references = 'Debe proporcionar al menos 2 referencias completas (nombre, teléfono y relación)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      const firstError = document.querySelector('.border-red-500')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const formData = {
        userData,
        tenantData,
        references: references.filter((ref) => ref.name.trim() && ref.phone.trim() && ref.relationship.trim()),
      }

      console.log('Datos del formulario:', formData)
      setSubmitSuccess(true)

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error('Error al enviar:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderFormField = ({
    label,
    name,
    type = 'text',
    required = true, // 🔴 AHORA DEFAULT ES TRUE
    options = null,
    section = 'user',
    icon = null,
  }: FormFieldProps) => {
    const value = section === 'user' ? userData[name as keyof UserData] : tenantData[name as keyof TenantData]
    const handleChange =
      section === 'user'
        ? (field: string, value: string) => handleUserDataChange(field as keyof UserData, value)
        : (field: string, value: string) => handleTenantDataChange(field as keyof TenantData, value)
    const error = errors[name as string]

    if (options) {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            {icon && icon}
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value as string}
            onChange={(e) => handleChange(name as string, e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors 
                ${error ? 'border-red-500' : 'border-gray-300'}
              `}
            required={required}
          >
            <option value="">Seleccionar...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={16} />
              {error}
            </p>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon && icon}
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          value={value as string}
          onChange={(e) => handleChange(name as string, e.target.value)}
          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors 
              ${error ? 'border-red-500' : 'border-gray-300'}
            `}
          placeholder={`Ingresa ${label.toLowerCase()}`}
          required={required}
        />
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={16} />
            {error}
          </p>
        )}
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">¡Información Enviada!</h2>
          <p className="text-gray-600 mb-6">Tu información ha sido actualizada exitosamente.</p>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">Ahora continua con los documentos necesarios.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <User size={28} />
              Completar Información Personal
            </h1>
            <p className="text-blue-100 mt-2">Completa todos los campos requeridos para continuar con el proceso de contrato</p>
            <div className="mt-3 bg-blue-500 bg-opacity-50 rounded-lg p-3">
              <p className="text-sm text-blue-100 flex items-center gap-2">
                <AlertCircle size={16} />
                Todos los campos marcados con (*) son obligatorios
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 🔵 INFORMACIÓN PERSONAL */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-500" />
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField({ label: 'Nombre', name: 'name', type: 'text', required: true })}
                {renderFormField({ label: 'Apellido', name: 'lastName', type: 'text', required: true })}
                {renderFormField({
                  label: 'Tipo de Documento',
                  name: 'documentType',
                  type: 'text',
                  required: true,
                  options: documentTypes,
                  icon: <CreditCard size={16} />,
                })}
                {renderFormField({
                  label: 'Número de Documento',
                  name: 'documentNumber',
                  type: 'text',
                  required: true,
                  icon: <CreditCard size={16} />,
                })}
                {renderFormField({
                  label: 'Fecha de Nacimiento',
                  name: 'birthDate',
                  type: 'date',
                  required: true,
                  icon: <Calendar size={16} />,
                })}
                {renderFormField({ label: 'Lugar de Nacimiento', name: 'birthPlace', required: true })}
                {renderFormField({
                  label: 'Género',
                  name: 'gender',
                  type: 'text',
                  required: true,
                  options: genders,
                })}
                {renderFormField({
                  label: 'Estado Civil',
                  name: 'maritalStatus',
                  type: 'text',
                  required: true,
                  options: maritalStatuses,
                  icon: <Heart size={16} />,
                })}
                <div className="md:col-span-2">
                  {renderFormField({
                    label: 'Profesión',
                    name: 'profession',
                    type: 'text',
                    required: true,
                    icon: <Briefcase size={16} />,
                  })}
                </div>
              </div>
            </div>

            {/* 🟢 CONTACTO Y DIRECCIÓN */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-green-500" />
                Contacto y Dirección
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField({
                  label: 'Email',
                  name: 'email',
                  type: 'email',
                  required: true,
                  icon: <Mail size={16} />,
                })}
                {renderFormField({
                  label: 'Teléfono',
                  name: 'phone',
                  type: 'tel',
                  required: true,
                  icon: <Phone size={16} />,
                })}
                <div className="md:col-span-2">
                  {renderFormField({
                    label: 'Dirección',
                    name: 'address',
                    type: 'text',
                    required: true,
                    icon: <Home size={16} />,
                  })}
                </div>
                {renderFormField({ label: 'Ciudad', name: 'city', type: 'text', required: true })}
                {renderFormField({ label: 'Departamento/Estado', name: 'state', required: true })}
                {renderFormField({ label: 'País', name: 'country', required: true })}
                {renderFormField({ label: 'Código Postal', name: 'postalCode', required: true })}
              </div>
            </div>

            {/* 🟣 INFORMACIÓN LABORAL Y EMERGENCIA */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-purple-500" />
                Información Laboral y Emergencia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField({
                  label: 'Perfil',
                  name: 'profile',
                  type: 'text',
                  required: true,
                  options: profileOptions,
                  section: 'tenant',
                  icon: <Briefcase size={16} />,
                })}
                {renderFormField({
                  label: 'Ingresos Mensuales ($)',
                  name: 'monthlyIncome',
                  type: 'number',
                  required: true,
                  section: 'tenant',
                })}
                {renderFormField({
                  label: 'Contacto de Emergencia',
                  name: 'emergencyContact',
                  type: 'text',
                  required: true,
                  section: 'tenant',
                })}
                {renderFormField({
                  label: 'Teléfono de Emergencia',
                  name: 'emergencyContactPhone',
                  type: 'tel',
                  required: true,
                  section: 'tenant',
                  icon: <Phone size={16} />,
                })}
              </div>
            </div>

            {/* 🟠 REFERENCIAS PERSONALES */}
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users size={20} className="text-orange-500" />
                  Referencias Personales
                </h3>
                <button
                  type="button"
                  onClick={addReference}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  Agregar Referencia
                </button>
              </div>

              <div className="mb-4 bg-orange-100 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-700 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Debes proporcionar al menos 2 referencias completas (nombre, teléfono y relación)
                </p>
              </div>

              {errors.references && (
                <p className="text-sm text-red-500 flex items-center gap-1 mb-4">
                  <AlertCircle size={16} />
                  {errors.references}
                </p>
              )}

              <div className="space-y-4">
                {references.map((reference, index) => (
                  <div key={index} className="bg-white p-4 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-700">Referencia {index + 1}</h4>
                      {references.length > 2 && (
                        <button type="button" onClick={() => removeReference(index)} className="text-red-500 hover:text-red-700 text-sm">
                          Eliminar
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={reference.name}
                          onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Nombre completo"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={reference.phone}
                          onChange={(e) => handleReferenceChange(index, 'phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Número de teléfono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Relación <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={reference.relationship}
                          onChange={(e) => handleReferenceChange(index, 'relationship', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Ej: Amigo, Familiar, Jefe"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🚀 SUBMIT BUTTON */}
            <div className="flex justify-center pt-6 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando Información...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Enviar Información Completa
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
