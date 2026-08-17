import {
  isPlayCatalogScopeQuery,
  parsePlayActorCharacterIdQuery,
  requirePlayActorFromQuery,
} from '@rpg/contracts'
import type { Request } from 'express'

import { HttpError } from '../../../lib/http-error'
import type { CatalogListFilter } from './apply-catalog-list-filter'
import { authorizePlayActorCharacterId } from './authorize-play-actor-character-id'
import type { CatalogMembershipFilterInput } from './filter-catalog-for-viewer'

/** Membership + optional play-actor query scope for discovery catalog list filtering. */
export function resolveCatalogMembershipFilter(
  req: Pick<Request, 'campaignMembership' | 'query'>,
): CatalogMembershipFilterInput | undefined {
  const filter = resolveCatalogListFilter(req)
  if (!filter || filter.mode !== 'discovery') {
    return undefined
  }
  return filter.membership
}

/** Resolves discovery vs play-catalog filtering for campaign content list routes. */
export function resolveCatalogListFilter(
  req: Pick<Request, 'campaignMembership' | 'query'>,
): CatalogListFilter | undefined {
  if (!req.campaignMembership) {
    return undefined
  }

  if (isPlayCatalogScopeQuery(req.query)) {
    const parsed = requirePlayActorFromQuery(req.query)
    if (!parsed.ok) {
      throw new HttpError(400, 'invalid_request', parsed.error.message)
    }

    const authorized = authorizePlayActorCharacterId({
      playActor: parsed.playActor,
      pcCharacterIds: req.campaignMembership.pcCharacterIds,
    })
    if (!authorized.ok) {
      throw new HttpError(
        403,
        'forbidden',
        'Not authorized to act for the requested play actor character.',
      )
    }

    return {
      mode: 'play',
      membership: req.campaignMembership,
      playActor: parsed.playActor,
    }
  }

  return {
    mode: 'discovery',
    membership: {
      ...req.campaignMembership,
      playActorCharacterId: parsePlayActorCharacterIdQuery(req.query),
    },
  }
}
