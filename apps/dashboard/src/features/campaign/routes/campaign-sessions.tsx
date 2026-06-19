import { useParams } from 'react-router-dom'
import { Heading, Text } from '@rpg/ui'

import { usePersistViewedCampaign } from '../hooks/use-persist-viewed-campaign'

export function CampaignSessions() {
  const { campaignId } = useParams<{ campaignId: string }>()

  usePersistViewedCampaign(campaignId)

  return (
    <div className="mx-auto max-w-3xl space-y-2">
      <Heading variant="page" as="h2">
        Sessions
      </Heading>
      <Text variant="muted">Coming soon.</Text>
    </div>
  )
}
