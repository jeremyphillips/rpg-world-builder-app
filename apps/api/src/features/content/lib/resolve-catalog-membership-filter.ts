import { parsePlayActorCharacterIdQuery } from '@rpg/contracts'
import type { Request } from 'express'

import type { CatalogMembershipFilterInput } from './filter-catalog-for-viewer'

/** Membership + optional play-actor query scope for catalog list filtering. */
export function resolveCatalogMembershipFilter(
  req: Pick<Request, 'campaignMembership' | 'query'>,
): CatalogMembershipFilterInput | undefined {
  if (!req.campaignMembership) {
    return undefined
  }

  return {
    ...req.campaignMembership,
    playActorCharacterId: parsePlayActorCharacterIdQuery(req.query),
  }
}
