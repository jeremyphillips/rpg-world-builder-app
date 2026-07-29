import { Link } from 'react-router-dom'
import { buttonVariants, Heading, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'
import { ROUTES } from '@/app/routes'
import { CampaignPicker, useCampaigns, useOpenCampaign } from '@/features/campaign'

/** Global campaigns index — list, select, and resume campaigns. */
export function CampaignsOverview() {
  const { data: campaigns, isPending, isError } = useCampaigns()
  const openCampaign = useOpenCampaign()

  const hasCampaigns = campaigns !== undefined && campaigns.length > 0

  return (
    <NarrowPage spacing="relaxed">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Heading variant="page" as="h1">
            Campaigns
          </Heading>
          <Text variant="muted">
            {hasCampaigns
              ? 'Choose a campaign to continue, or start a new one.'
              : 'Create your first campaign to get started.'}
          </Text>
        </div>
        <Link to={ROUTES.campaign.create} className={buttonVariants({ variant: 'default' })}>
          New campaign
        </Link>
      </div>

      {isPending ? <Text variant="muted">Loading campaigns…</Text> : null}
      {isError ? <Text variant="muted">Could not load campaigns.</Text> : null}
      {hasCampaigns ? <CampaignPicker campaigns={campaigns} onSelect={openCampaign} /> : null}
    </NarrowPage>
  )
}
