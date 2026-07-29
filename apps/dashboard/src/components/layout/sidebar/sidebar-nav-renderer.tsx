import { NavSection } from '@rpg/ui'

import { CollapsibleNavSection } from './collapsible-nav-section.client'
import { NavItem } from './nav-item'
import type { CollapsibleSidebarSectionId, SidebarNavSection } from './lib/sidebar-nav-model'

interface SidebarNavRendererProps {
  sections: SidebarNavSection[]
  getEffectiveExpanded?: (section: SidebarNavSection) => boolean
  onSectionExpandedChange?: (sectionId: CollapsibleSidebarSectionId, expanded: boolean) => void
}

function renderSectionItems(section: SidebarNavSection) {
  return section.items.map((item) => (
    <NavItem
      key={item.id}
      to={item.href}
      label={item.label}
      end={item.end}
      isActive={item.isActive}
    />
  ))
}

/** Maps resolved sidebar sections to layout nav primitives. */
export function SidebarNavRenderer({
  sections,
  getEffectiveExpanded,
  onSectionExpandedChange,
}: SidebarNavRendererProps) {
  return (
    <>
      {sections.map((section) => {
        if (section.collapsible && getEffectiveExpanded && onSectionExpandedChange) {
          const expanded = getEffectiveExpanded(section)

          return (
            <CollapsibleNavSection
              key={section.id}
              label={section.label}
              expanded={expanded}
              onExpandedChange={(nextExpanded) =>
                onSectionExpandedChange(section.id as CollapsibleSidebarSectionId, nextExpanded)
              }
            >
              {renderSectionItems(section)}
            </CollapsibleNavSection>
          )
        }

        return (
          <NavSection key={section.id} label={section.label}>
            {renderSectionItems(section)}
          </NavSection>
        )
      })}
    </>
  )
}
