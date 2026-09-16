import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { formatFieldMessage } from '@rpg/contracts'
import { FormSectionHeader } from '@rpg/ui/form'

import {
  TABLE_BUILDER_ADD_ROW_LABEL,
  TABLE_BUILDER_ALL_LEVELS_USED_REASON,
  TABLE_BUILDER_LEVEL_HEADER,
  TABLE_BUILDER_VALUES_HINT,
  TABLE_BUILDER_VALUES_LABEL,
} from '../../lib/table-builder/table-builder-copy'
import {
  parseLevelDraft,
  resolveRowSortMove,
  tableBuilderColumnFallbackLabel,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { resolveNextUnusedLevel } from '../../lib/table-builder/resolve-next-unused-level'
import {
  tableBuilderAddActionClasses,
  tableBuilderAddActionWrapClasses,
  tableBuilderGroupClasses,
  tableBuilderGroupEmptyClasses,
  tableBuilderSectionClasses,
  tableBuilderSectionErrorClasses,
} from './table-builder.variants'
import {
  tableBuilderValuesGridClasses,
  tableBuilderValuesGridTemplate,
  tableBuilderValuesHeaderCellClasses,
  tableBuilderValuesHeaderRowClasses,
  tableBuilderValuesScrollClasses,
} from './table-builder-values.variants'
import { TableBuilderValuesRow } from './table-builder-values-row'

const ROWS_EMPTY_MESSAGE = 'No rows added.'

export type TableBuilderValuesProps = {
  allowedLevels: readonly number[]
}

export function TableBuilderValues({ allowedLevels }: TableBuilderValuesProps) {
  const form = useFormContext<TableBuilderFormValues>()
  const fieldArray = useFieldArray({ control: form.control, name: 'rows' })

  const columns = useWatch({ control: form.control, name: 'columns' }) ?? []
  const rows = useWatch({ control: form.control, name: 'rows' }) ?? []

  const rowLevels = rows.map((row) => parseLevelDraft(row?.level ?? ''))
  const usedLevels = rowLevels.filter((level): level is number => level !== undefined)
  const nextLevel = resolveNextUnusedLevel(usedLevels, allowedLevels)

  const rowsError = form.getFieldState('rows', form.formState).error
  const gridTemplate = tableBuilderValuesGridTemplate(columns.length)

  function handleLevelChange(index: number, level: string) {
    form.setValue(`rows.${index}.level`, level, { shouldDirty: true, shouldValidate: false })

    const nextLevels = rowLevels.map((existing, rowIndex) =>
      rowIndex === index ? parseLevelDraft(level) : existing,
    )
    const move = resolveRowSortMove(nextLevels, index)
    if (move) fieldArray.move(move.from, move.to)
  }

  function handleAddRow() {
    if (nextLevel === undefined) return
    fieldArray.append({ level: String(nextLevel), cells: {} })
  }

  return (
    <section className={tableBuilderSectionClasses} aria-label={TABLE_BUILDER_VALUES_LABEL}>
      <FormSectionHeader
        label={TABLE_BUILDER_VALUES_LABEL}
        hint={TABLE_BUILDER_VALUES_HINT}
        tier="subsection"
        required
      />
      <div className={tableBuilderGroupClasses}>
        <div className={tableBuilderValuesScrollClasses}>
          <div className={tableBuilderValuesGridClasses}>
            <div
              className={tableBuilderValuesHeaderRowClasses}
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <div className={tableBuilderValuesHeaderCellClasses}>
                {TABLE_BUILDER_LEVEL_HEADER}
              </div>
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

            {fieldArray.fields.length === 0 ? (
              <div className={tableBuilderGroupEmptyClasses}>{ROWS_EMPTY_MESSAGE}</div>
            ) : (
              fieldArray.fields.map((field, index) => {
                const ownLevel = rowLevels[index]
                const otherUsedLevels = new Set(usedLevels.filter((level) => level !== ownLevel))
                return (
                  <TableBuilderValuesRow
                    key={field.id}
                    index={index}
                    columns={columns}
                    allowedLevels={allowedLevels}
                    usedLevels={otherUsedLevels}
                    onLevelChange={handleLevelChange}
                    onRemove={fieldArray.remove}
                  />
                )
              })
            )}
          </div>
        </div>
        <div className={tableBuilderAddActionWrapClasses}>
          <button
            type="button"
            className={tableBuilderAddActionClasses}
            onClick={handleAddRow}
            disabled={nextLevel === undefined}
            title={nextLevel === undefined ? TABLE_BUILDER_ALL_LEVELS_USED_REASON : undefined}
          >
            <Plus className="size-4" aria-hidden />
            {TABLE_BUILDER_ADD_ROW_LABEL}
            {nextLevel === undefined ? (
              <span className="sr-only">{TABLE_BUILDER_ALL_LEVELS_USED_REASON}</span>
            ) : null}
          </button>
        </div>
      </div>
      {rowsError?.message ? (
        <p className={tableBuilderSectionErrorClasses}>{formatFieldMessage(rowsError.message)}</p>
      ) : null}
    </section>
  )
}
