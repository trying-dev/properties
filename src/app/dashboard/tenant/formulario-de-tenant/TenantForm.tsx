'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import {
  User,
  MapPin,
  Briefcase,
  Users,
  Save,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Home,
  Heart,
} from 'lucide-react'

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

type TenantFormProps = {
  embedded?: boolean
  onClose?: () => void
}

export default function TenantCompleteForm({ embedded = false, onClose }: TenantFormProps) {
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
    { value: 'RETIRED', label: 'Pensionado' },
    { value: 'ENTREPRENEUR', label: 'Emprendedor' },
    { value: 'INVESTOR', label: 'Inversionista' },
    { value: 'STUDENT', label: 'Estudiante' },
    { value: 'FOREIGN', label: 'Extranjero' },
    { value: 'NOMAD', label: 'Nómada digital' },
    { value: 'UNEMPLOYED', label: 'Desempleado' },
  ]

  const handleUserDataChange = (field: keyof UserData, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const handleTenantDataChange = (field: keyof TenantData, value: string) => {
    setTenantData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const handleReferenceChange = (index: number, field: keyof Reference, value: string) => {
    const updated = [...references]
    updated[index][field] = value
    setReferences(updated)
    setErrors((prev) => ({ ...prev, references: null }))
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!userData.name.trim()) newErrors.name = 'Nombre es requerido'
    if (!userData.lastName.trim()) newErrors.lastName = 'Apellido es requerido'
    if (!userData.documentType) newErrors.documentType = 'Tipo de documento es requerido'
    if (!userData.documentNumber.trim()) newErrors.documentNumber = 'Número de documento es requerido'
    if (!userData.birthDate) newErrors.birthDate = 'Fecha de nacimiento es requerida'
    if (!userData.gender) newErrors.gender = 'Género es requerido'
    if (!userData.maritalStatus) newErrors.maritalStatus = 'Estado civil es requerido'
    if (!userData.profession.trim()) newErrors.profession = 'Profesión es requerida'
    if (!userData.phone.trim()) newErrors.phone = 'Teléfono es requerido'
    if (!userData.email.trim()) newErrors.email = 'Correo es requerido'

    if (!tenantData.profile) newErrors.profile = 'Perfil es requerido'
    if (!tenantData.monthlyIncome.trim()) newErrors.monthlyIncome = 'Ingresos mensuales son requeridos'
    if (!tenantData.emergencyContact.trim()) newErrors.emergencyContact = 'Contacto de emergencia es requerido'
    if (!tenantData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Teléfono de emergencia es requerido'

    const filledReferences = references.filter((ref) => ref.name.trim() && ref.phone.trim() && ref.relationship.trim())
    if (filledReferences.length < 2) {
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
    required = true,
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
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            {icon}
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
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {icon}
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
      <div className={embedded ? 'p-6' : 'min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4'}>
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">¡Información Enviada!</h2>
          <p className="text-gray-600 mb-6">Tu información ha sido actualizada exitosamente.</p>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">Ahora continua con los documentos necesarios.</p>
          </div>
          {embedded && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={embedded ? 'p-4' : 'min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4'}>
      <div className={embedded ? '' : 'max-w-5xl mx-auto'}>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <User size={28} />
                  Completar Información Personal
                </h1>
                <p className="text-blue-100 mt-2">Completa todos los campos requeridos para continuar con el proceso de contrato</p>
              </div>
              {embedded && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500/30"
                >
                  Cerrar
                </button>
              )}
            </div>
            <div className="mt-3 bg-blue-500 bg-opacity-50 rounded-lg p-3">
              <p className="text-sm text-blue-100 flex items-center gap-2">
                <AlertCircle size={16} />
                Todos los campos marcados con (*) son obligatorios
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                {renderFormField({
                  label: 'Lugar de Nacimiento',
                  name: 'birthPlace',
                  type: 'text',
                  required: false,
                  icon: <MapPin size={16} />,
                })}
                {renderFormField({ label: 'Género', name: 'gender', options: genders, icon: <Users size={16} /> })}
                {renderFormField({ label: 'Estado Civil', name: 'maritalStatus', options: maritalStatuses, icon: <Heart size={16} /> })}
                {renderFormField({
                  label: 'Profesión',
                  name: 'profession',
                  type: 'text',
                  required: true,
                  icon: <Briefcase size={16} />,
                })}
                {renderFormField({ label: 'Teléfono', name: 'phone', type: 'tel', required: true, icon: <Phone size={16} /> })}
                {renderFormField({ label: 'Correo', name: 'email', type: 'email', required: true, icon: <Mail size={16} /> })}
                {renderFormField({ label: 'Dirección', name: 'address', type: 'text', required: false, icon: <MapPin size={16} /> })}
                {renderFormField({ label: 'Ciudad', name: 'city', type: 'text', required: false, icon: <MapPin size={16} /> })}
                {renderFormField({ label: 'Departamento', name: 'state', type: 'text', required: false, icon: <MapPin size={16} /> })}
                {renderFormField({ label: 'País', name: 'country', type: 'text', required: false, icon: <MapPin size={16} /> })}
                {renderFormField({ label: 'Código Postal', name: 'postalCode', type: 'text', required: false, icon: <MapPin size={16} /> })}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Home size={20} className="text-purple-500" />
                Información del Inquilino
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField({
                  label: 'Perfil',
                  name: 'profile',
                  options: profileOptions,
                  section: 'tenant',
                  icon: <User size={16} />,
                })}
                {renderFormField({
                  label: 'Ingresos Mensuales',
                  name: 'monthlyIncome',
                  type: 'number',
                  section: 'tenant',
                  icon: <Briefcase size={16} />,
                })}
                {renderFormField({
                  label: 'Contacto de Emergencia',
                  name: 'emergencyContact',
                  type: 'text',
                  section: 'tenant',
                  icon: <User size={16} />,
                })}
                {renderFormField({
                  label: 'Teléfono de Emergencia',
                  name: 'emergencyContactPhone',
                  type: 'tel',
                  section: 'tenant',
                  icon: <Phone size={16} />,
                })}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={20} className="text-green-500" />
                Referencias Personales
              </h3>
              <div className="space-y-4">
                {references.map((reference, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={reference.name}
                      onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors border-gray-300"
                    />
                    <input
                      type="tel"
                      placeholder="Teléfono"
                      value={reference.phone}
                      onChange={(e) => handleReferenceChange(index, 'phone', e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors border-gray-300"
                    />
                    <input
                      type="text"
                      placeholder="Relación"
                      value={reference.relationship}
                      onChange={(e) => handleReferenceChange(index, 'relationship', e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors border-gray-300"
                    />
                  </div>
                ))}
                {errors.references && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.references}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-60"
              >
                <Save size={18} />
                {isSubmitting ? 'Guardando...' : 'Guardar información'}
              </button>
              {embedded && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 border border-gray-200 px-6 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
