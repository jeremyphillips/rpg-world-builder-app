import { tableBuilderColumnFallbackLabel } from '../../lib/table-builder/table-builder-draft'
import type { TableBuilderColumnDraft } from '../../lib/table-builder/table-builder-draft'
import {
  tableBuilderValuesHeaderCellClasses,
  tableBuilderValuesHeaderRowClasses,
} from './table-builder-values.variants'
import { TABLE_BUILDER_LEVEL_HEADER } from '../../lib/table-builder/table-builder-copy'

export type TableBuilderValuesHeaderProps = {
  columns: readonly TableBuilderColumnDraft[]
  gridTemplate: string
  includeLevel: boolean
}

export function TableBuilderValuesHeader({
  columns,
  gridTemplate,
  includeLevel,
}: TableBuilderValuesHeaderProps) {
  return (
    <div
      className={tableBuilderValuesHeaderRowClasses}
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {includeLevel ? (
        <div className={tableBuilderValuesHeaderCellClasses}>{TABLE_BUILDER_LEVEL_HEADER}</div>
      ) : null}
      {columns.map((column, index) => {
        const label = column.label.trim()
        return (
          <div key={column.key} className={tableBuilderValuesHeaderCellClasses}>
            {label === '' ? tableBuilderColumnFallbackLabel(index) : label}
          </div>
        )
      })}
      <div aria-hidden />
    </div>
  )
}
