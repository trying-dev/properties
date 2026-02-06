export type FieldType = 'file' | 'text' | 'tel' | 'checkbox' | 'number' | 'email' | 'date'

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
export type SecurityFieldValue = string | boolean

export type SecurityOption = {
  id: string
  name: string
  requirements: string
  fields: Field[]
}

export type DocumentType = 'CC' | 'CE' | 'TI' | 'PASSPORT' | 'NIT' | 'OTHER'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | 'COMMON_LAW'

export type BasicInfo = {
  name: string
  lastName: string
  email: string
  phone?: string
  birthDate?: string
  birthPlace?: string
  documentType?: DocumentType
  documentNumber?: string
  gender?: Gender
  maritalStatus?: MaritalStatus
  profession?: string
  monthlyIncome: string
}

export const profileIds = ['EMPLOYED', 'INDEPENDENT', 'RETIRED', 'ENTREPRENEUR', 'INVESTOR', 'STUDENT', 'FOREIGN', 'NOMAD', 'UNEMPLOYED'] as const

export type ProfileId = (typeof profileIds)[number]
