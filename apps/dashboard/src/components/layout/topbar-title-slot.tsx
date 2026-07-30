import { useParams } from 'react-router-dom'

import { CampaignTopbarTitleSlot } from './campaign-topbar-title-slot'
import { PersonalWorkspaceTopbarTitle } from './personal-workspace-topbar-title'

/** Renders campaign or personal workspace context in the dashboard topbar. */
export function TopbarTitleSlot() {
  const { campaignId } = useParams()

  if (campaignId) {
    return <CampaignTopbarTitleSlot />
  }

  return <PersonalWorkspaceTopbarTitle />
}
