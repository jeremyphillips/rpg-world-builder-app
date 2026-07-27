import { useParams } from 'react-router-dom'
import { Heading } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'
import { PageLoadState } from '@/components/layout/page-load-state'

import { CampaignOverviewInvitationsSection } from '../components/campaign-overview-invitations-section'
import { CampaignOverviewMembersSection } from '../components/campaign-overview-members-section'
import { CampaignOverviewPartySection } from '../components/campaign-overview-party-section'
import { InviteMemberDialog } from '../components/invite-member-dialog.client'
import { useCampaignOverviewData } from '../hooks/use-campaign-overview-data'
import { useCampaigns } from '../hooks/use-campaigns'
import { useCanManageCampaign } from '../hooks/use-can-manage-campaign'
import { usePersistViewedCampaign } from '../hooks/use-persist-viewed-campaign'

/** Campaign overview — members, invitations, and party sections. */
export function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: campaigns } = useCampaigns()
  const canManage = useCanManageCampaign(campaignId)
  const overview = useCampaignOverviewData(campaignId, canManage)

  usePersistViewedCampaign(campaignId)

  const campaign = campaigns?.find((item) => item.id === campaignId)

  return (
    <NarrowPage spacing="list">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Heading variant="page" as="h1">
          {campaign?.identity.name ?? 'Campaign'}
        </Heading>
        {canManage && campaignId ? <InviteMemberDialog campaignId={campaignId} /> : null}
      </div>

      <PageLoadState
        isPending={overview.isPending}
        isError={overview.isError}
        errorLabel={overview.errorLabel}
        defaultErrorLabel="Could not load campaign overview."
      >
        <div className="space-y-8">
          <CampaignOverviewMembersSection members={overview.members} />
          {canManage && campaignId ? (
            <CampaignOverviewInvitationsSection
              campaignId={campaignId}
              invites={overview.invites}
            />
          ) : null}
          {campaignId ? (
            <CampaignOverviewPartySection campaignId={campaignId} party={overview.party} />
          ) : null}
        </div>
      </PageLoadState>
    </NarrowPage>
  )
}
