import { useParams } from 'react-router-dom'
import { Heading, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'
import { usePersistViewedCampaign } from '../hooks/use-persist-viewed-campaign'

export function CampaignSessions() {
  const { campaignId } = useParams<{ campaignId: string }>()

  usePersistViewedCampaign(campaignId)

  return (
    <NarrowPage>
      <Heading variant="page" as="h1">
        Sessions
      </Heading>
      <Text variant="muted">Coming soon.</Text>
    </NarrowPage>
  )
}
