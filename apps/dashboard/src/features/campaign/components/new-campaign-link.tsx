import { Link } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'
import type { VariantProps } from 'class-variance-authority'

import { ROUTES } from '@/app/routes'

import { CAMPAIGNS_OVERVIEW_COPY } from '../lib/overview/campaigns-overview-copy'

type NewCampaignLinkProps = {
  variant: 'default' | 'outline'
  size?: VariantProps<typeof buttonVariants>['size']
}

export function NewCampaignLink({ variant, size }: NewCampaignLinkProps) {
  return (
    <Link to={ROUTES.campaign.create} className={buttonVariants({ variant, size })}>
      {CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel}
    </Link>
  )
}
