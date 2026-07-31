import { Heading, Spinner, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'
import { useSession } from '@/features/auth'
import { useCampaigns, hasCampaignRows } from '@/features/campaign'
import { useCharacters } from '@/features/character'

import { DashboardHomeCampaignSection } from './dashboard-home-campaign-section'
import { resolveDashboardHomeCampaignPromotions } from './dashboard-home-campaign-promotions'
import { DASHBOARD_HOME_COPY } from './dashboard-home-copy'
import { DashboardHomeStarterCards } from './dashboard-home-starter-cards'
import { resolveDashboardWelcomeCopy } from './dashboard-home-welcome.lib'

export function DashboardHome() {
  const { data: session, isPending: sessionPending } = useSession()
  const user = session?.user
  const { data: campaigns, isPending: campaignsPending, isError: campaignsError } = useCampaigns()
  const { data: characters, isPending: charactersPending } = useCharacters()

  if (sessionPending || campaignsPending || charactersPending) {
    return <Spinner />
  }

  const promotions = resolveDashboardHomeCampaignPromotions(campaigns, campaignsError, user)
  const campaignRowsPresent = hasCampaignRows(campaigns)
  const hasCharacters = Boolean(characters?.length)
  const welcome = resolveDashboardWelcomeCopy({
    hasCampaigns: campaignRowsPresent,
    hasCharacters,
    displayName: user?.displayName,
  })

  return (
    <NarrowPage spacing="relaxed">
      <div className="space-y-1">
        <Heading variant="page" as="h1">
          {welcome.title}
        </Heading>
        <Text variant="muted">{welcome.body}</Text>
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
