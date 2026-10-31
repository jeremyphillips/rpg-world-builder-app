import { z } from 'zod'

export const GRANT_ROW_ID_PREFIX = 'grt_' as const

/**
 * Explicit seed ids. Readable slugs, unique within the owning trait, feature,
 * or heritage option. Seed authors assign them once and never reuse a deleted id.
 */
export const GRANT_ROW_SEED_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Opaque authored ids. Allocated on create and never reused. */
export const GRANT_ROW_OPAQUE_ID_PATTERN =
  /^grt_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export const grantRowIdSchema = z.union([
  z.string().regex(GRANT_ROW_SEED_ID_PATTERN),
  z.string().regex(GRANT_ROW_OPAQUE_ID_PATTERN),
])

export type GrantRowId = z.infer<typeof grantRowIdSchema>

type GlobalWithWebCrypto = typeof globalThis & {
  crypto?: {
    randomUUID?: () => string
  }
}

function createDefaultGrantRowUuid(): string {
  const cryptoApi = (globalThis as GlobalWithWebCrypto).crypto
  if (typeof cryptoApi?.randomUUID !== 'function') {
    throw new Error('crypto.randomUUID is required to allocate grant row ids.')
  }
  return cryptoApi.randomUUID()
}

export function createGrantRowId(createId: () => string = createDefaultGrantRowUuid): string {
  return `${GRANT_ROW_ID_PREFIX}${createId()}`
}

export function isSeedGrantRowId(id: string): boolean {
  return GRANT_ROW_SEED_ID_PATTERN.test(id)
}

export function isOpaqueGrantRowId(id: string): boolean {
  return GRANT_ROW_OPAQUE_ID_PATTERN.test(id)
}
