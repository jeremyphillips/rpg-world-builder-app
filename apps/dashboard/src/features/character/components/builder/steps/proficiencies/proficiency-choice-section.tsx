// Future: generalize shared frame with SpellChoiceSection → BuilderChoiceSection<T>
// (header, counter, selection-full, over-selection, selected list, drawer trigger).
// Shared drawer trigger: formatChoiceSetDrawerTriggerLabel (Add vs Manage when full).
// Proficiencies adds sourceLabel per row via ContentEntityCard; spells lack source today.
// Extract when aligning spell selected rows (post-MVP polish).

import { formatProficiencyChoiceEmptyMessage, type ProficiencyChoiceSummary } from '@rpg/contracts'
import { Button, Heading, Text } from '@rpg/ui'

import {
  formatChoiceSetDrawerTriggerLabel,
  formatProficiencySelectionCounter,
  PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE,
  PROFICIENCIES_STEP_SELECTION_FULL_REASON,
} from '../../../../lib/proficiencies/proficiencies-step.lib'
import { shouldShowSelectionFullNotice } from '../../../../lib/choice-sets/selection-counter.lib'
import { ProficiencySelectedRow } from './proficiency-selected-row'
import {
  proficiencyChoiceSectionClasses,
  proficiencyChoiceSectionCounterRowClasses,
  proficiencyChoiceSectionHeaderClasses,
  proficiencyChoiceSectionOverSelectionClasses,
  proficiencyChoiceSectionSelectedListClasses,
} from './proficiency-choice-section.variants'

export type ProficiencyChoiceSectionProps = {
  choice: ProficiencyChoiceSummary
  onOpenDrawer: () => void
  onRemove: (optionId: string) => void
}

export function ProficiencyChoiceSection({
  choice,
  onOpenDrawer,
  onRemove,
}: ProficiencyChoiceSectionProps) {
  const { choiceSet, selectedRows, selectedCount, max, isFull, isOverSelected } = choice
  const drawerTriggerLabel = formatChoiceSetDrawerTriggerLabel(choiceSet, {
    selectedCount,
    max,
  })
  const showSelectionFull = shouldShowSelectionFullNotice(choiceSet, isFull, drawerTriggerLabel)

  return (
    <section
      className={proficiencyChoiceSectionClasses}
      aria-labelledby={`${choiceSet.id}-heading`}
    >
      <div className={proficiencyChoiceSectionHeaderClasses}>
        <Heading variant="subsection" as="h3" id={`${choiceSet.id}-heading`}>
          {choiceSet.label}
        </Heading>
        <Button type="button" size="sm" onClick={onOpenDrawer}>
          {drawerTriggerLabel}
        </Button>
      </div>

      <div className={proficiencyChoiceSectionCounterRowClasses}>
        <Text variant="muted">{formatProficiencySelectionCounter(selectedCount, max)}</Text>
        {showSelectionFull ? (
          <Text variant="muted">{PROFICIENCIES_STEP_SELECTION_FULL_REASON}</Text>
        ) : null}
      </div>

      {isOverSelected ? (
        <p className={proficiencyChoiceSectionOverSelectionClasses} role="status">
          {PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE}
        </p>
      ) : null}

      {selectedRows.length > 0 ? (
        <ul className={proficiencyChoiceSectionSelectedListClasses}>
          {selectedRows.map((row) => (
            <li key={row.optionId}>
              <ProficiencySelectedRow row={row} onRemove={() => onRemove(row.optionId)} />
            </li>
          ))}
        </ul>
      ) : (
        <Text variant="muted">{formatProficiencyChoiceEmptyMessage(choiceSet.choiceType)}</Text>
      )}
    </section>
  )
}
