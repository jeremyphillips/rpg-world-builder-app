import { IndexPageIntro } from '@/components/layout/index-page-intro'
import { NarrowPage } from '@/components/layout/narrow-page'
import { useCampaigns } from '@/features/campaign'
import { usePendingCampaignInvites } from '@/features/campaign-invite'

import { NewCampaignLink } from '../components/new-campaign-link.client'
import { hasCampaignRows } from '../lib/campaign-list-view.lib'
import {
  resolveCampaignsOverviewDescription,
  resolveCampaignsOverviewViewState,
} from '../lib/campaigns-overview-view'
import { CAMPAIGNS_OVERVIEW_COPY } from '../lib/campaigns-overview-copy'
import { CampaignsOverviewBody } from './campaigns-overview-body'

/** Global campaigns index — list, select, and resume campaigns. */
export function CampaignsOverview() {
  const { data: campaigns, isPending, isError } = useCampaigns()
  const {
    data: pendingInvites,
    isPending: pendingInvitesPending,
    isError: pendingInvitesError,
  } = usePendingCampaignInvites()

  const viewState = resolveCampaignsOverviewViewState({
    isPending: isPending || pendingInvitesPending,
    isError,
    campaigns,
  })
  const description = resolveCampaignsOverviewDescription(viewState, CAMPAIGNS_OVERVIEW_COPY)
  const campaignRowsPresent = hasCampaignRows(campaigns)

  const newCampaignAction = (
    <NewCampaignLink variant={campaignRowsPresent ? 'outline' : 'default'} />
  )

  return (
    <NarrowPage spacing="relaxed">
      <IndexPageIntro
        title="Campaigns"
        description={description}
        actions={newCampaignAction}
        showActionsInHeader={viewState === 'populated'}
      />

      <CampaignsOverviewBody
        viewState={viewState}
        campaigns={campaigns}
        pendingInvites={pendingInvitesError ? undefined : pendingInvites}
        newCampaignAction={newCampaignAction}
      />
    </NarrowPage>
  )
}
