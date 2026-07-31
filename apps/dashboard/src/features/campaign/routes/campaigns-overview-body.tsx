import type { ReactNode } from 'react'
import type { CampaignListItem } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { IndexPageEmptyState } from '@/components/layout/index-page-intro'
import { CAMPAIGNS_QUERY_ERROR_MESSAGE, CampaignPicker } from '@/features/campaign'

import { CAMPAIGNS_OVERVIEW_COPY } from '../lib/campaigns-overview-copy'
import type { CampaignsOverviewViewState } from '../lib/campaigns-overview-view'

type CampaignsOverviewBodyProps = {
  viewState: CampaignsOverviewViewState
  campaigns: CampaignListItem[] | undefined
  newCampaignAction: ReactNode
}

export function CampaignsOverviewBody({
  viewState,
  campaigns,
  newCampaignAction,
}: CampaignsOverviewBodyProps) {
  switch (viewState) {
    case 'pending':
      return <Text variant="muted">Loading campaigns…</Text>
    case 'error':
      return (
        <Text variant="muted" role="alert">
          {CAMPAIGNS_QUERY_ERROR_MESSAGE}
        </Text>
      )
    case 'empty':
      return (
        <IndexPageEmptyState
          heading={CAMPAIGNS_OVERVIEW_COPY.empty.heading}
          body={CAMPAIGNS_OVERVIEW_COPY.empty.body}
          actions={newCampaignAction}
        />
      )
    case 'populated':
      return <CampaignPicker campaigns={campaigns!} />
  }
}
