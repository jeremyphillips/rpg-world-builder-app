'use client'

import type { ButtonProps } from '@rpg/ui'

import { CatalogPickerActionButton } from './catalog-picker-action-button.client'
import { catalogPickerSelectionActionsClasses } from './catalog-picker-item-header.variants'

export type CatalogPickerSelectionActionsProps = {
  selected: boolean
  canSelect: boolean
  onAdd: () => void
  onRemove: () => void
  buttonVariant?: ButtonProps['variant']
}

export function CatalogPickerSelectionActions({
  selected,
  canSelect,
  onAdd,
  onRemove,
  buttonVariant,
}: CatalogPickerSelectionActionsProps) {
  return (
    <div className={catalogPickerSelectionActionsClasses}>
      {selected ? (
        <CatalogPickerActionButton variant={buttonVariant} onClick={onRemove}>
          Remove
        </CatalogPickerActionButton>
      ) : (
        <CatalogPickerActionButton variant={buttonVariant} disabled={!canSelect} onClick={onAdd}>
          Add
        </CatalogPickerActionButton>
      )}
    </div>
  )
}
