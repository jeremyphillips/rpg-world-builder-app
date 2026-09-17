import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { formatFieldMessage } from '@rpg/contracts'
import { FormSectionHeader } from '@rpg/ui/form'

import {
  TABLE_BUILDER_GENERAL_VALUES_HINT,
  TABLE_BUILDER_VALUES_HINT,
  TABLE_BUILDER_VALUES_LABEL,
} from '../../lib/table-builder/table-builder-copy'
import {
  createTableBuilderRowKey,
  parseLevelDraft,
  resolveRowSortMove,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import type { TableBuilderKind } from '../../lib/table-builder/table-builder-kind'
import { resolveNextUnusedLevel } from '../../lib/table-builder/resolve-next-unused-level'
import {
  tableBuilderGroupClasses,
  tableBuilderGroupEmptyClasses,
  tableBuilderSectionClasses,
  tableBuilderSectionErrorClasses,
} from './table-builder.variants'
import {
  tableBuilderValuesGridClasses,
  tableBuilderValuesGridTemplate,
  tableBuilderValuesScrollClasses,
} from './table-builder-values.variants'
import { TableBuilderValuesRow } from './table-builder-values-row'
import { TableBuilderValuesHeader } from './table-builder-values-header'
import { TableBuilderValuesAddRow } from './table-builder-values-add-row'

const ROWS_EMPTY_MESSAGE = 'No rows added.'

export type TableBuilderValuesProps = {
  kind: TableBuilderKind
  allowedLevels: readonly number[]
}

export function TableBuilderValues({ kind, allowedLevels }: TableBuilderValuesProps) {
  const form = useFormContext<TableBuilderFormValues>()
  const fieldArray = useFieldArray({ control: form.control, name: 'rows' })

  const columns = useWatch({ control: form.control, name: 'columns' }) ?? []
  const rows = useWatch({ control: form.control, name: 'rows' }) ?? []

  const includeLevel = kind === 'levelProgression'
  const rowLevels = rows.map((row) => parseLevelDraft(row?.level ?? ''))
  const usedLevels = rowLevels.filter((level): level is number => level !== undefined)
  const nextLevel = includeLevel ? resolveNextUnusedLevel(usedLevels, allowedLevels) : 0
  const addRowDisabled = includeLevel && nextLevel === undefined

  const rowsError = form.getFieldState('rows', form.formState).error
  const gridTemplate = tableBuilderValuesGridTemplate(columns.length, includeLevel)

  function handleLevelChange(index: number, level: string) {
    form.setValue(`rows.${index}.level`, level, { shouldDirty: true, shouldValidate: false })

    const nextLevels = rowLevels.map((existing, rowIndex) =>
      rowIndex === index ? parseLevelDraft(level) : existing,
    )
    const move = resolveRowSortMove(nextLevels, index)
    if (move) fieldArray.move(move.from, move.to)
  }

  function handleAddRow() {
    if (includeLevel) {
      if (nextLevel === undefined) return
      fieldArray.append({ level: String(nextLevel), cells: {} })
      return
    }
    fieldArray.append({ key: createTableBuilderRowKey(), cells: {} })
  }

  return (
    <section className={tableBuilderSectionClasses} aria-label={TABLE_BUILDER_VALUES_LABEL}>
      <FormSectionHeader
        label={TABLE_BUILDER_VALUES_LABEL}
        hint={includeLevel ? TABLE_BUILDER_VALUES_HINT : TABLE_BUILDER_GENERAL_VALUES_HINT}
        tier="subsection"
        required
      />
      <div className={tableBuilderGroupClasses}>
        <div className={tableBuilderValuesScrollClasses}>
          <div className={tableBuilderValuesGridClasses}>
            <TableBuilderValuesHeader
              columns={columns}
              gridTemplate={gridTemplate}
              includeLevel={includeLevel}
            />

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
                    includeLevel={includeLevel}
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
        <TableBuilderValuesAddRow
          includeLevel={includeLevel}
          addRowDisabled={addRowDisabled}
          onAddRow={handleAddRow}
        />
      </div>
      {rowsError?.message ? (
        <p className={tableBuilderSectionErrorClasses}>{formatFieldMessage(rowsError.message)}</p>
      ) : null}
    </section>
  )
}
