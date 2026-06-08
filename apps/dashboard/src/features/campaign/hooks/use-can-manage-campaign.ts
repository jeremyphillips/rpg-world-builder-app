import { useSession } from '@/features/auth'
import { useCampaigns } from './use-campaigns'

/**
 * Returns true when the current user has manage-level access to the given
 * campaign (i.e. they are the campaign owner).
 *
 * TODO: expand to co-owner when a membership endpoint is available.
 */
export function useCanManageCampaign(campaignId: string | undefined): boolean {
  const { data: user } = useSession()
  const { data: campaigns } = useCampaigns()

  if (!campaignId) return false

  const campaign = campaigns?.find((c) => c.id === campaignId)
  if (!campaign || !user) return false

  return campaign.createdBy === user.id
}
