import { useEffect, useState } from 'react'
import { Eyebrow, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn } from '@rpg/ui'

import {
  buildInPageMobileNavItems,
  resolveInPageMobileSelectValue,
  resolveInPageSectionLinkState,
  scrollToInPageNavAnchor,
} from './in-page-section-nav.lib'
import type { InPageNavSection } from './in-page-nav.types'
import {
  inPageSectionNavLeafLinkClasses,
  inPageSectionNavLeafListClasses,
  inPageSectionNavPanelClasses,
  inPageSectionNavRailSlotClasses,
  inPageSectionNavSectionLinkClasses,
  inPageSectionNavShellClasses,
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

  useEffect(() => {
    if (activeSectionId || activeLeafId) {
      setExpandedSectionId(undefined)
    }
  }, [activeLeafId, activeSectionId])

  return (
    <div className={inPageSectionNavRailSlotClasses}>
      <nav
        className={cn(inPageSectionNavPanelClasses, inPageSectionNavShellClasses)}
        aria-label={navLabel}
      >
        <Eyebrow size="sm" className="mb-2">
          {eyebrowLabel}
        </Eyebrow>
        <ul className="space-y-1">
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
      </nav>

      <div className="lg:hidden">
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
