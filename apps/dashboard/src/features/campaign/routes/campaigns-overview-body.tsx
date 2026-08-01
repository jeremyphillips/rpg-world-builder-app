import type { ReactNode } from 'react'
import type { CampaignInviteInviteeListItem, CampaignListItem } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { IndexPageEmptyState } from '@/components/layout/index-page-intro'
import {
  CAMPAIGNS_QUERY_ERROR_MESSAGE,
  CampaignPicker,
  PendingCampaignInvitationsSection,
  filterPendingInvitesForMembership,
} from '@/features/campaign'

import { CAMPAIGNS_OVERVIEW_COPY } from '../lib/campaigns-overview-copy'
import type { CampaignsOverviewViewState } from '../lib/campaigns-overview-view'

type CampaignsOverviewBodyProps = {
  viewState: CampaignsOverviewViewState
  campaigns: CampaignListItem[] | undefined
  pendingInvites: CampaignInviteInviteeListItem[] | undefined
  newCampaignAction: ReactNode
}

export function CampaignsOverviewBody({
  viewState,
  campaigns,
  pendingInvites,
  newCampaignAction,
}: CampaignsOverviewBodyProps) {
  const visibleInvites = filterPendingInvitesForMembership(pendingInvites, campaigns)

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
        <>
          {visibleInvites.length > 0 ? (
            <PendingCampaignInvitationsSection invites={visibleInvites} surface="index" />
          ) : null}
          <IndexPageEmptyState
            heading={CAMPAIGNS_OVERVIEW_COPY.empty.heading}
            body={CAMPAIGNS_OVERVIEW_COPY.empty.body}
            actions={newCampaignAction}
          />
        </>
      )
    case 'populated':
      return (
        <>
          {visibleInvites.length > 0 ? (
            <PendingCampaignInvitationsSection invites={visibleInvites} surface="index" />
          ) : null}
          <CampaignPicker campaigns={campaigns!} />
        </>
      )
  }
}
