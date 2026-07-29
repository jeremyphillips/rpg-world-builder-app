import { useLocation } from 'react-router-dom'

import { SidebarNavSectionDisclosure } from '@rpg/ui'

import {
  CampaignSwitcher,
  useCampaignCharacterNavigationContext,
  useCanManageCampaign,
} from '@/features/campaign'
import { useIsElevatedPlatformRole } from '@/features/auth'

import { AllCampaignsLink } from './all-campaigns-link'
import { useSidebarSectionPreferences } from './hooks/use-sidebar-section-preferences'
import { buildCampaignSidebarSections } from './lib/build-campaign-sidebar-sections'
import type { CollapsibleSidebarNavSection } from './lib/sidebar-nav-model'
import { NavItem } from './nav-item'

interface CampaignSidebarNavProps {
  campaignId: string
}

function CollapsibleSidebarSection({
  section,
  expanded,
  onExpandedChange,
}: {
  section: CollapsibleSidebarNavSection
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
}) {
  return (
    <SidebarNavSectionDisclosure
      label={section.label}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      {section.items.map((item) => (
        <NavItem
          key={item.id}
          to={item.href}
          label={item.label}
          end={item.end}
          isActive={item.isActive}
        />
      ))}
    </SidebarNavSectionDisclosure>
  )
}

/** Campaign workspace navigation — rendered only under `CampaignLayoutRoute`. */
export function CampaignSidebarNav({ campaignId }: CampaignSidebarNavProps) {
  const { pathname } = useLocation()
  const canManageCampaign = useCanManageCampaign(campaignId)
  const isElevatedPlatformRole = useIsElevatedPlatformRole()
  const { nav: characterNav } = useCampaignCharacterNavigationContext(campaignId)
  const { getSectionExpanded, setSectionExpanded } = useSidebarSectionPreferences()
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
      {sections.map((section) => (
        <CollapsibleSidebarSection
          key={section.id}
          section={section}
          expanded={getSectionExpanded(section, pathname)}
          onExpandedChange={(expanded) => setSectionExpanded(section.id, expanded)}
        />
      ))}
    </>
  )
}
