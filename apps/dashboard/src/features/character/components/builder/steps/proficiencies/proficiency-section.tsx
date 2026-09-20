import type {
  ProficiencyChoiceBlock,
  ProficiencyChoiceSelectedRow,
  ProficiencyInteractiveSection,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Button, EmptyPanel, Heading } from '@rpg/ui'
import { Plus } from 'lucide-react'

import {
  PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE,
  validationIssuesForProficiencyChoiceSet,
  validationIssuesForProficiencySection,
} from '../../../../lib/proficiencies/proficiencies-step.lib'
import { ProficiencyChoiceBlockRow } from './proficiency-choice-block-row'
import { ProficiencySectionValidationMessages } from './proficiency-section-validation-messages'
import { ProficiencySelectedRow } from './proficiency-selected-row'
import { ProficiencySelectionCounter } from './proficiency-selection-counter'
import {
  proficiencySectionChoiceBlocksClasses,
  proficiencySectionClasses,
  proficiencySectionDividerClasses,
  proficiencySectionHeaderClasses,
  proficiencySectionHeadingRowClasses,
  proficiencySectionOverSelectionClasses,
  proficiencySectionSelectedListClasses,
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
  block: ProficiencyChoiceBlock,
): ProficiencyChoiceSelectedRow[] {
  return section.selectedRows.filter((row) => row.choiceSetId === block.choiceSet.id)
}

export function ProficiencySection({
  section,
  validationIssues = [],
  onOpenChoiceSet,
  onRemoveChoice,
}: ProficiencySectionProps) {
  const headingId = `proficiency-section-${section.kind}-heading`
  const isMultiBlockSection = section.choiceBlocks.length > 1
  const singleChoiceBlock = isMultiBlockSection ? undefined : section.choiceBlocks[0]
  const sectionValidationIssues = validationIssuesForProficiencySection(validationIssues, section)

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
            <p className={proficiencySectionSubheadClasses}>{section.subhead}</p>
            <ProficiencySectionValidationMessages issues={sectionValidationIssues} />
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
            <Plus aria-hidden />
            {singleChoiceBlock.addLabel}
          </Button>
        ) : null}
      </div>

      {!isMultiBlockSection ? (
        <div className={proficiencySectionDividerClasses} role="presentation" aria-hidden />
      ) : null}

      {isMultiBlockSection ? (
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
      ) : (
        <>
          {section.isOverSelected ? (
            <p className={proficiencySectionOverSelectionClasses} role="status">
              {PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE}
            </p>
          ) : null}

          {section.selectedRows.length > 0 ? (
            <ul className={proficiencySectionSelectedListClasses}>
              {section.selectedRows.map((row) => (
                <li key={`${row.choiceSetId}:${row.optionId}`}>
                  <ProficiencySelectedRow
                    row={row}
                    onRemove={() => onRemoveChoice(row.choiceSetId, row.optionId)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyPanel>{section.emptyMessage}</EmptyPanel>
          )}
        </>
      )}
    </section>
  )
}
