import type { ProficiencyChoiceBlock, ProficiencyInteractiveSection } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Button, Heading } from '@rpg/ui'
import { Pencil, Plus } from 'lucide-react'

import { ProficiencySectionValidationMessages } from './proficiency-section-validation-messages'
import { ProficiencySelectionCounter } from './proficiency-selection-counter'
import { ProficiencySectionSupportingCopy } from './proficiency-section-supporting-copy'
import {
  proficiencySectionHeaderClasses,
  proficiencySectionHeadingRowClasses,
  proficiencySectionHeaderDetailsClasses,
} from './proficiency-section.variants'

type ProficiencySectionHeaderProps = {
  section: ProficiencyInteractiveSection
  headingId: string
  singleChoiceBlock?: ProficiencyChoiceBlock
  sectionValidationIssues: readonly CharacterBuildValidationIssue[]
  onOpenChoiceSet: (choiceSetId: string) => void
}

export function ProficiencySectionHeader({
  section,
  headingId,
  singleChoiceBlock,
  sectionValidationIssues,
  onOpenChoiceSet,
}: ProficiencySectionHeaderProps) {
  const isMultiBlockSection = section.choiceBlocks.length > 1

  return (
    <div className={proficiencySectionHeaderClasses}>
      <div>
        <div className={proficiencySectionHeadingRowClasses}>
          <Heading variant="subsection" as="h3" id={headingId}>
            {section.heading}
          </Heading>
          {section.aggregateCount ? (
            <ProficiencySelectionCounter
              selectedCount={section.aggregateCount.selected}
              max={section.aggregateCount.max}
            />
          ) : null}
        </div>
        <div className={proficiencySectionHeaderDetailsClasses}>
          <ProficiencySectionSupportingCopy
            section={section}
            singleChoiceBlock={singleChoiceBlock}
          />
          {!isMultiBlockSection ? (
            <ProficiencySectionValidationMessages issues={sectionValidationIssues} />
          ) : null}
        </div>
      </div>

      {singleChoiceBlock ? (
        <Button
          type="button"
          variant="text"
          tone="accent"
          density="compact"
          onClick={() => onOpenChoiceSet(singleChoiceBlock.choiceSet.id)}
        >
          {singleChoiceBlock.isFull ? <Pencil aria-hidden /> : <Plus aria-hidden />}
          {singleChoiceBlock.compactAddLabel}
        </Button>
      ) : null}
    </div>
  )
}
