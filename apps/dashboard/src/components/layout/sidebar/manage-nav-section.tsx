import { useParams } from 'react-router-dom'

import { NavSection } from '@rpg/ui'

import { NavItem } from './nav-item'
import { useCanManageCampaign } from '@/features/campaign'

export function ManageNavSection() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const canManage = useCanManageCampaign(campaignId)

  if (!canManage) return null

  return (
    <NavSection label="Manage">
      <NavItem to={`/campaigns/${campaignId}/settings`} label="Campaign Settings" />
    </NavSection>
  )
}
