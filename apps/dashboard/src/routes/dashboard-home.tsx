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
  const {
    data: characters,
    isPending: charactersPending,
    isError: charactersError,
  } = useCharacters()

  if (sessionPending || campaignsPending || charactersPending) {
    return <Spinner />
  }

  const inventoryUnavailable = campaignsError || charactersError
  const promotions = resolveDashboardHomeCampaignPromotions(campaigns, campaignsError, user)
  const campaignRowsPresent = inventoryUnavailable ? false : hasCampaignRows(campaigns)
  const hasCharacters = inventoryUnavailable ? false : Boolean(characters?.length)
  const welcome = resolveDashboardWelcomeCopy({
    hasCampaigns: campaignRowsPresent,
    hasCharacters,
    displayName: user?.displayName,
    inventoryUnavailable,
  })

  return (
    <NarrowPage spacing="relaxed">
      <div className="space-y-1">
        <Heading variant="page" as="h1">
          {welcome.title}
        </Heading>
        {welcome.body ? <Text variant="muted">{welcome.body}</Text> : null}
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
