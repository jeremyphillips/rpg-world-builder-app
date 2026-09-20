import { tableBuilderColumnFallbackLabel } from '../../lib/table-builder/table-builder-draft'
import type { TableBuilderColumnDraft } from '../../lib/table-builder/table-builder-draft'
import {
  tableBuilderValuesHeaderCellClasses,
  tableBuilderValuesHeaderRowClasses,
  tableBuilderValuesStickyLevelHeaderClasses,
} from './table-builder-values.variants'
import { TABLE_BUILDER_LEVEL_HEADER } from '../../lib/table-builder/table-builder-copy'

export type TableBuilderValuesHeaderProps = {
  columns: readonly TableBuilderColumnDraft[]
  gridTemplate: string
  includeLevel: boolean
  includeActions?: boolean
  includeRestoreActions?: boolean
}

export function TableBuilderValuesHeader({
  columns,
  gridTemplate,
  includeLevel,
  includeActions = true,
  includeRestoreActions = false,
}: TableBuilderValuesHeaderProps) {
  return (
    <div
      className={tableBuilderValuesHeaderRowClasses}
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {includeLevel ? (
        <div
          className={`${tableBuilderValuesHeaderCellClasses} ${tableBuilderValuesStickyLevelHeaderClasses}`}
        >
          {TABLE_BUILDER_LEVEL_HEADER}
        </div>
      ) : null}
      {columns.map((column, index) => {
        const label = column.label.trim()
        return (
          <div key={column.key} className={tableBuilderValuesHeaderCellClasses}>
            {label === '' ? tableBuilderColumnFallbackLabel(index) : label}
          </div>
        )
      })}
      {includeRestoreActions ? <div aria-hidden /> : null}
      {includeActions ? <div aria-hidden /> : null}
    </div>
  )
}
