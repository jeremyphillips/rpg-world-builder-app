import {
  isPlayCatalogScopeQuery,
  isReferenceCatalogScopeQuery,
  parsePlayActorCharacterIdQuery,
  requirePlayActorFromQuery,
} from '@rpg/contracts'
import type { Request } from 'express'

import { HttpError } from '../../../lib/http-error'
import type { CatalogListFilter } from './apply-catalog-list-filter'
import { authorizePlayActorCharacterId } from './authorize-play-actor-character-id'
/** Resolves discovery, reference, or play-catalog filtering for campaign content list routes. */
export function resolveCatalogListFilter(
  req: Pick<Request, 'campaignMembership' | 'query'>,
): CatalogListFilter | undefined {
  if (!req.campaignMembership) {
    return undefined
  }

  if (isReferenceCatalogScopeQuery(req.query)) {
    return {
      mode: 'reference',
      membership: req.campaignMembership,
    }
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
