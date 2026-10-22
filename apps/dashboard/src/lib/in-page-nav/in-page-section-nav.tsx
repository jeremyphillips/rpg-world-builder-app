import { useState } from 'react'
import {
  Eyebrow,
  Panel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rpg/ui'

import {
  buildInPageMobileNavItems,
  resolveInPageMobileSelectValue,
  resolveInPageSectionLinkState,
  scrollToInPageNavAnchor,
} from './in-page-section-nav.lib'
import type { InPageNavSection } from './in-page-nav.types'
import { IN_PAGE_SECTION_NAV_PANEL_ATTR } from './in-page-nav-scroll-container.lib'
import {
  inPageSectionNavEyebrowClasses,
  inPageSectionNavLeafLinkClasses,
  inPageSectionNavLeafListClasses,
  inPageSectionNavMobileSelectSlotClasses,
  inPageSectionNavPanelClasses,
  inPageSectionNavRailSlotClasses,
  inPageSectionNavSectionLinkClasses,
  inPageSectionNavSectionListClasses,
} from './in-page-section-nav.variants'

export type InPageSectionNavProps = {
  sections: readonly InPageNavSection[]
  /** Desktop rail eyebrow (visible lg+). */
  eyebrowLabel: string
  /** Accessible name for the desktop nav landmark. */
  navLabel: string
  /** Accessible name for the mobile section select. */
  mobileSelectLabel: string
  activeSectionId?: string
  activeLeafId?: string
}

/** Desktop anchor rail + mobile select for in-page sections. */
export function InPageSectionNav({
  sections,
  eyebrowLabel,
  navLabel,
  mobileSelectLabel,
  activeSectionId,
  activeLeafId,
}: InPageSectionNavProps) {
  const selectedValue = resolveInPageMobileSelectValue(sections, activeSectionId, activeLeafId)
  const mobileItems = buildInPageMobileNavItems(sections)
  /** Expands leaf lists on section click before scroll-spy catches up. */
  const [expandedSectionId, setExpandedSectionId] = useState<string | undefined>()

  return (
    <div className={inPageSectionNavRailSlotClasses}>
      <nav
        className={inPageSectionNavPanelClasses}
        aria-label={navLabel}
        {...{ [IN_PAGE_SECTION_NAV_PANEL_ATTR]: '' }}
      >
        <Panel tone="transparent" density="comfortable" className="text-foreground">
          <Eyebrow size="sm" className={inPageSectionNavEyebrowClasses}>
            {eyebrowLabel}
          </Eyebrow>
          <ul className={inPageSectionNavSectionListClasses}>
            {sections.map((section) => {
              const sectionLinkState = resolveInPageSectionLinkState(
                section.id,
                activeSectionId,
                activeLeafId,
              )
              const leaves = section.leaves ?? []
              const showLeaves =
                leaves.length > 0 &&
                (sectionLinkState !== 'inactive' || expandedSectionId === section.id)

              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={(event) => {
                      event.preventDefault()
                      setExpandedSectionId(section.id)
                      scrollToInPageNavAnchor(section.id)
                    }}
                    aria-current={sectionLinkState === 'active' ? 'location' : undefined}
                    className={inPageSectionNavSectionLinkClasses({ state: sectionLinkState })}
                  >
                    {section.label}
                  </a>
                  {showLeaves ? (
                    <ul
                      className={inPageSectionNavLeafListClasses({
                        active: sectionLinkState !== 'inactive',
                      })}
                    >
                      {leaves.map((leaf) => (
                        <li key={leaf.id}>
                          <a
                            href={`#${leaf.id}`}
                            onClick={(event) => {
                              event.preventDefault()
                              scrollToInPageNavAnchor(leaf.id)
                            }}
                            aria-current={activeLeafId === leaf.id ? 'true' : undefined}
                            className={inPageSectionNavLeafLinkClasses({
                              active: activeLeafId === leaf.id,
                            })}
                          >
                            {leaf.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </Panel>
      </nav>

      <div className={inPageSectionNavMobileSelectSlotClasses}>
        <Select
          value={selectedValue}
          onValueChange={(value) => {
            scrollToInPageNavAnchor(value)
          }}
        >
          <SelectTrigger aria-label={mobileSelectLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mobileItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
