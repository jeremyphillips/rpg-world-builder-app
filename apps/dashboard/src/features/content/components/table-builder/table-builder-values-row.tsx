import { Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import { formatFieldMessage } from '@rpg/contracts'
import {
  buildCommittedDraftLevelsForXpColumn,
  flattenFormTouchedPaths,
} from '@/features/campaign/lib/rules/character-configuration/xp-thresholds-field.lib'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  iconGhostControlVariants,
} from '@rpg/ui'

import { useTableBuilderHostConfig } from '../../lib/table-builder/table-builder-host-context'
import type {
  TableBuilderColumnDraft,
  TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { parseLevelDraft } from '../../lib/table-builder/table-builder-draft'
import { TableBuilderValueCell } from './table-builder-value-cell'
import {
  tableBuilderValuesActionCellClasses,
  tableBuilderValuesGridTemplate,
  tableBuilderValuesLevelLabelClasses,
  tableBuilderValuesRowBlockedHintClasses,
  tableBuilderValuesRowClasses,
} from './table-builder-values.variants'

export type TableBuilderValuesRowProps = {
  index: number
  columns: readonly TableBuilderColumnDraft[]
  includeLevel: boolean
  allowedLevels: readonly number[]
  /** Levels used by other rows — disabled in this row's level select. */
  usedLevels: ReadonlySet<number>
  onLevelChange: (index: number, level: string) => void
  onRemove: (index: number) => void
}

function columnDisplayName(column: TableBuilderColumnDraft, columnIndex: number): string {
  const trimmed = column.label.trim()
  return trimmed === '' ? `Column ${columnIndex + 1}` : trimmed
}

function cellAriaLabel(
  column: TableBuilderColumnDraft,
  columnIndex: number,
  level: number | undefined,
): string {
  const levelPart = level === undefined ? 'level unset' : `level ${level}`
  return `${columnDisplayName(column, columnIndex)}, ${levelPart}`
}

export function TableBuilderValuesRow({
  index,
  columns,
  includeLevel,
  allowedLevels,
  usedLevels,
  onLevelChange,
  onRemove,
}: TableBuilderValuesRowProps) {
  const config = useTableBuilderHostConfig()
  const form = useFormContext<TableBuilderFormValues>()
  const { touchedFields } = useFormState({ control: form.control })
  const draft = useWatch({ control: form.control }) as TableBuilderFormValues
  const level = useWatch({ control: form.control, name: `rows.${index}.level` }) ?? ''
  const parsedLevel = parseLevelDraft(level)
  const fixedLevels = config.rows === 'fixedLevels'

  const levelError = form.getFieldState(`rows.${index}.level`, form.formState).error
  const committedDraftLevels = useMemo(() => {
    const columnKey = draft.columns[0]?.key
    if (columnKey === undefined) return undefined
    return buildCommittedDraftLevelsForXpColumn(
      draft,
      columnKey,
      flattenFormTouchedPaths(touchedFields),
    )
  }, [draft, touchedFields])
  const rowPresentation = config.resolveRowPresentation?.({
    draft,
    rowIndex: index,
    level: parsedLevel,
    committedDraftLevels,
  })

  return (
    <div
      className={tableBuilderValuesRowClasses}
      style={{
        gridTemplateColumns: tableBuilderValuesGridTemplate(
          columns.length,
          includeLevel,
          !fixedLevels,
        ),
      }}
    >
      {includeLevel ? (
        fixedLevels ? (
          <div className={tableBuilderValuesLevelLabelClasses}>{parsedLevel ?? '—'}</div>
        ) : (
          <Select value={level} onValueChange={(next) => onLevelChange(index, next)}>
            <SelectTrigger
              size="sm"
              aria-label={`Level, row ${index + 1}`}
              aria-invalid={levelError ? true : undefined}
            >
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              {allowedLevels.map((allowedLevel) => (
                <SelectItem
                  key={allowedLevel}
                  value={String(allowedLevel)}
                  disabled={usedLevels.has(allowedLevel) && allowedLevel !== parsedLevel}
                >
                  {allowedLevel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      ) : null}

      {columns.map((column, columnIndex) => (
        <TableBuilderValueCell
          key={column.key}
          draft={draft}
          rowIndex={index}
          column={column}
          columnIndex={columnIndex}
          level={parsedLevel}
          ariaLabel={cellAriaLabel(column, columnIndex, parsedLevel)}
          rowReadOnly={rowPresentation?.readOnly === true}
        />
      ))}

      {!fixedLevels ? (
        <div className={tableBuilderValuesActionCellClasses}>
          <button
            type="button"
            className={iconGhostControlVariants({ hover: 'destructiveSubtle', layout: 'flex' })}
            aria-label={
              parsedLevel === undefined
                ? `Delete row ${index + 1}`
                : `Delete row for level ${parsedLevel}`
            }
            onClick={() => onRemove(index)}
          >
            <Trash2 aria-hidden />
          </button>
        </div>
      ) : null}
      {rowPresentation?.blockedHint ? (
        <p className={tableBuilderValuesRowBlockedHintClasses}>
          {formatFieldMessage(rowPresentation.blockedHint)}
        </p>
      ) : null}
    </div>
  )
}
