import { formatProficiencyChoiceEmptyMessage, formatSpellChoiceEmptyMessage } from '@rpg/contracts'
import type { BuilderChoiceBlock, BuilderChoiceSelectedRow } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { EmptyPanel, Heading, Text } from '@rpg/ui'

import { ChoiceAddAction } from './choice-add-action'
import { ChoiceSectionValidationMessages } from './choice-section-validation-messages'
import { ChoiceSelectedRow } from './choice-selected-row'
import { ChoiceSelectionCounter } from './choice-selection-counter'
import {
  choiceBlockRowClasses,
  choiceBlockRowContentClasses,
  choiceBlockRowDetailsClasses,
  choiceBlockRowDividerClasses,
  choiceBlockRowHeaderClasses,
  choiceBlockRowHeadingGroupClasses,
  choiceBlockRowOverSelectionClasses,
  choiceBlockRowPoolDescriptionClasses,
  choiceBlockRowSelectedListClasses,
  choiceBlockRowSourceLineClasses,
} from './choice-block-row.variants'
import { choiceSubsectionBodyMarginClasses } from './choice-section.variants'

export type ChoiceBlockRowProps = {
  block: BuilderChoiceBlock
  selectedRows: readonly BuilderChoiceSelectedRow[]
  validationIssues?: readonly CharacterBuildValidationIssue[]
  overSelectionMessage: string
  onOpenDrawer: () => void
  onRemoveChoice: (choiceSetId: string, optionId: string) => void
}

function emptyMessageForBlock(block: BuilderChoiceBlock): string {
  const { choiceType } = block.choiceSet
  if (choiceType === 'cantrip' || choiceType === 'spell') {
    return formatSpellChoiceEmptyMessage(choiceType)
  }
  return formatProficiencyChoiceEmptyMessage(choiceType)
}

export function ChoiceBlockRow({
  block,
  selectedRows,
  validationIssues = [],
  overSelectionMessage,
  onOpenDrawer,
  onRemoveChoice,
}: ChoiceBlockRowProps) {
  const emptyMessage = emptyMessageForBlock(block)

  return (
    <div className={choiceBlockRowClasses}>
      <div className={choiceBlockRowDividerClasses} role="presentation" aria-hidden />
      <div className={choiceBlockRowContentClasses}>
        <div className={choiceBlockRowHeaderClasses}>
          <div className={choiceBlockRowHeadingGroupClasses}>
            <Heading variant="group" as="p">
              {block.heading}
            </Heading>
            <ChoiceSelectionCounter selectedCount={block.selectedCount} max={block.max} />
          </div>
          <ChoiceAddAction
            compactAddLabel={block.compactAddLabel}
            isFull={block.isFull}
            onClick={onOpenDrawer}
          />
        </div>
        <div className={choiceBlockRowDetailsClasses}>
          {block.sourceLine ? (
            <Text className={choiceBlockRowSourceLineClasses}>{block.sourceLine}</Text>
          ) : null}
          <Text variant="caption" className={choiceBlockRowPoolDescriptionClasses}>
            {block.poolDescription}
          </Text>
          {block.isOverSelected ? (
            <p className={choiceBlockRowOverSelectionClasses} role="status">
              {overSelectionMessage}
            </p>
          ) : null}
          <ChoiceSectionValidationMessages issues={validationIssues} />
          {selectedRows.length > 0 ? (
            <ul className={choiceBlockRowSelectedListClasses}>
              {selectedRows.map((row) => (
                <li key={`${row.choiceSetId}:${row.optionId}`}>
                  <ChoiceSelectedRow
                    row={row}
                    onRemove={() => onRemoveChoice(row.choiceSetId, row.optionId)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyPanel className={choiceSubsectionBodyMarginClasses}>{emptyMessage}</EmptyPanel>
          )}
        </div>
      </div>
    </div>
  )
}
