import type { TableBuilderColumnDraft } from '../../lib/table-builder/table-builder-draft'
import { ProgressionTierSeparatorGridBand } from '../tables/progression-tier-separator'
import { useTableBuilderHostConfig } from '../../lib/table-builder/table-builder-host-context'
import { shouldRenderValuesTierSeparator } from '../../lib/table-builder/table-builder-tier-separator.lib'
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
  includeActions?: boolean
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
  includeActions = true,
  addRowDisabled,
  onLevelChange,
  onAddRow,
  onRemoveRow,
}: TableBuilderValuesGridProps) {
  const config = useTableBuilderHostConfig()
  const extendedProgression = config.extendedProgression
  const fixedLevels = config.rows === 'fixedLevels'
  const includeRestoreActions = config.includeRowRestoreActions === true

  return (
    <>
      <div className={tableBuilderValuesScrollClasses}>
        <div className={tableBuilderValuesGridClasses}>
          <TableBuilderValuesHeader
            columns={columns}
            gridTemplate={gridTemplate}
            includeLevel={includeLevel}
            includeActions={includeActions}
            includeRestoreActions={includeRestoreActions}
          />

          {fields.length === 0 ? (
            <div className={tableBuilderGroupEmptyClasses}>{ROWS_EMPTY_MESSAGE}</div>
          ) : (
            fields.map((field, index) => {
              const ownLevel = rowLevels[index]
              const nextLevel = rowLevels[index + 1]
              const otherUsedLevels = new Set(usedLevels.filter((level) => level !== ownLevel))
              const showTierSeparator =
                fixedLevels &&
                extendedProgression !== undefined &&
                shouldRenderValuesTierSeparator(
                  ownLevel,
                  extendedProgression.standardMaxLevel,
                  extendedProgression.tierName,
                  nextLevel,
                )

              return (
                <div key={field.id} className="contents">
                  <TableBuilderValuesRow
                    index={index}
                    columns={columns}
                    includeLevel={includeLevel}
                    allowedLevels={allowedLevels}
                    usedLevels={otherUsedLevels}
                    onLevelChange={onLevelChange}
                    onRemove={onRemoveRow}
                  />
                  {showTierSeparator ? (
                    <ProgressionTierSeparatorGridBand tierName={extendedProgression.tierName} />
                  ) : null}
                </div>
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
