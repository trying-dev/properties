export type AuthActionState = {
  success: boolean
  errors?: Record<string, string[]> | undefined
}

export const authInitialState: AuthActionState = {
  success: false,
  errors: undefined,
}
