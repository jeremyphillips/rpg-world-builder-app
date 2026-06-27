'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Text, cn } from '@rpg/ui'

import { CHARACTER_CONFIGURATION_SECTIONS } from '@/features/campaign'

type RulesConfigFieldNavProps = {
  activeSectionId?: string
}

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Desktop anchor rail + mobile select for in-page rules configuration sections. */
export function RulesConfigFieldNav({ activeSectionId }: RulesConfigFieldNavProps) {
  const selectedSection =
    activeSectionId ?? CHARACTER_CONFIGURATION_SECTIONS[0]?.id ?? 'starting-level'

  return (
    <>
      <nav className="hidden w-56 shrink-0 lg:block" aria-label="Character configuration sections">
        <Text variant="small" className="mb-2 px-3 font-medium uppercase tracking-wide">
          Sections
        </Text>
        <ul className="space-y-1">
          {CHARACTER_CONFIGURATION_SECTIONS.map((section) => (
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
          <SelectTrigger aria-label="Character configuration section">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHARACTER_CONFIGURATION_SECTIONS.map((section) => (
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
