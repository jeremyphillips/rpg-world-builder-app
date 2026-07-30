import { Link } from 'react-router-dom'
import { buttonVariants, Text } from '@rpg/ui'

import { IndexPageEmptyState, IndexPageIntro } from '@/components/layout/index-page-intro'
import { NarrowPage } from '@/components/layout/narrow-page'
import { ROUTES } from '@/app/routes'
import { CampaignPicker, useCampaigns, useOpenCampaign } from '@/features/campaign'

import { CAMPAIGNS_OVERVIEW_COPY } from '../lib/campaigns-overview-copy'

/** Global campaigns index — list, select, and resume campaigns. */
export function CampaignsOverview() {
  const { data: campaigns, isPending, isError } = useCampaigns()
  const openCampaign = useOpenCampaign()

  const hasCampaigns = campaigns !== undefined && campaigns.length > 0

  const newCampaignAction = (
    <Link to={ROUTES.campaign.create} className={buttonVariants({ variant: 'default' })}>
      {CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel}
    </Link>
  )

  return (
    <NarrowPage spacing="relaxed">
      <IndexPageIntro
        title="Campaigns"
        description={
          hasCampaigns
            ? CAMPAIGNS_OVERVIEW_COPY.hasCampaignsDescription
            : CAMPAIGNS_OVERVIEW_COPY.description
        }
        actions={newCampaignAction}
        showActionsInHeader={hasCampaigns}
      />

      {isPending ? <Text variant="muted">Loading campaigns…</Text> : null}
      {isError ? <Text variant="muted">Could not load campaigns.</Text> : null}

      {hasCampaigns ? (
        <CampaignPicker campaigns={campaigns} onSelect={openCampaign} />
      ) : (
        <IndexPageEmptyState
          heading={CAMPAIGNS_OVERVIEW_COPY.empty.heading}
          body={CAMPAIGNS_OVERVIEW_COPY.empty.body}
          actions={newCampaignAction}
        />
      )}
    </NarrowPage>
  )
}
