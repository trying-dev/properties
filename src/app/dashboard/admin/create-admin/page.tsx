'use client'

import {
  useState,
  useCallback,
  useMemo,
  type ChangeEvent,
  type ComponentType,
  type InputHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { createAdmin } from '+/actions/admin'

type DocumentType = 'CC' | 'CE' | 'TI' | 'PASSPORT' | 'OTHER'
type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | 'COMMON_LAW'
type AdminLevel = 'STANDARD' | 'MANAGER' | 'LIMITED'
type Language = 'es' | 'en' | 'pt'

type Option = {
  value: string
  label: string
  description?: string
}

type ValidationErrors = Partial<Record<keyof FormData | 'submit', string>>

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ComponentType<{ className?: string }>
  error?: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[]
  error?: string
  placeholder?: string
}

interface FormSectionProps {
  title: string
  icon?: ComponentType<{ className?: string }>
  children: ReactNode
}

const DOCUMENT_TYPES: Option[] = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'OTHER', label: 'Otro' },
] as const

const GENDER_OPTIONS: Option[] = [
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Femenino' },
  { value: 'OTHER', label: 'Otro' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefiero no decir' },
] as const

const MARITAL_STATUS_OPTIONS: Option[] = [
  { value: 'SINGLE', label: 'Soltero/a' },
  { value: 'MARRIED', label: 'Casado/a' },
  { value: 'DIVORCED', label: 'Divorciado/a' },
  { value: 'WIDOWED', label: 'Viudo/a' },
  { value: 'SEPARATED', label: 'Separado/a' },
  { value: 'COMMON_LAW', label: 'Unión libre' },
] as const

const ADMIN_LEVEL_OPTIONS: Option[] = [
  { value: 'STANDARD', label: 'Estándar', description: 'Permisos básicos' },
  { value: 'MANAGER', label: 'Gerente', description: 'Permisos avanzados' },
  { value: 'LIMITED', label: 'Limitado', description: 'Permisos restringidos' },
] as const

const TIMEZONE_OPTIONS: Option[] = [
  { value: 'America/Bogota', label: 'America/Bogota (GMT-5)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid (GMT+1)' },
  { value: 'America/Mexico_City', label: 'America/Mexico_City (GMT-6)' },
] as const

const LANGUAGE_OPTIONS: Option[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
] as const

const INITIAL_FORM_DATA = {
  email: '',
  name: '',
  lastName: '',
  phone: '',
  birthDate: '',
  birthPlace: '',
  address: '',
  city: '',
  state: '',
  country: 'Colombia',
  postalCode: '',
  documentType: 'CC' as DocumentType,
  documentNumber: '',
  gender: '' as Gender | '',
  maritalStatus: '' as MaritalStatus | '',
  profession: '',
  adminLevel: 'STANDARD' as AdminLevel,
  timezone: 'America/Bogota',
  language: 'es' as Language,
  emailNotifications: true,
  smsNotifications: false,
  temporaryPassword: '',
  confirmPassword: '',
}

type FormData = typeof INITIAL_FORM_DATA

const FormField = ({ label, error, required, children }: FormFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </p>
    )}
  </div>
)

const Input = ({ icon: Icon, error, className = '', ...props }: InputProps) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />}
    <input
      className={`${Icon ? 'pl-10' : ''} w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
        error ? 'border-red-500' : 'border-gray-300'
      } ${className}`}
      {...props}
    />
  </div>
)

