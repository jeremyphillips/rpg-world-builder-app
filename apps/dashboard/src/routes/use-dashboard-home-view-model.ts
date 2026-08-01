import { hasCampaignRows, useCampaigns } from '@/features/campaign'
import { usePendingCampaignInvites } from '@/features/campaign-invite'
import { useSession } from '@/features/auth'
import { useCharacters } from '@/features/character'

import {
  resolveDashboardHomeSections,
  resolveDashboardHomeShowAllCampaignsLink,
  type DashboardHomeSection,
} from './dashboard-home-sections.lib'
import { resolveDashboardWelcomeCopy } from './dashboard-home-welcome.lib'

export function useDashboardHomeViewModel() {
  const { data: session, isPending: sessionPending } = useSession()
  const { data: campaigns, isPending: campaignsPending, isError: campaignsError } = useCampaigns()
  const {
    data: pendingInvites,
    isPending: pendingInvitesPending,
    isError: pendingInvitesError,
  } = usePendingCampaignInvites()
  const {
    data: characters,
    isPending: charactersPending,
    isError: charactersError,
  } = useCharacters()

  const isPending = sessionPending || campaignsPending || charactersPending || pendingInvitesPending
  const inventoryUnavailable = campaignsError || charactersError
  const campaignRowsPresent = inventoryUnavailable ? false : hasCampaignRows(campaigns)
  const hasCharacters = inventoryUnavailable ? false : Boolean(characters?.length)
  const sections = resolveDashboardHomeSections({
    campaigns,
    pendingInvites: pendingInvitesError ? undefined : pendingInvites,
    campaignsError,
    user: session?.user,
  })

  return {
    isPending,
    welcome: resolveDashboardWelcomeCopy({
      hasCampaigns: campaignRowsPresent,
      hasCharacters,
      displayName: session?.user?.displayName,
      inventoryUnavailable,
    }),
    sections,
    campaignsError,
    showAllCampaignsLink: resolveDashboardHomeShowAllCampaignsLink(campaigns, campaignsError),
    campaignRowsPresent,
  }
}

export type DashboardHomeViewModel = {
  isPending: boolean
  welcome: ReturnType<typeof resolveDashboardWelcomeCopy>
  sections: DashboardHomeSection[]
  campaignsError: boolean
  showAllCampaignsLink: boolean
  campaignRowsPresent: boolean
}
