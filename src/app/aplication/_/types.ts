export type FieldType = 'file' | 'text' | 'tel' | 'checkbox' | 'number'

export type Field = {
  id: string
  label: string
  type: FieldType
  accept?: string
  multiple?: boolean
  required?: boolean
}

export type ProfileConfig = {
  emoji: string
  name: string
  deposit: string
  fields: Field[]
}

export type UploadedDocsState = Record<string, FileList | File[] | undefined>

export type SecurityOption = {
  id: string
  name: string
  description: string
  requirements: string
  fields: Field[]
}

export type DocumentType = 'cedula' | 'pasaporte'

export type ApplicantInfo = {
  fullName: string
  email: string
  phone: string
  documentType: DocumentType
  documentNumber: string
  monthlyIncome: string
}

export const profileIds = [
  'formal',
  'independent',
  'retired',
  'entrepreneur',
  'investor',
  'student',
  'foreignLocal',
  'nomad',
] as const

export type ProfileId = (typeof profileIds)[number]
