import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type ResolvedContentCampaignAccess,
} from './campaign-access'

/** Minimal row shape for content resolution predicates. */
export type ContentResolutionRow = {
  status?: string
  campaignAccess?: ResolvedContentCampaignAccess
}

function resolveCampaignAccess(row: ContentResolutionRow): ResolvedContentCampaignAccess {
  return row.campaignAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS
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
