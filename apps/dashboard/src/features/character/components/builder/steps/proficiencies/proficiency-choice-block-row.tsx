import type { ProficiencyChoiceBlock, ProficiencyChoiceSelectedRow } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'
import { Plus } from 'lucide-react'

import { shouldShowSelectionFullNotice } from '../../../../lib/choice-sets/selection-counter.lib'
import {
  formatProficiencyChosenCounter,
  PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE,
  PROFICIENCIES_STEP_SELECTION_FULL_REASON,
} from '../../../../lib/proficiencies/proficiencies-step.lib'
import {
  proficiencyChoiceBlockRowClasses,
  proficiencyChoiceBlockRowContentClasses,
  proficiencyChoiceBlockRowCountClasses,
  proficiencyChoiceBlockRowDividerClasses,
  proficiencyChoiceBlockRowHeaderClasses,
  proficiencyChoiceBlockRowLabelClasses,
  proficiencyChoiceBlockRowOverSelectionClasses,
  proficiencyChoiceBlockRowSelectionFullClasses,
} from './proficiency-choice-block-row.variants'

export type ProficiencyChoiceBlockRowProps = {
  block: ProficiencyChoiceBlock
  selectedRows: readonly ProficiencyChoiceSelectedRow[]
  onOpenDrawer: () => void
}

export function ProficiencyChoiceBlockRow({
  block,
  selectedRows,
  onOpenDrawer,
}: ProficiencyChoiceBlockRowProps) {
  const showSelectionFull = shouldShowSelectionFullNotice(
    block.choiceSet,
    block.isFull,
    block.addLabel,
  )

  return (
    <div className={proficiencyChoiceBlockRowClasses}>
      <div className={proficiencyChoiceBlockRowDividerClasses} role="presentation" aria-hidden />
      <div className={proficiencyChoiceBlockRowContentClasses}>
        <div className={proficiencyChoiceBlockRowHeaderClasses}>
          <p className={proficiencyChoiceBlockRowLabelClasses}>{block.choiceSet.label}</p>
          <Text variant="muted" className={proficiencyChoiceBlockRowCountClasses}>
            {formatProficiencyChosenCounter(selectedRows.length, block.max)}
          </Text>
        </div>
        <Text variant="muted" className="text-sm">
          {block.poolDescription}
        </Text>
        {showSelectionFull ? (
          <p className={proficiencyChoiceBlockRowSelectionFullClasses}>
            {PROFICIENCIES_STEP_SELECTION_FULL_REASON}
          </p>
        ) : null}
        {block.isOverSelected ? (
          <p className={proficiencyChoiceBlockRowOverSelectionClasses} role="status">
            {PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE}
          </p>
        ) : null}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="text"
            tone="accent"
            density="compact"
            onClick={onOpenDrawer}
          >
            <Plus aria-hidden />
            {block.addLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
