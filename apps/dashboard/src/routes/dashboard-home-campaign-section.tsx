import { Link } from 'react-router-dom'
import { buttonVariants, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  CAMPAIGNS_QUERY_ERROR_MESSAGE,
  ContinueCampaignCard,
  ResumeSetupCampaignCard,
} from '@/features/campaign'

import type { DashboardHomeCampaignPromotions } from './dashboard-home-campaign-promotions'

type DashboardHomeCampaignSectionProps = DashboardHomeCampaignPromotions & {
  campaignsError: boolean
}

export function DashboardHomeCampaignSection({
  campaignsError,
  continueCampaign,
  resumeSetupCampaign,
  showAllCampaignsLink,
}: DashboardHomeCampaignSectionProps) {
  return (
    <>
      {campaignsError ? (
        <Text variant="muted" role="alert">
          {CAMPAIGNS_QUERY_ERROR_MESSAGE}
        </Text>
      ) : null}

      {continueCampaign ? <ContinueCampaignCard campaign={continueCampaign} /> : null}

      {resumeSetupCampaign ? <ResumeSetupCampaignCard campaign={resumeSetupCampaign} /> : null}

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
