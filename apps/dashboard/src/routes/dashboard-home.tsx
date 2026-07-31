import { Heading, Spinner, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'
import { useSession } from '@/features/auth'
import { useCampaigns, hasCampaignRows } from '@/features/campaign'

import { DashboardHomeCampaignSection } from './dashboard-home-campaign-section'
import { resolveDashboardHomeCampaignPromotions } from './dashboard-home-campaign-promotions'
import { DASHBOARD_HOME_COPY } from './dashboard-home-copy'
import { DashboardHomeStarterCards } from './dashboard-home-starter-cards'

export function DashboardHome() {
  const { data: session, isPending: sessionPending } = useSession()
  const user = session?.user
  const { data: campaigns, isPending: campaignsPending, isError: campaignsError } = useCampaigns()

  if (sessionPending || campaignsPending) {
    return <Spinner />
  }

  const promotions = resolveDashboardHomeCampaignPromotions(campaigns, campaignsError, user)
  const campaignRowsPresent = hasCampaignRows(campaigns)

  return (
    <NarrowPage spacing="relaxed">
      <div className="space-y-1">
        <Heading variant="page" as="h1">
          Welcome{user ? `, ${user.displayName}` : ''}
        </Heading>
        <Text variant="muted">{DASHBOARD_HOME_COPY.subtitle}</Text>
      </div>

      <DashboardHomeCampaignSection campaignsError={campaignsError} {...promotions} />

      <DashboardHomeStarterCards hasCampaignRows={campaignRowsPresent} />

      <div className="space-y-1">
        <Text>{DASHBOARD_HOME_COPY.invitationHeading}</Text>
        <Text variant="muted">{DASHBOARD_HOME_COPY.invitationBody}</Text>
      </div>
    </NarrowPage>
  )
}