const Select = ({ options, error, placeholder, ...props }: SelectProps) => (
  <select
    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      error ? 'border-red-500' : 'border-gray-300'
    }`}
    {...props}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(({ value, label, description }) => (
      <option key={value} value={value}>
        {label}
        {description ? ` - ${description}` : ''}
      </option>
    ))}
  </select>
)

const FormSection = ({ title, icon: Icon, children }: FormSectionProps) => (
  <div>
    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
      {Icon && <Icon className="w-5 h-5 mr-2 text-blue-600" />}
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
)

export default function AdminCreationForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
  const [submitMessage, setSubmitMessage] = useState<string>('')

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target
      const isCheckbox = type === 'checkbox'
      const newValue = isCheckbox ? (e.target as HTMLInputElement).checked : value

      setFormData((prev) => ({ ...prev, [name]: newValue }))

      if (errors[name as keyof ValidationErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }))
      }
    },
    [errors]
  )

  const generatePassword = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    const password = Array.from({ length: 12 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('')

    setFormData((prev) => ({
      ...prev,
      temporaryPassword: password,
      confirmPassword: password,
    }))
  }, [])

  const validationErrors = useMemo<ValidationErrors>(() => {
    const newErrors: ValidationErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido'
    }

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido'
    if (!formData.documentNumber.trim()) newErrors.documentNumber = 'El número de documento es requerido'
    if (!formData.gender) newErrors.gender = 'El género es requerido'
    if (!formData.maritalStatus) newErrors.maritalStatus = 'El estado civil es requerido'

    if (!formData.temporaryPassword) {
      newErrors.temporaryPassword = 'La contraseña temporal es requerida'
    } else if (formData.temporaryPassword.length < 8) {
      newErrors.temporaryPassword = 'La contraseña debe tener al menos 8 caracteres'
    }

    if (formData.temporaryPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    return newErrors
  }, [formData])

  const handleSubmit = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      setErrors(validationErrors)
      if (Object.keys(validationErrors).length > 0) return

      setIsSubmitting(true)
      setErrors({})

      try {
        // Preparar datos para el server action
        const adminData = {
          email: formData.email,
          adminLevel: formData.adminLevel,
          temporaryPassword: formData.temporaryPassword,
          name: formData.name,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          birthDate: formData.birthDate || undefined,
          birthPlace: formData.birthPlace || undefined,
          profession: formData.profession || undefined,
          gender: formData.gender as Gender,
          maritalStatus: formData.maritalStatus as MaritalStatus,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          address: formData.address || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          country: formData.country,
          postalCode: formData.postalCode || undefined,
          timezone: formData.timezone,
          language: formData.language as Language,
          emailNotifications: formData.emailNotifications,
          smsNotifications: formData.smsNotifications,
        }

        const result = await createAdmin(adminData)

        if (result.success) {
          setSubmitSuccess(true)
          if (result.message) setSubmitMessage(result.message)

          // Reset form después de 3 segundos
          setTimeout(() => {
            setFormData(INITIAL_FORM_DATA)
            setSubmitSuccess(false)
            setSubmitMessage('')
            setErrors({})
            window.history.back()
          }, 3000)
        } else {
          setErrors({ submit: result.error })
        }
      } catch (error) {
        console.error('Error al crear administrador:', error)
        setErrors({ submit: 'Error interno del servidor. Intente nuevamente.' })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, validationErrors]
  )

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Administrador creado exitosamente!</h2>
            <p className="text-gray-600 mb-6">{submitMessage}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                Se ha enviado un email con las credenciales a {formData.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <header className="bg-blue-600 px-6 py-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Crear Administrador</h1>
                <p className="text-blue-100 text-sm">Complete los datos del nuevo administrador</p>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-8">
            {/* Información de Acceso */}
            <FormSection title="Información de Acceso" icon={Lock}>
              <FormField label="Email" error={errors.email} required>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  icon={Mail}
                  placeholder="admin@empresa.com"
                  error={errors.email}
                />
              </FormField>

              <FormField label="Nivel de Administrador" required>
                <Select
                  name="adminLevel"
                  value={formData.adminLevel}
                  onChange={handleInputChange}
                  options={ADMIN_LEVEL_OPTIONS}
                />
              </FormField>

              <FormField label="Contraseña Temporal" error={errors.temporaryPassword} required>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="temporaryPassword"
                      value={formData.temporaryPassword}
                      onChange={handleInputChange}
                      className={`w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.temporaryPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Contraseña temporal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Generar contraseña automática
                  </button>
                </div>
              </FormField>

              <FormField label="Confirmar Contraseña" error={errors.confirmPassword} required>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirmar contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </FormField>
            </FormSection>

            {/* Información Personal */}
            <FormSection title="Información Personal" icon={User}>
              <FormField label="Nombre" error={errors.name} required>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Juan"
                  error={errors.name}
                />
              </FormField>

              <FormField label="Apellido" error={errors.lastName} required>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Pérez"
                  error={errors.lastName}
                />
              </FormField>

              <FormField label="Teléfono">
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  icon={Phone}
                  placeholder="+57 300 123 4567"
                />
              </FormField>

              <FormField label="Fecha de Nacimiento">
                <Input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  icon={Calendar}
                />
              </FormField>

              <FormField label="Lugar de Nacimiento">
                <Input
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleInputChange}
                  placeholder="Bogotá, Colombia"
                />
              </FormField>

              <FormField label="Profesión">
                <Input
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  placeholder="Administrador de propiedades"
                />
              </FormField>

              <FormField label="Género" error={errors.gender} required>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  options={GENDER_OPTIONS}
                  placeholder="Seleccionar género"
                  error={errors.gender}
                />
              </FormField>

              <FormField label="Estado Civil" error={errors.maritalStatus} required>
                <Select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  options={MARITAL_STATUS_OPTIONS}
                  placeholder="Seleccionar estado civil"
                  error={errors.maritalStatus}
                />
              </FormField>
            </FormSection>

            {/* Documento de Identidad */}
            <FormSection title="Documento de Identidad">
              <FormField label="Tipo de Documento" required>
                <Select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  options={DOCUMENT_TYPES}
                />
              </FormField>

              <FormField label="Número de Documento" error={errors.documentNumber} required>
                <Input
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                  error={errors.documentNumber}
                />
              </FormField>
            </FormSection>

            {/* Dirección */}
            <FormSection title="Dirección" icon={MapPin}>
              <div className="md:col-span-2">
                <FormField label="Dirección">
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Calle 123 #45-67"
                  />
                </FormField>
              </div>

              <FormField label="Ciudad">
                <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="Bogotá" />
              </FormField>

              <FormField label="Departamento/Estado">
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Cundinamarca"
                />
              </FormField>

              <FormField label="País">
                <Input name="country" value={formData.country} onChange={handleInputChange} />
              </FormField>

              <FormField label="Código Postal">
                <Input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="110111"
                />
              </FormField>
            </FormSection>

            {/* Configuraciones */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuraciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Zona Horaria">
                  <Select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    options={TIMEZONE_OPTIONS}
                  />
                </FormField>

                <FormField label="Idioma">
                  <Select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    options={LANGUAGE_OPTIONS}
                  />
                </FormField>
              </div>

              {/* Notificaciones */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Preferencias de Notificaciones</h4>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                    />
                    <span className="ml-2 text-sm text-gray-700">Notificaciones por email</span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="smsNotifications"
                      checked={formData.smsNotifications}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                    />
                    <span className="ml-2 text-sm text-gray-700">Notificaciones por SMS</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Error de envío */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creando Administrador...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Crear Administrador
                  </>
                )}
              </button>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Información importante:</p>
                  <ul className="space-y-1 text-blue-600">
                    <li>• Se enviará un email con las credenciales de acceso</li>
                    <li>• El administrador deberá cambiar su contraseña en el primer inicio de sesión</li>
                    <li>• Los permisos pueden ser modificados posteriormente desde la configuración</li>
                    <li>• El nuevo administrador tendrá acceso según el nivel asignado</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
