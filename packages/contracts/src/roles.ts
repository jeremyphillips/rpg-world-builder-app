import { z } from 'zod'

/**
 * All user roles in the system. Ordered loosely from least to most privileged,
 * but treat membership/permission checks explicitly rather than by index.
 */
export const ROLES = ['pc', 'dm', 'co-dm', 'admin', 'superadmin', 'observer'] as const

export const roleSchema = z.enum(ROLES)

export type Role = z.infer<typeof roleSchema>
