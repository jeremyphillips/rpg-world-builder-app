'use client'

import { Button, CatalogPickerSheet, PreviewCard, Text, cn } from '@rpg/ui'

import {
  formatProficiencyPickerDrawerDescription,
  formatProficiencyPickerDrawerTitle,
  formatProficiencyPickerSearchPlaceholder,
  getProficiencyPickerDisabledNote,
  isProficiencyPickerRowDimmed,
  resolveProficiencyPickerEmptyStateKind,
  resolveProficiencyPickerEmptyStateMessage,
} from './proficiency-picker-drawer.lib'
import {
  PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE,
  PROFICIENCY_PICKER_NO_RESULTS_MESSAGE,
  type ProficiencyPickerDrawerProps,
  type ProficiencyPickerItem,
} from './proficiency-picker-drawer.types'
import {
  proficiencyPickerDisabledRowClasses,
  proficiencyPickerEmptyStateClasses,
} from './proficiency-picker-drawer.variants'

export type { ProficiencyPickerDrawerProps } from './proficiency-picker-drawer.types'

function ProficiencyPickerRow({
  item,
  onAdd,
  onRemove,
}: {
  item: ProficiencyPickerItem
  onAdd: () => void
  onRemove: () => void
}) {
  const dimmed = isProficiencyPickerRowDimmed(item)
  const disabledNote = getProficiencyPickerDisabledNote(item)
  const selected = item.state.isAlreadySelected

  return (
    <div className={cn(dimmed ? proficiencyPickerDisabledRowClasses : undefined)}>
      <PreviewCard
        title={item.label}
        tone={selected ? 'selected' : 'transparent'}
        density="compact"
        footerSlot={disabledNote ? <Text variant="muted">{disabledNote}</Text> : undefined}
        endSlot={
          selected ? (
            <Button type="button" size="sm" variant="outline" onClick={onRemove}>
              Remove
            </Button>
          ) : (
            <Button type="button" size="sm" disabled={!item.state.canSelect} onClick={onAdd}>
              Add
            </Button>
          )
        }
      />
    </div>
  )
}

/** Proficiency catalog drawer — thin wrapper over `CatalogPickerSheet`. */
export function ProficiencyPickerDrawer({
  open,
  onOpenChange,
  choiceSet,
  selectedIds,
  items,
  onSelectOption,
  onRemoveOption,
}: ProficiencyPickerDrawerProps) {
  const emptyStateKind = resolveProficiencyPickerEmptyStateKind(
    items.length,
    choiceSet,
    selectedIds,
  )
  const emptyStateMessage = resolveProficiencyPickerEmptyStateMessage(emptyStateKind)

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={formatProficiencyPickerDrawerTitle(choiceSet, selectedIds)}
      description={formatProficiencyPickerDrawerDescription(choiceSet, selectedIds)}
      items={items}
      getItemKey={(item) => item.optionId}
      getSearchText={(item) => item.label}
      searchPlaceholder={formatProficiencyPickerSearchPlaceholder(choiceSet)}
      noResultsMessage={PROFICIENCY_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE}
      emptyState={
        emptyStateMessage ? (
          <div className={proficiencyPickerEmptyStateClasses} role="status">
            {emptyStateMessage}
          </div>
        ) : undefined
      }
      renderItem={(item) => (
        <ProficiencyPickerRow
          item={item}
          onAdd={() => onSelectOption(item.optionId)}
          onRemove={() => onRemoveOption(item.optionId)}
        />
      )}
    />
  )
}
