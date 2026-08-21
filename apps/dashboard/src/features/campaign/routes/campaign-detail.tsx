import { useParams } from 'react-router-dom'

import { NarrowPage } from '@/components/layout/narrow-page'
import { PageLoadState } from '@/components/layout/page-load-state'

import { CampaignDisplayName } from '../components/campaign-display-name'
import { MessagesOverviewEntryActions } from '@/features/message'
import { CampaignOverviewInvitationsSection } from '../components/overview/campaign-overview-invitations-section'
import { CampaignOverviewMembersSection } from '../components/overview/campaign-overview-members-section'
import { CampaignOverviewPartySection } from '../components/overview/campaign-overview-party-section'
import { InviteMemberDialog } from '../components/overview/invite-member-dialog.client'
import { useCampaignOverviewData } from '../hooks/use-campaign-overview-data'
import { useCampaigns } from '../hooks/use-campaigns'
import { useCanManageCampaign } from '../hooks/use-can-manage-campaign'
import { buildCampaignDisplay, CAMPAIGN_UNKNOWN_NAME } from '../lib/campaign-display'

/** Campaign overview — members, invitations, and party sections. */
export function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: campaigns } = useCampaigns()
  const canManage = useCanManageCampaign(campaignId)
  const overview = useCampaignOverviewData(campaignId, canManage)

  const campaign = campaigns?.find((item) => item.id === campaignId)
  const display = campaign
    ? buildCampaignDisplay(campaign)
    : {
        id: campaignId ?? 'unknown',
        name: CAMPAIGN_UNKNOWN_NAME,
        imageUrl: null,
      }

  return (
    <NarrowPage spacing="list">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <CampaignDisplayName display={display} surface="page" />
        <div className="flex flex-wrap items-center gap-2">
          {campaignId ? <MessagesOverviewEntryActions campaignId={campaignId} /> : null}
          {canManage && campaignId ? <InviteMemberDialog campaignId={campaignId} /> : null}
        </div>
      </div>

      <PageLoadState
        isPending={overview.isPending}
        isError={overview.isError}
        errorLabel={overview.errorLabel}
        defaultErrorLabel="Could not load campaign overview."
      >
        <div className="space-y-8">
          <CampaignOverviewMembersSection
            members={overview.members}
            campaignId={campaignId}
            canManage={canManage}
          />
          {canManage && campaignId ? (
            <CampaignOverviewInvitationsSection
              campaignId={campaignId}
              invites={overview.invites}
            />
          ) : null}
          {campaignId ? (
            <CampaignOverviewPartySection
              campaignId={campaignId}
              party={overview.party}
              openControlledCharacterIds={campaign?.openControlledCharacterIds ?? []}
            />
          ) : null}
        </div>
      </PageLoadState>
    </NarrowPage>
  )
}
