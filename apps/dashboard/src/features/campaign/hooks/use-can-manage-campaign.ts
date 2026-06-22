import { CAMPAIGN_MANAGE_ROLES } from '@rpg/contracts'

import { useSession } from '@/features/auth'
import { useCampaigns } from './use-campaigns'

/**
 * Returns true when the current user can manage the given campaign — owner or
 * co-owner membership (matches API content write guards).
 */
export function useCanManageCampaign(campaignId: string | undefined): boolean {
  const { data: session } = useSession()
  const user = session?.user
  const { data: campaigns } = useCampaigns()

  if (!campaignId || !user) return false

  const campaign = campaigns?.find((c) => c.id === campaignId)
  if (!campaign) return false

  return CAMPAIGN_MANAGE_ROLES.includes(
    campaign.campaignRole as (typeof CAMPAIGN_MANAGE_ROLES)[number],
  )
}
