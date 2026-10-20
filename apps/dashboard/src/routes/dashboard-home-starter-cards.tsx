import { Link } from 'react-router-dom'
import { ButtonLink, Card } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { NewCampaignLink } from '@/features/campaign'

import { DASHBOARD_HOME_COPY } from './dashboard-home-copy'

type DashboardHomeStarterCardsProps = {
  hasCampaignRows: boolean
}

export function DashboardHomeStarterCards({ hasCampaignRows }: DashboardHomeStarterCardsProps) {
  const newCampaignVariant = hasCampaignRows ? 'outline' : 'default'
  const starterCardTone = 'quiet'

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card
        stretch
        tone={starterCardTone}
        header={{
          title: DASHBOARD_HOME_COPY.starterCards.campaign.title,
          description: DASHBOARD_HOME_COPY.starterCards.campaign.description,
        }}
        footer={<NewCampaignLink variant={newCampaignVariant} size="sm" />}
      />

      <Card
        stretch
        tone={starterCardTone}
        header={{
          title: DASHBOARD_HOME_COPY.starterCards.character.title,
          description: DASHBOARD_HOME_COPY.starterCards.character.description,
        }}
        footer={
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
