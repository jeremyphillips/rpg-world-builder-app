import { useLocation } from 'react-router-dom'

import {
  CampaignSwitcher,
  useCampaignCharacterNavigationContext,
  useCanManageCampaign,
} from '@/features/campaign'
import { useIsElevatedPlatformRole } from '@/features/auth'

import { AllCampaignsLink } from './all-campaigns-link'
import { useSidebarSectionPreferences } from './hooks/use-sidebar-section-preferences'
import { buildCampaignSidebarSections } from './lib/build-campaign-sidebar-sections'
import { SidebarNavRenderer } from './sidebar-nav-renderer'

interface CampaignSidebarNavProps {
  campaignId: string
}

/** Campaign workspace navigation — rendered only under `CampaignLayoutRoute`. */
export function CampaignSidebarNav({ campaignId }: CampaignSidebarNavProps) {
  const { pathname } = useLocation()
  const canManageCampaign = useCanManageCampaign(campaignId)
  const isElevatedPlatformRole = useIsElevatedPlatformRole()
  const { nav: characterNav } = useCampaignCharacterNavigationContext(campaignId)
  const { getEffectiveExpanded, setSectionExpanded } = useSidebarSectionPreferences()
  const sections = buildCampaignSidebarSections({
    campaignId,
    canManageCampaign,
    isElevatedPlatformRole,
    characterNav,
  })

  return (
    <>
      <AllCampaignsLink />
      <div className="py-1">
        <CampaignSwitcher showLabel={false} />
      </div>
      <SidebarNavRenderer
        sections={sections}
        getEffectiveExpanded={(section) => getEffectiveExpanded(section, pathname)}
        onSectionExpandedChange={setSectionExpanded}
      />
    </>
  )
}
