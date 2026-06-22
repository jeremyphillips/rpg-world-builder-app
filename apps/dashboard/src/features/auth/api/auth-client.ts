import { fetchSession, logout } from '@rpg/api-client'
import { CROSS_APP_PATHS } from '@rpg/contracts'

/** @deprecated Prefer `CROSS_APP_PATHS.login` from `@rpg/contracts`. */
export const LOGIN_PATH = CROSS_APP_PATHS.login

export { fetchSession, logout }
