import { CROSS_APP_PATHS } from '@rpg/contracts'

export const ROUTES = {
  home: '/',
  login: CROSS_APP_PATHS.login,
  signup: CROSS_APP_PATHS.signup,
} as const
