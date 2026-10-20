import { Link } from 'react-router-dom'
import { ButtonLink } from '@rpg/ui'

import { StarterActionCard } from '@/components/layout/starter-action-card'
import { ROUTES } from '@/app/routes'
import { NewCampaignLink } from '@/features/campaign'

import { DASHBOARD_HOME_COPY } from './dashboard-home-copy'

type DashboardHomeStarterCardsProps = {
  hasCampaignRows: boolean
}

export function DashboardHomeStarterCards({ hasCampaignRows }: DashboardHomeStarterCardsProps) {
  const newCampaignVariant = hasCampaignRows ? 'outline' : 'default'

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StarterActionCard
        title={DASHBOARD_HOME_COPY.starterCards.campaign.title}
        description={DASHBOARD_HOME_COPY.starterCards.campaign.description}
        actions={<NewCampaignLink variant={newCampaignVariant} size="sm" />}
      />
      <StarterActionCard
        title={DASHBOARD_HOME_COPY.starterCards.character.title}
        description={DASHBOARD_HOME_COPY.starterCards.character.description}
        actions={
          <>
            <ButtonLink link={<Link to={ROUTES.characters.new} />} size="sm">
              {DASHBOARD_HOME_COPY.starterCards.character.createLabel}
            </ButtonLink>
            <ButtonLink link={<Link to={ROUTES.characters.import} />} variant="outline" size="sm">
              {DASHBOARD_HOME_COPY.starterCards.character.importLabel}
            </ButtonLink>
          </>
        }
      />
    </div>
  )
}
