import type { ContentMediaDomain, ContentTypeKey } from '@rpg/contracts'
import { resolveContentMediaDomainForContentType } from '@rpg/contracts'

export type ManagedMediaFormDefFields = {
  supportsManagedMedia: true
  mediaDomain: ContentMediaDomain
}

/** Registers managed-media capability on catalog content form defs when opted in. */
export function managedMediaFormDefFields(
  routeKey: ContentTypeKey,
): ManagedMediaFormDefFields | Record<string, never> {
  const mediaDomain = resolveContentMediaDomainForContentType(routeKey)
  if (!mediaDomain) {
    return {}
  }
  return { supportsManagedMedia: true, mediaDomain }
}
