import { Link } from 'react-router-dom'
import { buttonVariants, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  CAMPAIGNS_QUERY_ERROR_MESSAGE,
  CampaignRecoveryPromotionCard,
  ContinueCampaignCard,
  PendingCampaignInvitationsSection,
} from '@/features/campaign'
import type { DashboardHomeSection } from './dashboard-home-sections.lib'

type DashboardHomeSectionsProps = {
  sections: DashboardHomeSection[]
  campaignsError: boolean
  showAllCampaignsLink: boolean
}

export function DashboardHomeSections({
  sections,
  campaignsError,
  showAllCampaignsLink,
}: DashboardHomeSectionsProps) {
  return (
    <>
      {campaignsError ? (
        <Text variant="muted" role="alert">
          {CAMPAIGNS_QUERY_ERROR_MESSAGE}
        </Text>
      ) : null}

      {sections.map((section) => {
        switch (section.kind) {
          case 'campaignRecovery':
            return (
              <CampaignRecoveryPromotionCard
                key="campaign-recovery"
                promotion={section.promotion}
              />
            )
          case 'pendingInvitations':
            return (
              <PendingCampaignInvitationsSection
                key="pending-invitations"
                invites={section.invites}
                surface="home"
              />
            )
          case 'continueCampaign':
            return <ContinueCampaignCard key="continue-campaign" campaign={section.campaign} />
          case 'starterCards':
            return null
        }
      })}

      {showAllCampaignsLink ? (
        <Link
          to={ROUTES.campaign.list}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          View all campaigns
        </Link>
      ) : null}
    </>
  )
}
