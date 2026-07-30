import { useParams } from 'react-router-dom'

import {
  CampaignTopbarTitle,
  CampaignTopbarTitleError,
  CampaignTopbarTitleMissing,
  CampaignTopbarTitleSkeleton,
  mapCampaignTopbarTitleState,
  resolveCampaignTopbarTitleState,
  useCampaigns,
} from '@/features/campaign'

/** Resolves route campaign context and renders the topbar title slot. */
export function CampaignTopbarTitleSlot() {
  const { campaignId } = useParams()
  const { data, isPending, isError } = useCampaigns()

  const mapped = mapCampaignTopbarTitleState(
    resolveCampaignTopbarTitleState(campaignId, { isPending, isError, data }),
  )

  switch (mapped.kind) {
    case 'hidden':
      return null
    case 'loading':
      return <CampaignTopbarTitleSkeleton />
    case 'error':
      return <CampaignTopbarTitleError />
    case 'resolved':
      return (
        <CampaignTopbarTitle
          campaignId={mapped.display.id}
          name={mapped.display.name}
          href={mapped.href}
        />
      )
    case 'missing':
      return <CampaignTopbarTitleMissing campaignId={mapped.campaignId} href={mapped.href} />
  }
}
