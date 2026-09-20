import { formatProficiencyChoiceEmptyMessage } from '@rpg/contracts'
import type { ProficiencyChoiceBlock, ProficiencyChoiceSelectedRow } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { EmptyPanel, Heading, Text } from '@rpg/ui'

import { PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE } from '../../../../lib/proficiencies/proficiencies-step.lib'
import { ProficiencyChoiceAddAction } from './proficiency-choice-add-action'
import { ProficiencySectionValidationMessages } from './proficiency-section-validation-messages'
import { ProficiencySelectedRow } from './proficiency-selected-row'
import { ProficiencySelectionCounter } from './proficiency-selection-counter'
import {
  proficiencyChoiceBlockRowClasses,
  proficiencyChoiceBlockRowContentClasses,
  proficiencyChoiceBlockRowDetailsClasses,
  proficiencyChoiceBlockRowDividerClasses,
  proficiencyChoiceBlockRowHeaderClasses,
  proficiencyChoiceBlockRowHeadingGroupClasses,
  proficiencyChoiceBlockRowOverSelectionClasses,
  proficiencyChoiceBlockRowPoolDescriptionClasses,
  proficiencyChoiceBlockRowSelectedListClasses,
  proficiencyChoiceBlockRowSourceLineClasses,
} from './proficiency-choice-block-row.variants'
import { proficiencySubsectionBodyMarginClasses } from './proficiency-section.variants'

export type ProficiencyChoiceBlockRowProps = {
  block: ProficiencyChoiceBlock
  selectedRows: readonly ProficiencyChoiceSelectedRow[]
  validationIssues?: readonly CharacterBuildValidationIssue[]
  onOpenDrawer: () => void
  onRemoveChoice: (choiceSetId: string, optionId: string) => void
}

export function ProficiencyChoiceBlockRow({
  block,
  selectedRows,
  validationIssues = [],
  onOpenDrawer,
  onRemoveChoice,
}: ProficiencyChoiceBlockRowProps) {
  const emptyMessage = formatProficiencyChoiceEmptyMessage(block.choiceSet.choiceType)

  return (
    <div className={proficiencyChoiceBlockRowClasses}>
      <div className={proficiencyChoiceBlockRowDividerClasses} role="presentation" aria-hidden />
      <div className={proficiencyChoiceBlockRowContentClasses}>
        <div className={proficiencyChoiceBlockRowHeaderClasses}>
          <div className={proficiencyChoiceBlockRowHeadingGroupClasses}>
            <Heading variant="group" as="p">
              {block.heading}
            </Heading>
            <ProficiencySelectionCounter selectedCount={selectedRows.length} max={block.max} />
          </div>
          <ProficiencyChoiceAddAction
            compactAddLabel={block.compactAddLabel}
            isFull={block.isFull}
            onClick={onOpenDrawer}
          />
        </div>
        <div className={proficiencyChoiceBlockRowDetailsClasses}>
          {block.sourceLine ? (
            <Text className={proficiencyChoiceBlockRowSourceLineClasses}>{block.sourceLine}</Text>
          ) : null}
          <Text variant="caption" className={proficiencyChoiceBlockRowPoolDescriptionClasses}>
            {block.poolDescription}
          </Text>
          {block.isOverSelected ? (
            <p className={proficiencyChoiceBlockRowOverSelectionClasses} role="status">
              {PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE}
            </p>
          ) : null}
          <ProficiencySectionValidationMessages issues={validationIssues} />
          {selectedRows.length > 0 ? (
            <ul className={proficiencyChoiceBlockRowSelectedListClasses}>
              {selectedRows.map((row) => (
                <li key={`${row.choiceSetId}:${row.optionId}`}>
                  <ProficiencySelectedRow
                    row={row}
                    onRemove={() => onRemoveChoice(row.choiceSetId, row.optionId)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyPanel className={proficiencySubsectionBodyMarginClasses}>
              {emptyMessage}
            </EmptyPanel>
          )}
        </div>
      </div>
    </div>
  )
}
