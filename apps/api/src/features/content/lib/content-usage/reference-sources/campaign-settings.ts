import type { ContentUsageBlocker } from '@rpg/contracts'
import { CAMPAIGN_PRIMARY_WORLD_RULE_CODE, USAGE_BLOCKER_SOURCE_KEYS } from '@rpg/contracts'

import { CampaignModel } from '../../../../campaign'
import type { ContentUsageResolverContext } from '../content-usage-context'

type CampaignPrimaryWorldRecord = {
  identity: { name: string }
  configuration?: {
    settings?: {
      primaryWorldId?: string
    }
  }
}

/** Indexes worlds referenced as a campaign's primary world for deletion blockers. */
export async function indexCampaignPrimaryWorldBlockersByContentId(
  ctx: Pick<ContentUsageResolverContext, 'campaignId'>,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const doc = await CampaignModel.findById(ctx.campaignId)
    .select('identity.name configuration.settings.primaryWorldId')
    .lean<CampaignPrimaryWorldRecord>()

  const primaryWorldId = doc?.configuration?.settings?.primaryWorldId
  if (!doc || !primaryWorldId) {
    return new Map()
  }

  const blocker: ContentUsageBlocker = {
    kind: 'rule',
    code: CAMPAIGN_PRIMARY_WORLD_RULE_CODE,
    message: `Set as the primary world for campaign "${doc.identity.name}".`,
    sourceKey: USAGE_BLOCKER_SOURCE_KEYS.campaign_primary_world,
  }

  return new Map([[primaryWorldId, [blocker]]])
}
