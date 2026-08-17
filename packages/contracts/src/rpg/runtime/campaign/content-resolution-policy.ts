import type { ContentViewer } from '../../campaign/campaign-content-viewer'
import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type ResolvedContentCampaignAccess,
} from '../../content/lib/campaign-access'

import type { ContentPlayActor } from './content-play-actor'
import { isContentDiscoverableForViewer } from './content-viewer-discovery'

/** Minimal row shape for content resolution predicates. */
export type ContentResolutionRow = {
  status?: string
  campaignAccess?: ResolvedContentCampaignAccess
}

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

/** Whether content is stable enough to create a new authored relationship. */
export function isContentReferenceable(row: ContentResolutionRow): boolean {
  return row.status !== 'draft'
}

/** Whether referenceable content is enabled for use in this campaign (availability on). */
export function isContentCampaignEligible(row: ContentResolutionRow): boolean {
  if (!isContentReferenceable(row)) {
    return false
  }

  const access = resolveCampaignAccess(row)
  return access.available !== false && access.effectiveAudience !== 'none'
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
