import type { TableBuilderColumnDraft } from '../../lib/table-builder/table-builder-draft'
import { tableBuilderGroupEmptyClasses } from './table-builder.variants'
import {
  tableBuilderValuesGridClasses,
  tableBuilderValuesScrollClasses,
} from './table-builder-values.variants'
import { TableBuilderValuesAddRow } from './table-builder-values-add-row'
import { TableBuilderValuesHeader } from './table-builder-values-header'
import { TableBuilderValuesRow } from './table-builder-values-row'

const ROWS_EMPTY_MESSAGE = 'No rows added.'

export type TableBuilderValuesGridProps = {
  allowedLevels: readonly number[]
  columns: readonly TableBuilderColumnDraft[]
  fields: ReadonlyArray<{ id: string }>
  rowLevels: readonly (number | undefined)[]
  usedLevels: readonly number[]
  includeLevel: boolean
  gridTemplate: string
  addRowDisabled: boolean
  onLevelChange: (index: number, level: string) => void
  onAddRow: () => void
  onRemoveRow: (index: number) => void
}

export function TableBuilderValuesGrid({
  allowedLevels,
  columns,
  fields,
  rowLevels,
  usedLevels,
  includeLevel,
  gridTemplate,
  addRowDisabled,
  onLevelChange,
  onAddRow,
  onRemoveRow,
}: TableBuilderValuesGridProps) {
  return (
    <>
      <div className={tableBuilderValuesScrollClasses}>
        <div className={tableBuilderValuesGridClasses}>
          <TableBuilderValuesHeader
            columns={columns}
            gridTemplate={gridTemplate}
            includeLevel={includeLevel}
          />

          {fields.length === 0 ? (
            <div className={tableBuilderGroupEmptyClasses}>{ROWS_EMPTY_MESSAGE}</div>
          ) : (
            fields.map((field, index) => {
              const ownLevel = rowLevels[index]
              const otherUsedLevels = new Set(usedLevels.filter((level) => level !== ownLevel))
              return (
                <TableBuilderValuesRow
                  key={field.id}
                  index={index}
                  columns={columns}
                  includeLevel={includeLevel}
                  allowedLevels={allowedLevels}
                  usedLevels={otherUsedLevels}
                  onLevelChange={onLevelChange}
                  onRemove={onRemoveRow}
                />
              )
            })
          )}
        </div>
      </div>
      <TableBuilderValuesAddRow
        includeLevel={includeLevel}
        addRowDisabled={addRowDisabled}
        onAddRow={onAddRow}
      />
    </>
  )
}
