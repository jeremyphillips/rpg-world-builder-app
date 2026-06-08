import { vi, type Mock } from 'vitest'

export const fetchSession: Mock = vi.fn()
export const logout: Mock = vi.fn()
export const LOGIN_PATH = '/login'
