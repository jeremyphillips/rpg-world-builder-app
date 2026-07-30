'use client'

import { Eyebrow, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn } from '@rpg/ui'

export type RulesConfigNavSection = {
  id: string
  label: string
}

type RulesConfigFieldNavProps = {
  sections: readonly RulesConfigNavSection[]
  navLabel: string
  mobileSelectLabel: string
  activeSectionId?: string
}

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Desktop anchor rail + mobile select for in-page rules configuration sections. */
export function RulesConfigFieldNav({
  sections,
  navLabel,
  mobileSelectLabel,
  activeSectionId,
}: RulesConfigFieldNavProps) {
  const selectedSection = activeSectionId ?? sections[0]?.id ?? ''

  return (
    <>
      <nav className="hidden w-56 shrink-0 lg:block" aria-label={navLabel}>
        <Eyebrow size="sm" className="mb-2 px-3">
          Sections
        </Eyebrow>
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(event) => {
                  event.preventDefault()
                  scrollToSection(section.id)
                }}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  selectedSection === section.id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="lg:hidden">
        <Select value={selectedSection} onValueChange={scrollToSection}>
          <SelectTrigger aria-label={mobileSelectLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section.id} value={section.id}>
                {section.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
