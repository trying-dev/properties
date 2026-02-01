'use client'

import { profiles } from './profiles'
import { Field, ProfileId, UploadedDocsState } from './types'

// ==================== COMPONENTES DE FORMULARIO ====================

/**
 * Campo de texto genérico
 */
interface TextInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'tel' | 'number' | 'date'
  placeholder?: string
  required?: boolean
}

export const TextInput = ({ label, value, onChange, type = 'text', placeholder, required = true }: TextInputProps) => (
  <label className="flex flex-col gap-2 text-sm text-gray-700">
    <span className="font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder={placeholder}
    />
  </label>
)

interface SelectOption {
  value: string
  label: string
}

interface SelectInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  showPlaceholder?: boolean
}

export const SelectInput = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecciona una opción',
  required = true,
  showPlaceholder = true,
}: SelectInputProps) => (
  <label className="flex flex-col gap-2 text-sm text-gray-700">
    <span className="font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
    >
      {showPlaceholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
)

/**
 * Campo de subida de archivos
 */
interface FileUploadFieldProps {
  field: Field
  uploadedFiles: FileList | File[] | undefined
  onFileChange: (fieldId: string, files: FileList | null) => void
}

const FileUploadField = ({ field, uploadedFiles, onFileChange }: FileUploadFieldProps) => {
  const fileCount = uploadedFiles?.length ?? 0
  const fileArray = uploadedFiles ? Array.from(uploadedFiles) : []

  // Solo aplicar si el field tiene estas propiedades
  const isMultiple = 'multiple' in field ? field.multiple : false
  const acceptTypes = 'accept' in field ? field.accept : undefined
  const isRequired = field.required !== false

  return (
    <label className={`flex flex-col gap-2 text-sm text-gray-700 ${isMultiple ? 'md:col-span-2' : ''}`}>
      <span className="font-medium">
        {field.label} {isRequired && <span className="text-red-500">*</span>}
      </span>

      <div className="relative">
        <input
          type="file"
          accept={acceptTypes}
          multiple={isMultiple}
          onChange={(e) => onFileChange(field.id, e.target.files)}
          className="hidden"
          id={field.id}
        />
        <label
          htmlFor={field.id}
          className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-gray-600">{fileCount > 0 ? `${fileCount} archivo(s) seleccionado(s)` : 'Haz clic para subir archivo'}</span>
        </label>

        {fileCount > 0 && (
          <div className="mt-2 space-y-1">
            {fileArray.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="truncate">{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </label>
  )
}

/**
 * Campo de checkbox genérico
 */
interface CheckboxFieldProps {
  field: Field
}

const CheckboxField = ({ field }: CheckboxFieldProps) => (
  <label className="flex items-center gap-3 text-sm text-gray-700 md:col-span-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
    <span>{field.label}</span>
  </label>
)

/**
 * Campo dinámico simple (text, tel, etc)
 */
interface SimpleFieldProps {
  field: Field
}

const SimpleField = ({ field }: SimpleFieldProps) => (
  <label className="flex flex-col gap-2 text-sm text-gray-700">
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

// ==================== SECCIONES DEL FORMULARIO ====================

/**
 * Sección 2: Documentos Requeridos
 */
interface DocumentsSectionProps {
  profile: ProfileId
  uploadedDocs: UploadedDocsState
  onFileChange: (fieldId: string, files: FileList | null) => void
}

export const DocumentsSection = ({ profile, uploadedDocs, onFileChange }: DocumentsSectionProps) => {
  const fields = profiles[profile].fields

  const renderDynamicField = (field: Field) => {
    if (field.type === 'file') {
      return <FileUploadField key={field.id} field={field} uploadedFiles={uploadedDocs[field.id]} onFileChange={onFileChange} />
    }

    if (field.type === 'checkbox') {
      return <CheckboxField key={field.id} field={field} />
    }

    // Para los demás tipos de campos (text, tel, number, etc.)
    if (['text', 'tel', 'number'].includes(field.type)) {
      return <SimpleField key={field.id} field={field} />
    }

    return null
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 font-bold">2</span>
        </div>
        Documentos Requeridos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">{fields.map(renderDynamicField)}</div>
    </div>
  )
}

/**
 * Sección 3: Confirmación de Depósito
 */
interface DepositConfirmationProps {
  deposit: string
  acceptedDeposit: boolean
  onAcceptChange: (accepted: boolean) => void
}

export const DepositConfirmation = ({ deposit, acceptedDeposit, onAcceptChange }: DepositConfirmationProps) => {
  return (
    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="text-2xl">⚠️</span>
        Confirmación de Depósito
      </h4>
      <p className="text-gray-700 mb-4">
        El depósito mínimo requerido es de <strong className="text-yellow-800 text-lg">{deposit}</strong>
      </p>
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={acceptedDeposit}
          onChange={(e) => onAcceptChange(e.target.checked)}
          className="mt-1 w-5 h-5 text-blue-600 rounded cursor-pointer"
        />
        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">Acepto y estoy de acuerdo con el depósito mínimo requerido</span>
      </label>
    </div>
  )
}
