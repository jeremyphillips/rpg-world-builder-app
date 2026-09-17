import { Plus } from 'lucide-react'

import {
  TABLE_BUILDER_ADD_ROW_LABEL,
  TABLE_BUILDER_ALL_LEVELS_USED_REASON,
} from '../../lib/table-builder/table-builder-copy'
import {
  tableBuilderAddActionClasses,
  tableBuilderAddActionIconClasses,
  tableBuilderAddActionWrapClasses,
} from './table-builder.variants'

export type TableBuilderValuesAddRowProps = {
  includeLevel: boolean
  addRowDisabled: boolean
  onAddRow: () => void
}

export function TableBuilderValuesAddRow({
  includeLevel,
  addRowDisabled,
  onAddRow,
}: TableBuilderValuesAddRowProps) {
  return (
    <div className={tableBuilderAddActionWrapClasses}>
      <button
        type="button"
        className={tableBuilderAddActionClasses}
        onClick={onAddRow}
        disabled={addRowDisabled}
        title={addRowDisabled ? TABLE_BUILDER_ALL_LEVELS_USED_REASON : undefined}
      >
        <Plus className={tableBuilderAddActionIconClasses} aria-hidden />
        {TABLE_BUILDER_ADD_ROW_LABEL}
        {includeLevel && addRowDisabled ? (
          <span className="sr-only">{TABLE_BUILDER_ALL_LEVELS_USED_REASON}</span>
        ) : null}
      </button>
    </div>
  )
}
