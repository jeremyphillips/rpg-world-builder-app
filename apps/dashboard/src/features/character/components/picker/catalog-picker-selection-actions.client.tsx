'use client'

import {
  catalogPickerSelectionAddButtonClasses,
  catalogPickerSelectionRemoveButtonClasses,
} from './catalog-picker-selection-actions.variants'
import { catalogPickerSelectionActionsClasses } from './catalog-picker-item-header.variants'

export type CatalogPickerSelectionActionsProps = {
  selected: boolean
  canSelect: boolean
  onAdd: () => void
  onRemove: () => void
}

export function CatalogPickerSelectionActions({
  selected,
  canSelect,
  onAdd,
  onRemove,
}: CatalogPickerSelectionActionsProps) {
  return (
    <div className={catalogPickerSelectionActionsClasses}>
      {selected ? (
        <button
          type="button"
          className={catalogPickerSelectionRemoveButtonClasses}
          onClick={onRemove}
        >
          Remove
        </button>
      ) : (
        <button
          type="button"
          className={catalogPickerSelectionAddButtonClasses}
          disabled={!canSelect}
          onClick={onAdd}
        >
          Add
        </button>
      )}
    </div>
  )
}
