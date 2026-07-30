import { Link } from 'react-router-dom'
import { buttonVariants, Heading, Spinner, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'
import { StarterActionCard } from '@/components/layout/starter-action-card'
import { useSession } from '@/features/auth'
import {
  ContinueCampaignCard,
  readStoredCampaignId,
  resolveContinueCampaign,
  useCampaigns,
  useOpenCampaign,
} from '@/features/campaign'
import { ROUTES } from '@/app/routes'

import { DASHBOARD_HOME_COPY } from './dashboard-home-copy'

export function DashboardHome() {
  const { data: session, isPending: sessionPending } = useSession()
  const user = session?.user
  const { data: campaigns, isPending: campaignsPending } = useCampaigns()
  const openCampaign = useOpenCampaign()

  if (sessionPending || campaignsPending) {
    return <Spinner />
  }

  const continueCampaign =
    campaigns !== undefined
      ? resolveContinueCampaign(campaigns, user, readStoredCampaignId())
      : null

  const showAllCampaignsLink = campaigns !== undefined && campaigns.length > 1

  return (
    <NarrowPage spacing="relaxed">
      <div className="space-y-1">
        <Heading variant="page" as="h1">
          Welcome{user ? `, ${user.displayName}` : ''}
        </Heading>
        <Text variant="muted">{DASHBOARD_HOME_COPY.subtitle}</Text>
      </div>

      {continueCampaign ? (
        <ContinueCampaignCard campaign={continueCampaign} onContinue={openCampaign} />
      ) : null}

      {showAllCampaignsLink ? (
        <Link
          to={ROUTES.campaign.list}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          View all campaigns
        </Link>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <StarterActionCard
          title={DASHBOARD_HOME_COPY.starterCards.campaign.title}
          description={DASHBOARD_HOME_COPY.starterCards.campaign.description}
          actions={
            <Link to={ROUTES.campaign.create} className={buttonVariants({ size: 'sm' })}>
              {DASHBOARD_HOME_COPY.starterCards.campaign.actionLabel}
            </Link>
          }
        />
        <StarterActionCard
          title={DASHBOARD_HOME_COPY.starterCards.character.title}
          description={DASHBOARD_HOME_COPY.starterCards.character.description}
          actions={
            <>
              <Link to={ROUTES.characters.new} className={buttonVariants({ size: 'sm' })}>
                {DASHBOARD_HOME_COPY.starterCards.character.createLabel}
              </Link>
              <Link
                to={ROUTES.characters.import}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                {DASHBOARD_HOME_COPY.starterCards.character.importLabel}
              </Link>
            </>
          }
        />
      </div>

      <div className="space-y-1">
        <Text>{DASHBOARD_HOME_COPY.invitationHeading}</Text>
        <Text variant="muted">{DASHBOARD_HOME_COPY.invitationBody}</Text>
      </div>
    </NarrowPage>
  )
}
