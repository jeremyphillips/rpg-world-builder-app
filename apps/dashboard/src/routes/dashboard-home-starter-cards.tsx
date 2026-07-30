import { Link } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'

import { StarterActionCard } from '@/components/layout/starter-action-card'
import { ROUTES } from '@/app/routes'

import { DASHBOARD_HOME_COPY } from './dashboard-home-copy'

export function DashboardHomeStarterCards() {
  return (
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
  )
}
