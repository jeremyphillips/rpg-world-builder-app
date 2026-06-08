import { useParams } from 'react-router-dom'

import { usePersistViewedCampaign } from '../hooks/use-persist-viewed-campaign'

export function CampaignSettings() {
  const { campaignId } = useParams<{ campaignId: string }>()

  usePersistViewedCampaign(campaignId)

  return (
    <div className="mx-auto max-w-3xl space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight">Campaign Settings</h2>
      <p className="text-muted-foreground">Coming soon.</p>
    </div>
  )
}
