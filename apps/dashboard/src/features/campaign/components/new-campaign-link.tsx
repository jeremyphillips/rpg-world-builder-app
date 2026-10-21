import { Link } from 'react-router-dom'
import { ButtonLink, type ButtonLinkProps } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { CAMPAIGNS_OVERVIEW_COPY } from '../lib/overview/campaigns-overview-copy'

type NewCampaignLinkProps = Pick<ButtonLinkProps, 'variant' | 'size'>

export function NewCampaignLink({ variant, size }: NewCampaignLinkProps) {
  return (
    <ButtonLink link={<Link to={ROUTES.campaign.create} />} variant={variant} size={size}>
      {CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel}
    </ButtonLink>
  )
}
