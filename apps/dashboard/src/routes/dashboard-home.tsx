import { Link } from 'react-router-dom'
import { buttonVariants, Heading, Spinner, Text } from '@rpg/ui'

import { useSession } from '@/features/auth'
import { CampaignPicker, useCampaigns, useSelectCampaign } from '@/features/campaign'
import { ROUTES } from '@/app/routes'

import { useLandingRedirect } from './use-landing-redirect'

export function DashboardHome() {
  const redirecting = useLandingRedirect()
  const { data: user } = useSession()
  const { data: campaigns } = useCampaigns()
  const selectCampaign = useSelectCampaign()

  // Hold the picker back while the one-shot landing redirect is being decided.
  if (redirecting) {
    return <Spinner />
  }

  const hasCampaigns = campaigns !== undefined && campaigns.length > 0

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Heading variant="page" as="h2">
            Welcome{user ? `, ${user.displayName}` : ''}
          </Heading>
          <Text variant="muted">
            {hasCampaigns
              ? 'Choose a campaign to continue, or start a new one.'
              : 'Create your first campaign to get started.'}
          </Text>
        </div>
        <Link to={ROUTES.campaign.create} className={buttonVariants({ variant: 'default' })}>
          New campaign
        </Link>
      </div>

      {hasCampaigns ? <CampaignPicker campaigns={campaigns} onSelect={selectCampaign} /> : null}
    </div>
  )
}
