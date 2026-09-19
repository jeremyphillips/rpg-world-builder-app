import type {
  ProficiencyChoiceBlock,
  ProficiencyChoiceSelectedRow,
  ProficiencyInteractiveSection,
} from '@rpg/contracts'
import { Button, EmptyPanel, Heading, Text } from '@rpg/ui'
import { Plus } from 'lucide-react'

import { shouldShowSelectionFullNotice } from '../../../../lib/choice-sets/selection-counter.lib'
import {
  PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE,
  PROFICIENCIES_STEP_SELECTION_FULL_REASON,
} from '../../../../lib/proficiencies/proficiencies-step.lib'
import { ProficiencyChoiceBlockRow } from './proficiency-choice-block-row'
import { ProficiencySelectedRow } from './proficiency-selected-row'
import {
  proficiencySectionChoiceBlocksClasses,
  proficiencySectionClasses,
  proficiencySectionDividerClasses,
  proficiencySectionHeaderClasses,
  proficiencySectionHeadingRowClasses,
  proficiencySectionOverSelectionClasses,
  proficiencySectionSelectedListClasses,
  proficiencySectionSelectionFullClasses,
  proficiencySectionSubheadClasses,
} from './proficiency-section.variants'

export type ProficiencySectionProps = {
  section: ProficiencyInteractiveSection
  onOpenChoiceSet: (choiceSetId: string) => void
  onRemoveChoice: (choiceSetId: string, optionId: string) => void
}

function selectedRowsForBlock(
  section: ProficiencyInteractiveSection,
  block: ProficiencyChoiceBlock,
): ProficiencyChoiceSelectedRow[] {
  return section.selectedRows.filter((row) => row.choiceSetId === block.choiceSet.id)
}

function shouldShowBlockSelectionFull(block: ProficiencyChoiceBlock): boolean {
  return shouldShowSelectionFullNotice(block.choiceSet, block.isFull, block.addLabel)
}

export function ProficiencySection({
  section,
  onOpenChoiceSet,
  onRemoveChoice,
}: ProficiencySectionProps) {
  const headingId = `proficiency-section-${section.kind}-heading`
  const singleChoiceBlock = section.choiceBlocks.length === 1 ? section.choiceBlocks[0] : undefined
  const showSingleBlockSelectionFull =
    singleChoiceBlock !== undefined && shouldShowBlockSelectionFull(singleChoiceBlock)

  return (
    <section aria-labelledby={headingId} className={proficiencySectionClasses}>
      <div className={proficiencySectionHeaderClasses}>
        <div className="space-y-1">
          <div className={proficiencySectionHeadingRowClasses}>
            <Heading variant="subsection" as="h3" id={headingId}>
              {section.heading}
            </Heading>
            {section.aggregateCount ? (
              <Text variant="muted">{section.aggregateCount.label}</Text>
            ) : null}
          </div>
          <p className={proficiencySectionSubheadClasses}>{section.subhead}</p>
          {showSingleBlockSelectionFull ? (
            <p className={proficiencySectionSelectionFullClasses}>
              {PROFICIENCIES_STEP_SELECTION_FULL_REASON}
            </p>
          ) : null}
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

      <div className={proficiencySectionDividerClasses} role="presentation" aria-hidden />

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

      {section.choiceBlocks.length > 1 ? (
        <div className={proficiencySectionChoiceBlocksClasses}>
          {section.choiceBlocks.map((block) => (
            <ProficiencyChoiceBlockRow
              key={block.choiceSet.id}
              block={block}
              selectedRows={selectedRowsForBlock(section, block)}
              onOpenDrawer={() => onOpenChoiceSet(block.choiceSet.id)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
