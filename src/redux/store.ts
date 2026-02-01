import type { AvailableUnit } from '+/actions/nuevo-proceso'
import { UserForRedux } from '+/actions/user/types'
import { DocumentType, Gender, MaritalStatus, ProfileId, SecurityFieldValue } from '+/app/aplication/_/types'

export const initialState = {
  auth: {
    isAuthenticated: false,
    loginState: 'idle' as 'idle' | 'start' | 'loading' | 'success',
    registerState: 'idle' as 'idle' | 'start' | 'loading' | 'success',
    codeVerificationState: 'idle' as 'idle' | 'start' | 'loading' | 'success',
    resetPasswordModalOpen: false,
    authModalOpen: false,
    authModalTab: 'login' as 'login' | 'register',
    verificationExpiresAt: null as number | null,
  },
  user: null as UserForRedux | null,
  property: {},
  home: {
    units: [] as AvailableUnit[],
    showFilters: false,
    searchQuery: '',
    filters: {
      priceMax: '',
      bedrooms: '',
      city: '',
    },
  },
  process: {
    processId: null as string | null,
    tenantId: null as string | null,
    unitId: null as string | null,
    profile: '' as ProfileId | '',
    step: 1,
    selectedSecurity: '' as string,
    acceptedDeposit: false,
    basicInfo: {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: '',
      birthPlace: '',
      documentType: undefined as DocumentType | undefined,
      documentNumber: '',
      gender: undefined as Gender | undefined,
      maritalStatus: undefined as MaritalStatus | undefined,
      profession: '',
      monthlyIncome: '',
    },
    uploadedDocs: {} as Record<string, FileList | File[] | undefined>,
    securityFields: {} as Record<string, SecurityFieldValue>,
  },
}

export type InitialState = typeof initialState
export type State = InitialState
