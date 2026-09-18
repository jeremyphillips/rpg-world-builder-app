import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import {
  createTableBuilderRowKey,
  parseLevelDraft,
  resolveRowSortMove,
  type TableBuilderColumnDraft,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { useTableBuilderHostConfig } from '../../lib/table-builder/table-builder-host-context'
import {
  TABLE_BUILDER_GENERAL_VALUES_HINT,
  TABLE_BUILDER_VALUES_HINT,
  TABLE_BUILDER_VALUES_NO_COLUMNS_HINT,
} from '../../lib/table-builder/table-builder-copy'
import { resolveNextUnusedLevel } from '../../lib/table-builder/resolve-next-unused-level'
import { tableBuilderValuesGridTemplate } from './table-builder-values.variants'

export function resolveTableBuilderValuesHint(
  hasNoColumns: boolean,
  includeLevel: boolean,
): string {
  if (hasNoColumns) return TABLE_BUILDER_VALUES_NO_COLUMNS_HINT
  if (includeLevel) return TABLE_BUILDER_VALUES_HINT
  return TABLE_BUILDER_GENERAL_VALUES_HINT
}

export type TableBuilderValuesState = {
  columns: TableBuilderColumnDraft[]
  rowsErrorMessage: string | undefined
  includeLevel: boolean
  hasNoColumns: boolean
  gridTemplate: string
  fields: ReturnType<typeof useFieldArray<TableBuilderFormValues, 'rows'>>['fields']
  rowLevels: Array<number | undefined>
  usedLevels: number[]
  addRowDisabled: boolean
  handleLevelChange: (index: number, level: string) => void
  handleAddRow: () => void
  removeRow: (index: number) => void
}

export function useTableBuilderValues(allowedLevels: readonly number[]): TableBuilderValuesState {
  const config = useTableBuilderHostConfig()
  const form = useFormContext<TableBuilderFormValues>()
  const fieldArray = useFieldArray({ control: form.control, name: 'rows' })
  const fixedLevels = config.rows === 'fixedLevels'

  const kind = useWatch({ control: form.control, name: 'kind' }) ?? 'levelProgression'
  const columns = useWatch({ control: form.control, name: 'columns' }) ?? []
  const rows = useWatch({ control: form.control, name: 'rows' }) ?? []

  const includeLevel = kind === 'levelProgression'
  const hasNoColumns = columns.length === 0
  const rowLevels = rows.map((row) => parseLevelDraft(row?.level ?? ''))
  const usedLevels = rowLevels.filter((level): level is number => level !== undefined)
  const nextLevel = includeLevel ? resolveNextUnusedLevel(usedLevels, allowedLevels) : 0
  const addRowDisabled = includeLevel && nextLevel === undefined

  const rowsError = form.getFieldState('rows', form.formState).error

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

  return {
    columns,
    rowsErrorMessage: rowsError?.message,
    includeLevel,
    hasNoColumns,
    gridTemplate: tableBuilderValuesGridTemplate(
      columns.length,
      includeLevel,
      !fixedLevels,
      config.includeRowRestoreActions === true,
    ),
    fields: fieldArray.fields,
    rowLevels,
    usedLevels,
    addRowDisabled,
    handleLevelChange,
    handleAddRow,
    removeRow: fieldArray.remove,
  }
}
