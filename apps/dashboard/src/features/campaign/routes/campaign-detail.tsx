import { useParams } from 'react-router-dom'

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
    <div className="mx-auto max-w-3xl space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight">
        {campaign?.identity.name ?? 'Campaign'}
      </h2>
      <p className="text-muted-foreground">Overview</p>
    </div>
  )
}
