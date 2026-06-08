import { useParams } from 'react-router-dom'

import { NavSection } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { NavItem } from './nav-item'
import { useCanManageCampaign } from '@/features/campaign'

export function ManageNavSection() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const canManage = useCanManageCampaign(campaignId)

  if (!canManage || !campaignId) return null

  return (
    <NavSection label="Manage">
      <NavItem to={ROUTES.campaign.settings(campaignId)} label="Campaign Settings" />
    </NavSection>
  )
}
