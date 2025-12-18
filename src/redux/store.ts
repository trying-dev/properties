import { UserForRedux } from '+/actions/user/types'

export const initialState = {
  auth: {
    status: 'idle' as 'idle' | 'success' | 'verify',
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
  },
  application: {
    activeStep: 1,
    selectedProfile: '' as string,
    selectedSecurity: '' as string,
    acceptedDeposit: false,
    applicantInfo: {
      fullName: '',
      email: '',
      phone: '',
      documentType: 'cedula' as 'cedula' | 'pasaporte',
      documentNumber: '',
      monthlyIncome: '',
    },
    uploadedDocs: {} as Record<string, FileList | File[] | undefined>,
  },
}

export type InitialState = typeof initialState
export type State = InitialState
