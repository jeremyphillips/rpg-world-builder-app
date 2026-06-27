import { useParams } from 'react-router-dom'
import { Heading, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'
import { useCampaigns } from '../hooks/use-campaigns'
import { usePersistViewedCampaign } from '../hooks/use-persist-viewed-campaign'

/** Campaign overview route — displays the campaign name resolved from the cached list. */
export function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: campaigns } = useCampaigns()

  // Viewing a campaign (link/bookmark/refresh) makes it the remembered "last".
  usePersistViewedCampaign(campaignId)

  const campaign = campaigns?.find((c) => c.id === campaignId)

  return (
    <NarrowPage>
      <Heading variant="page" as="h1">
        {campaign?.identity.name ?? 'Campaign'}
      </Heading>
      <Text variant="muted">Overview</Text>
    </NarrowPage>
  )
}
