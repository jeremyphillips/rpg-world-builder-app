import type { ContentViewer } from '../../campaign/campaign-content-viewer'
import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type ResolvedContentCampaignAccess,
} from '../../content/lib/campaign-access'
import {
  isContentCampaignEligible,
  type ContentResolutionRow,
} from '../../content/lib/content-resolution-policy'

import type { ContentPlayActor } from './content-play-actor'
import { isContentDiscoverableForViewer } from './content-viewer-discovery'

export {
  isContentCampaignEligible,
  isContentReferenceable,
  type ContentResolutionRow,
} from '../../content/lib/content-resolution-policy'

function resolveCampaignAccess(row: ContentResolutionRow): ResolvedContentCampaignAccess {
  return row.campaignAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS
}

/**
 * Whether content may appear on viewer-scoped discovery surfaces (lists, overview,
 * search). Managers see drafts; non-managers are filtered by draft status and
 * {@link isContentDiscoverableForViewer}.
 */
export function isContentVisibleToViewer(
  row: ContentResolutionRow,
  viewer: ContentViewer,
): boolean {
  if (viewer.kind !== 'manage' && row.status === 'draft') {
    return false
  }

  return isContentDiscoverableForViewer(resolveCampaignAccess(row), viewer)
}

/**
 * Whether a row may be resolved on a read-only character sheet.
 * Managers see every row. Other viewers are limited to draft status and
 * visibility mode. Availability and audience are acquisition policy and are ignored.
 * This predicate never authorizes acquisition or play.
 */
export function isContentReferenceVisibleToViewer(
  row: ContentResolutionRow,
  viewer: ContentViewer,
): boolean {
  if (viewer.kind === 'manage') {
    return true
  }

  if (row.status === 'draft') {
    return false
  }

  const access = resolveCampaignAccess(row)

  switch (access.visibilityMode) {
    case 'all_players':
      return true
    case 'dm_only':
      return false
    case 'specific_players':
      return (
        viewer.kind === 'pc' &&
        viewer.characterIds.some((characterId) => access.participantIds.includes(characterId))
      )
    default: {
      const _exhaustive: never = access.visibilityMode
      return _exhaustive
    }
  }
}

/**
 * Whether campaign-eligible content may be consumed in character play for the
 * given play actor. Manage privilege does not bypass this predicate.
 */
export function isContentPlayableFor(
  row: ContentResolutionRow,
  playActor: ContentPlayActor,
): boolean {
  if (!isContentCampaignEligible(row)) {
    return false
  }

  const access = resolveCampaignAccess(row)

  switch (access.visibilityMode) {
    case 'all_players':
      return true
    case 'dm_only':
      return playActor.kind === 'npc'
    case 'specific_players':
      return playActor.kind === 'pc' && access.participantIds.includes(playActor.characterId)
    default: {
      const _exhaustive: never = access.visibilityMode
      return _exhaustive
    }
  }
}
