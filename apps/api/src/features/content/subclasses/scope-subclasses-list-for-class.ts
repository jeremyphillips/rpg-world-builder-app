import type { CatalogOverlayListFailure, ResolvedSubclass, Subclass } from '@rpg/contracts'

import { findCampaignById } from '../../campaign'
import { HttpError } from '../../../lib/http-error'
import { attachCampaignAccessForTargetType } from '../lib/content-campaign-access.service'
import { loadSystemContent } from '../lib/content-type-config'
import { subclassContentConfig } from './subclasses.config'

export type SubclassListResolution = {
  items: Subclass[]
  overlayFailures: readonly CatalogOverlayListFailure[]
}

/**
 * Parent-scoped subclass list from an already-resolved campaign catalog.
 * Overlay failures are limited to system seed ids for {@link classId} (same contract as
 * `GET …/classes/:classId/subclasses`).
 */
export async function scopeSubclassesListForClass(
  campaignId: string,
  classId: string,
  resolution: SubclassListResolution,
): Promise<{ subclasses: ResolvedSubclass[]; overlayFailures: CatalogOverlayListFailure[] }> {
  const filtered = resolution.items.filter((subclass) => subclass.classId === classId)
  const withCampaignAccess = await attachCampaignAccessForTargetType(
    campaignId,
    'subclasses',
    filtered,
  )
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }
  const parentSeedIds = new Set(
    loadSystemContent(subclassContentConfig, campaign.rulesetId)
      .filter((row) => row.classId === classId)
      .map((row) => row.id),
  )
  return {
    subclasses: withCampaignAccess,
    overlayFailures: resolution.overlayFailures.filter((failure) =>
      parentSeedIds.has(failure.targetId),
    ),
  }
}
