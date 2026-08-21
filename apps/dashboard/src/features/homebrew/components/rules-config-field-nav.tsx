import { Eyebrow, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn } from '@rpg/ui'

import type { RulesConfigNavLeaf, RulesConfigNavSection } from '@/features/campaign'

export type { RulesConfigNavLeaf, RulesConfigNavSection }

type RulesConfigFieldNavProps = {
  sections: readonly RulesConfigNavSection[]
  navLabel: string
  mobileSelectLabel: string
  activeSectionId?: string
  activeLeafId?: string
}

function scrollToAnchor(anchorId: string) {
  document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    <>
      <nav
        className="hidden w-56 shrink-0 lg:sticky lg:top-20 lg:block lg:self-start"
        aria-label={navLabel}
      >
        <Eyebrow size="sm" className="mb-2 px-3">
          Sections
        </Eyebrow>
        <ul className="space-y-1">
          {sections.map((section) => {
            const isSectionActive = activeSectionId === section.id && !activeLeafId

            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(event) => {
                    event.preventDefault()
                    scrollToAnchor(section.id)
                  }}
                  aria-current={isSectionActive ? 'location' : undefined}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isSectionActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {section.label}
                </a>
                {section.leaves && section.leaves.length > 0 ? (
                  <ul className="ml-3.5 mt-1 space-y-0.5 border-l border-border pl-2">
                    {section.leaves.map((leaf) => (
                      <li key={leaf.id}>
                        <a
                          href={`#${leaf.id}`}
                          onClick={(event) => {
                            event.preventDefault()
                            scrollToAnchor(leaf.id)
                          }}
                          aria-current={activeLeafId === leaf.id ? 'true' : undefined}
                          className={cn(
                            'block rounded-md py-1.5 pl-2 pr-3 text-sm font-normal transition-colors',
                            activeLeafId === leaf.id
                              ? 'text-foreground'
                              : 'text-muted-foreground hover:text-foreground',
                          )}
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
    </>
  )
}
