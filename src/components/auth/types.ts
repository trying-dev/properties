export type AuthActionState = {
  success: boolean
  errors?: Record<string, string[]> | undefined
  redirectTo?: string
}

export const authInitialState: AuthActionState = {
  success: false,
  errors: undefined,
}
