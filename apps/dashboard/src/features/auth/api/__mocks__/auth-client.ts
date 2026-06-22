import { vi, type Mock } from 'vitest'
import { CROSS_APP_PATHS } from '@rpg/contracts'

export const fetchSession: Mock = vi.fn()
export const logout: Mock = vi.fn()
export const LOGIN_PATH = CROSS_APP_PATHS.login
