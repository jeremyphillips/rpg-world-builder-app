import { Plus } from 'lucide-react'

import {
  TABLE_BUILDER_ADD_COLUMN_LABEL,
  TABLE_BUILDER_COLUMNS_EMPTY_DESCRIPTION,
  TABLE_BUILDER_COLUMNS_EMPTY_HEADLINE,
} from '../../lib/table-builder/table-builder-copy'
import {
  tableBuilderColumnsEmptyAddActionClasses,
  tableBuilderColumnsEmptyAddActionIconClasses,
} from './table-builder-columns.variants'
import { TableBuilderInsetGate } from './table-builder-inset-gate'

export type TableBuilderColumnsEmptyProps = {
  onAddColumn: () => void
}

export function TableBuilderColumnsEmpty({ onAddColumn }: TableBuilderColumnsEmptyProps) {
  return (
    <TableBuilderInsetGate
      headline={TABLE_BUILDER_COLUMNS_EMPTY_HEADLINE}
      description={TABLE_BUILDER_COLUMNS_EMPTY_DESCRIPTION}
      action={
        <button
          type="button"
          className={tableBuilderColumnsEmptyAddActionClasses}
          onClick={onAddColumn}
        >
          <Plus className={tableBuilderColumnsEmptyAddActionIconClasses} aria-hidden />
          {TABLE_BUILDER_ADD_COLUMN_LABEL}
        </button>
      }
    />
  )
}
