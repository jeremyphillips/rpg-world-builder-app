import { Link } from 'react-router-dom'
import { buttonVariants, Heading, Spinner, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'
import { useSession } from '@/features/auth'
import {
  ContinueCampaignCard,
  readStoredCampaignId,
  resolveContinueCampaign,
  useCampaigns,
  useOpenCampaign,
} from '@/features/campaign'
import { ROUTES } from '@/app/routes'

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

  const hasCampaigns = campaigns !== undefined && campaigns.length > 0

  return (
    <NarrowPage spacing="relaxed">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Heading variant="page" as="h1">
            Welcome{user ? `, ${user.displayName}` : ''}
          </Heading>
          <Text variant="muted">
            {hasCampaigns
              ? 'Pick up where you left off, browse all campaigns, or start a new one.'
              : 'Create your first campaign to get started.'}
          </Text>
        </div>
        <Link to={ROUTES.campaign.create} className={buttonVariants({ variant: 'default' })}>
          New campaign
        </Link>
      </div>

      {continueCampaign ? (
        <ContinueCampaignCard campaign={continueCampaign} onContinue={openCampaign} />
      ) : null}

      {hasCampaigns ? (
        <Link
          to={ROUTES.campaign.list}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          View all campaigns
        </Link>
      ) : null}
    </NarrowPage>
  )
}
