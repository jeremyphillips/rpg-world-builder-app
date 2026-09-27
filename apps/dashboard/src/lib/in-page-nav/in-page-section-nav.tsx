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

            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(event) => {
                    event.preventDefault()
                    scrollToInPageNavAnchor(section.id)
                  }}
                  aria-current={sectionLinkState === 'active' ? 'location' : undefined}
                  className={inPageSectionNavSectionLinkClasses({ state: sectionLinkState })}
                >
                  {section.label}
                </a>
                {section.leaves && section.leaves.length > 0 ? (
                  <ul
                    className={inPageSectionNavLeafListClasses({
                      active: sectionLinkState !== 'inactive',
                    })}
                  >
                    {section.leaves.map((leaf) => (
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
