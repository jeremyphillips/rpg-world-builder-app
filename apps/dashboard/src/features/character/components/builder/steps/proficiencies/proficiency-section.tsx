import type { ProficiencyInteractiveSection } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Heading } from '@rpg/ui'

import { validationIssuesForProficiencyChoiceSet } from '../../../../lib/proficiencies/proficiencies-step.lib'
import { ProficiencyChoiceBlockRow } from './proficiency-choice-block-row'
import { ProficiencySelectionCounter } from './proficiency-selection-counter'
import {
  proficiencySectionChoiceBlocksClasses,
  proficiencySectionClasses,
  proficiencySectionHeaderClasses,
  proficiencySectionHeadingRowClasses,
  proficiencySectionHeaderDetailsClasses,
  proficiencySectionSubheadClasses,
} from './proficiency-section.variants'

export type ProficiencySectionProps = {
  section: ProficiencyInteractiveSection
  validationIssues?: readonly CharacterBuildValidationIssue[]
  onOpenChoiceSet: (choiceSetId: string) => void
  onRemoveChoice: (choiceSetId: string, optionId: string) => void
}

function selectedRowsForBlock(
  section: ProficiencyInteractiveSection,
  block: ProficiencyInteractiveSection['choiceBlocks'][number],
) {
  return section.selectedRows.filter((row) => row.choiceSetId === block.choiceSet.id)
}

export function ProficiencySection({
  section,
  validationIssues = [],
  onOpenChoiceSet,
  onRemoveChoice,
}: ProficiencySectionProps) {
  const headingId = `proficiency-section-${section.kind}-heading`

  return (
    <section aria-labelledby={headingId} className={proficiencySectionClasses}>
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
            {section.subhead ? (
              <p className={proficiencySectionSubheadClasses}>{section.subhead}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className={proficiencySectionChoiceBlocksClasses}>
        {section.choiceBlocks.map((block) => (
          <ProficiencyChoiceBlockRow
            key={block.choiceSet.id}
            block={block}
            selectedRows={selectedRowsForBlock(section, block)}
            validationIssues={validationIssuesForProficiencyChoiceSet(
              validationIssues,
              block.choiceSet.id,
            )}
            onOpenDrawer={() => onOpenChoiceSet(block.choiceSet.id)}
            onRemoveChoice={onRemoveChoice}
          />
        ))}
      </div>
    </section>
  )
}
