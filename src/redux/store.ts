import { UserForRedux } from '+/actions/user/types'
import { ProfileId } from '+/app/aplication/_/types'

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
      documentType: '' as '' | 'CC' | 'CE' | 'TI' | 'PASSPORT' | 'NIT' | 'OTHER',
      documentNumber: '',
      gender: '' as '' | 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY',
      maritalStatus: '' as '' | 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | 'COMMON_LAW',
      profession: '',
      monthlyIncome: '',
    },
    uploadedDocs: {} as Record<string, FileList | File[] | undefined>,
  },
}

export type InitialState = typeof initialState
export type State = InitialState
