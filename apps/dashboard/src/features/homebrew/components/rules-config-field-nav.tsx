import { Eyebrow, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn } from '@rpg/ui'

import type { RulesConfigNavLeaf, RulesConfigNavSection } from '@/features/campaign'
import { resolveRulesConfigNavScrollOffsetPx } from '@/features/homebrew/hooks/use-rules-config-nav-scroll-spy.lib'

import {
  rulesConfigFieldNavLeafLinkClasses,
  rulesConfigFieldNavLeafListClasses,
  rulesConfigFieldNavPanelClasses,
  rulesConfigFieldNavRailSlotClasses,
  rulesConfigFieldNavSectionLinkClasses,
  rulesConfigFieldNavShellClasses,
} from './rules-config-field-nav.variants'

export type { RulesConfigNavLeaf, RulesConfigNavSection }

type RulesConfigFieldNavProps = {
  sections: readonly RulesConfigNavSection[]
  navLabel: string
  mobileSelectLabel: string
  activeSectionId?: string
  activeLeafId?: string
}

function scrollToAnchor(anchorId: string) {
  const anchor = document.getElementById(anchorId)
  if (!anchor) return

  const offset = resolveRulesConfigNavScrollOffsetPx()
  const top = window.scrollY + anchor.getBoundingClientRect().top - offset
  window.scrollTo({ top, behavior: 'smooth' })
}

type MobileNavItem = {
  id: string
  label: string
  sectionId: string
  isLeaf: boolean
}

function buildMobileNavItems(sections: readonly RulesConfigNavSection[]): MobileNavItem[] {
  return sections.flatMap((section) => {
    const sectionItem: MobileNavItem = {
      id: section.id,
      label: section.label,
      sectionId: section.id,
      isLeaf: false,
    }
    const leafItems =
      section.leaves?.map((leaf) => ({
        id: leaf.id,
        label: `${section.label} · ${leaf.label}`,
        sectionId: section.id,
        isLeaf: true,
      })) ?? []
    return [sectionItem, ...leafItems]
  })
}

function resolveMobileSelectValue(
  sections: readonly RulesConfigNavSection[],
  activeSectionId?: string,
  activeLeafId?: string,
): string {
  if (activeLeafId) return activeLeafId
  if (activeSectionId) return activeSectionId
  return sections[0]?.id ?? ''
}

function resolveSectionLinkState(
  sectionId: string,
  activeSectionId?: string,
  activeLeafId?: string,
): 'inactive' | 'active' | 'activeWithLeaf' {
  if (activeSectionId !== sectionId) return 'inactive'
  if (activeLeafId) return 'activeWithLeaf'
  return 'active'
}

/** Desktop anchor rail + mobile select for in-page rules configuration sections. */
export function RulesConfigFieldNav({
  sections,
  navLabel,
  mobileSelectLabel,
  activeSectionId,
  activeLeafId,
}: RulesConfigFieldNavProps) {
  const selectedValue = resolveMobileSelectValue(sections, activeSectionId, activeLeafId)
  const mobileItems = buildMobileNavItems(sections)

  return (
    <div className={rulesConfigFieldNavRailSlotClasses}>
      <nav
        className={cn(rulesConfigFieldNavPanelClasses, rulesConfigFieldNavShellClasses)}
        aria-label={navLabel}
      >
        <Eyebrow size="sm" className="mb-2">
          Sections
        </Eyebrow>
        <ul className="space-y-1">
          {sections.map((section) => {
            const sectionLinkState = resolveSectionLinkState(
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
                    scrollToAnchor(section.id)
                  }}
                  aria-current={sectionLinkState === 'active' ? 'location' : undefined}
                  className={rulesConfigFieldNavSectionLinkClasses({ state: sectionLinkState })}
                >
                  {section.label}
                </a>
                {section.leaves && section.leaves.length > 0 ? (
                  <ul
                    className={rulesConfigFieldNavLeafListClasses({
                      active: sectionLinkState !== 'inactive',
                    })}
                  >
                    {section.leaves.map((leaf) => (
                      <li key={leaf.id}>
                        <a
                          href={`#${leaf.id}`}
                          onClick={(event) => {
                            event.preventDefault()
                            scrollToAnchor(leaf.id)
                          }}
                          aria-current={activeLeafId === leaf.id ? 'true' : undefined}
                          className={rulesConfigFieldNavLeafLinkClasses({
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
            scrollToAnchor(value)
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
