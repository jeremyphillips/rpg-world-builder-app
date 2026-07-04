import type { ResolvedCampaignRules } from '@rpg/contracts'

import { defaultCampaignRules } from '../form-options/content-campaign-rules'
import type { ContentFormCtx } from '../forms/content-form-registry'

export const TEST_CAMPAIGN_ID = 'camp_1'

/**
 * ContentFormCtx fixture for tab/panel tests: campaign id + default campaign
 * rules, both overridable.
 *
 * @example
 * makeContentFormCtx({ campaignRules: { subclassing: { enabled: false } } })
 */
export function makeContentFormCtx(
  overrides: Omit<Partial<ContentFormCtx>, 'campaignRules'> & {
    campaignRules?: Partial<ResolvedCampaignRules>
  } = {},
): ContentFormCtx {
  const { campaignRules, ...rest } = overrides
  return {
    campaignId: TEST_CAMPAIGN_ID,
    campaignRules: { ...defaultCampaignRules(), ...campaignRules },
    ...rest,
  }
}
