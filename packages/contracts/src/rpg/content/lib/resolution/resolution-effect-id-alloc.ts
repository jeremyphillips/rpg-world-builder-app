import { resolutionEffectIdSchema, type ResolutionEffectId } from './resolution-effect-id'

type GlobalWithWebCrypto = typeof globalThis & {
  crypto?: {
    randomUUID?: () => string
  }
}

function createDefaultResolutionEffectUuid(): string {
  const cryptoApi = (globalThis as GlobalWithWebCrypto).crypto
  if (typeof cryptoApi?.randomUUID !== 'function') {
    throw new Error('crypto.randomUUID is required to allocate resolution effect ids.')
  }
  return cryptoApi.randomUUID()
}

/** Opaque id, stable for the life of the definition. Not a reusable `${kind}-n` alias. */
export function nextResolutionEffectId(
  existingIds: readonly string[] = [],
  createId: () => string = createDefaultResolutionEffectUuid,
): ResolutionEffectId {
  const taken = new Set(existingIds)
  let id = createId()
  while (taken.has(id)) id = createId()
  return resolutionEffectIdSchema.parse(id)
}
