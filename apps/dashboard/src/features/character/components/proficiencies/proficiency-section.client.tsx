'use client'

import type { ProficiencyStepSection } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import { ProficiencyChoiceSection } from './proficiency-choice-section.client'
import { ProficiencyGrantedRow } from './proficiency-granted-row.client'
import { proficiencySectionGrantedListClasses } from './proficiency-section.variants'

export type ProficiencySectionProps = {
  section: ProficiencyStepSection
  onOpenChoiceSet: (choiceSetId: string) => void
  onRemoveChoice: (choiceSetId: string, optionId: string) => void
}

export function ProficiencySection({
  section,
  onOpenChoiceSet,
  onRemoveChoice,
}: ProficiencySectionProps) {
  const headingId = `proficiency-section-${section.kind}-heading`

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <div className="space-y-1">
        <Heading variant="subsection" as="h3" id={headingId}>
          {section.heading}
        </Heading>
        {section.intro ? <Text variant="muted">{section.intro}</Text> : null}
      </div>

      {section.grantedRows.length > 0 ? (
        <ul className={proficiencySectionGrantedListClasses}>
          {section.grantedRows.map((row) => (
            <li key={row.id}>
              <ProficiencyGrantedRow row={row} />
            </li>
          ))}
        </ul>
      ) : null}

      {section.choices.map((choice) => (
        <ProficiencyChoiceSection
          key={choice.choiceSet.id}
          choice={choice}
          onOpenDrawer={() => onOpenChoiceSet(choice.choiceSet.id)}
          onRemove={(optionId) => onRemoveChoice(choice.choiceSet.id, optionId)}
        />
      ))}
    </section>
  )
}
