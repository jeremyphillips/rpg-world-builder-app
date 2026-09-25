import { useParams } from 'react-router-dom'

import { NarrowPage } from '@/components/layout/page/narrow-page'
import { PageLoadState } from '@/components/layout/page/page-load-state'

import { CampaignOverviewInvitationsSection } from '../components/overview/campaign-overview-invitations-section'
import { CampaignOverviewHero } from '../components/overview/campaign-overview-hero'
import { CampaignOverviewMembersSection } from '../components/overview/campaign-overview-members-section'
import { CampaignOverviewPartySection } from '../components/overview/campaign-overview-party-section'
import { useCampaignOverviewData } from '../hooks/use-campaign-overview-data'
import { useCampaigns } from '../hooks/use-campaigns'
import { useCanManageCampaign } from '../hooks/use-can-manage-campaign'
import { CampaignBannerUploadAlert } from '../components/campaign-banner-upload-alert'

/** Campaign overview — members, invitations, and party sections. */
export function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: campaigns } = useCampaigns()
  const canManage = useCanManageCampaign(campaignId)
  const overview = useCampaignOverviewData(campaignId, canManage)

  const campaign = campaigns?.find((item) => item.id === campaignId)

  return (
    <NarrowPage rhythm="list">
      <CampaignBannerUploadAlert />
      {campaign && campaignId ? (
        <CampaignOverviewHero
          campaign={campaign}
          campaignId={campaignId}
          canManage={canManage}
          playerCount={overview.isPending ? undefined : overview.members.length}
          characterCount={overview.isPending ? undefined : overview.party.length}
          countsPending={overview.isPending}
        />
      ) : null}

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
