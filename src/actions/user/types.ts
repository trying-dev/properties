import { DocumentType, Gender, MaritalStatus, AdminLevel } from '@prisma/client'

export interface userSelected {
  id: string
  email: string
  emailVerified?: Date | null
  phone?: string | null
  phoneVerified?: Date | null

  // password?: string // Hash de la contraseña (bcrypt)
  // resetPasswordToken?: string
  // resetPasswordExpiresAt?: Date | null
  // resetPasswordUsed?: boolean // @default(false)
  // verificationCode?: string
  // verificationCodeExpiresAt?: Date | null

  name: string
  lastName: string
  birthDate?: Date | null
  birthPlace?: string | null

  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postalCode?: string | null

  documentType?: DocumentType | null
  documentNumber?: string | null

  gender?: Gender | null
  maritalStatus?: MaritalStatus | null
  profession?: string | null
  monthlyIncome?: number | null

  profileImage?: string | null

  disable?: boolean
  timezone?: string
  language?: string

  emailNotifications?: boolean
  smsNotifications?: boolean

  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
  lastLoginAt?: Date | null

  // admin?: Admin
  // tenant?: Tenant

  // additionalContracts?: Contract[] // Contratos donde es residente adicional
}

export const userSelection = {
  id: true,
  email: true,
  emailVerified: true,
  phone: true,
  phoneVerified: true,

  name: true,
  lastName: true,
  birthDate: true,
  birthPlace: true,

  address: true,
  city: true,
  state: true,
  country: true,
  postalCode: true,

  documentType: true,
  documentNumber: true,

  gender: true,
  maritalStatus: true,
  profession: true,
  monthlyIncome: true,

  profileImage: true,

  disable: true,
  timezone: true,
  language: true,

  emailNotifications: true,
  smsNotifications: true,

  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  lastLoginAt: true,
}

export interface Admin {
  id: string
  //   userId: string
  adminLevel: AdminLevel

  //   user: User
  //   createdBy?: Admin
  //   created: Admin[]

  //   properties: Property[]
  //   contracts: Contract[]
  //   processes: Process[]

  //   createdAt: Date
  //   updatedAt: Date
}

export const adminSelection = {
  id: true,
  adminLevel: true,
}

export interface Tenant {
  id: string
  //   userId: string
  profile?: string | null
  //   emergencyContact?: string
  //   emergencyContactPhone?: string
  //   employmentStatus?: EmploymentStatus
  //   monthlyIncome?: number

  //   references?: Reference[]
  //   user?: User
  //   contracts?: Contract[]
  //   processes?: Process[]
  //   registrationToken?: string
  //   registrationTokenExpires?: Date
  //   createdAt: Date
  //   updatedAt: Date
}

export const tenantSelection = {
  id: true,
  profile: true,
}

export type Roleuser = 'admin' | 'tenant'

type SerializableDate = string | null

type DateFields = 'emailVerified' | 'phoneVerified' | 'birthDate' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'lastLoginAt'

type UserSerializableDate = {
  emailVerified?: SerializableDate
  phoneVerified?: SerializableDate

  birthDate?: SerializableDate

  createdAt?: SerializableDate
  updatedAt?: SerializableDate
  deletedAt?: SerializableDate
  lastLoginAt?: SerializableDate
}

export interface UserForRedux extends Omit<userSelected, DateFields>, UserSerializableDate {
  role: Roleuser
  admin?: Admin | null
  tenant?: Tenant | null
}
