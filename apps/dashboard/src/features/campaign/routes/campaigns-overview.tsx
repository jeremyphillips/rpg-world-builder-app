import { Link } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'

import { IndexPageIntro } from '@/components/layout/index-page-intro'
import { NarrowPage } from '@/components/layout/narrow-page'
import { ROUTES } from '@/app/routes'
import { useCampaigns, useOpenCampaign } from '@/features/campaign'

import {
  resolveCampaignsOverviewDescription,
  resolveCampaignsOverviewViewState,
} from '../lib/campaigns-overview-view'
import { CAMPAIGNS_OVERVIEW_COPY } from '../lib/campaigns-overview-copy'
import { CampaignsOverviewBody } from './campaigns-overview-body'

/** Global campaigns index — list, select, and resume campaigns. */
export function CampaignsOverview() {
  const { data: campaigns, isPending, isError } = useCampaigns()
  const openCampaign = useOpenCampaign()

  const viewState = resolveCampaignsOverviewViewState({ isPending, isError, campaigns })
  const description = resolveCampaignsOverviewDescription(viewState, CAMPAIGNS_OVERVIEW_COPY)

  const newCampaignAction = (
    <Link to={ROUTES.campaign.create} className={buttonVariants({ variant: 'default' })}>
      {CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel}
    </Link>
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
        newCampaignAction={newCampaignAction}
        onSelect={openCampaign}
      />
    </NarrowPage>
  )
}
