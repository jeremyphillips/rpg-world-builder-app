import type { CampaignListItem } from '@rpg/contracts'

import { PageLoadState } from '@/components/layout/page/page-load-state'

import { CampaignOverviewInvitationsSection } from '../components/overview/campaign-overview-invitations-section'
import { CampaignOverviewMembersSection } from '../components/overview/campaign-overview-members-section'
import { CampaignOverviewPartySection } from '../components/overview/campaign-overview-party-section'
import type { useCampaignOverviewData } from '../hooks/use-campaign-overview-data'

const CAMPAIGN_OVERVIEW_GRID_CLASSES =
  'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)] lg:items-start'

type CampaignOverviewPageBodyProps = {
  campaignId: string | undefined
  campaign: CampaignListItem | undefined
  overview: ReturnType<typeof useCampaignOverviewData>
  canManage: boolean
  onInviteMember?: () => void
}

export function CampaignOverviewPageBody({
  campaignId,
  campaign,
  overview,
  canManage,
  onInviteMember,
}: CampaignOverviewPageBodyProps) {
  return (
    <PageLoadState
      isPending={overview.isPending}
      isError={overview.isError}
      errorLabel={overview.errorLabel}
      defaultErrorLabel="Could not load campaign overview."
    >
      <div className={CAMPAIGN_OVERVIEW_GRID_CLASSES}>
        {campaignId ? (
          <CampaignOverviewPartySection
            campaignId={campaignId}
            party={overview.party}
            openControlledCharacterIds={campaign?.openControlledCharacterIds ?? []}
          />
        ) : null}

        <div className="flex flex-col gap-6">
          <CampaignOverviewMembersSection
            members={overview.members}
            campaignId={campaignId}
            canManage={canManage}
            onInviteMember={onInviteMember}
          />
          {canManage && campaignId ? (
            <CampaignOverviewInvitationsSection
              campaignId={campaignId}
              invites={overview.invites}
            />
          ) : null}
        </div>
      </div>
    </PageLoadState>
  )
}
