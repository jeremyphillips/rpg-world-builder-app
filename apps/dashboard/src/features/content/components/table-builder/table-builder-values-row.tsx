import { Trash2 } from 'lucide-react'
import { useFormContext, useWatch, type FieldPath } from 'react-hook-form'
import { DIE_FACES } from '@rpg/contracts'
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  iconGhostControlVariants,
} from '@rpg/ui'

import type {
  TableBuilderColumnDraft,
  TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { parseLevelDraft } from '../../lib/table-builder/table-builder-draft'
import {
  tableBuilderValuesActionCellClasses,
  tableBuilderValuesCellClasses,
  tableBuilderValuesDiceCellClasses,
  tableBuilderValuesDiceCountClasses,
  tableBuilderValuesDiceJoinerClasses,
  tableBuilderValuesGridTemplate,
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

function fieldPath(path: string): FieldPath<TableBuilderFormValues> {
  return path as FieldPath<TableBuilderFormValues>
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
  const form = useFormContext<TableBuilderFormValues>()
  const level = useWatch({ control: form.control, name: `rows.${index}.level` }) ?? ''
  const parsedLevel = parseLevelDraft(level)

  const levelError = form.getFieldState(`rows.${index}.level`, form.formState).error

  return (
    <div
      className={tableBuilderValuesRowClasses}
      style={{ gridTemplateColumns: tableBuilderValuesGridTemplate(columns.length, includeLevel) }}
    >
      {includeLevel ? (
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
      ) : null}

      {columns.map((column, columnIndex) => (
        <TableBuilderValueCell
          key={column.key}
          rowIndex={index}
          column={column}
          columnIndex={columnIndex}
          level={parsedLevel}
        />
      ))}

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
    </div>
  )
}

type TableBuilderValueCellProps = {
  rowIndex: number
  column: TableBuilderColumnDraft
  columnIndex: number
  level: number | undefined
}

function TableBuilderValueCell({
  rowIndex,
  column,
  columnIndex,
  level,
}: TableBuilderValueCellProps) {
  const form = useFormContext<TableBuilderFormValues>()
  const cellPath = `rows.${rowIndex}.cells.${column.key}`
  const cellValue = useWatch({ control: form.control, name: fieldPath(cellPath) })
  const cellError = form.getFieldState(fieldPath(cellPath), form.formState).error
  const ariaLabel = cellAriaLabel(column, columnIndex, level)

  if (column.valueType === 'dice') {
    const facesPath = fieldPath(`${cellPath}.faces`)
    const faces =
      typeof cellValue === 'object' && cellValue !== null && 'faces' in cellValue
        ? String(cellValue.faces ?? '')
        : ''

    return (
      <div className={tableBuilderValuesDiceCellClasses}>
        <Input
          size="sm"
          className={tableBuilderValuesDiceCountClasses}
          inputMode="numeric"
          aria-label={`${ariaLabel}, dice count`}
          aria-invalid={cellError ? true : undefined}
          {...form.register(fieldPath(`${cellPath}.count`))}
        />
        <span className={tableBuilderValuesDiceJoinerClasses} aria-hidden>
          d
        </span>
        <Select
          value={faces}
          onValueChange={(next) => {
            form.setValue(facesPath, next as never, { shouldDirty: true })
            const count = form.getValues(fieldPath(`${cellPath}.count`)) as string | undefined
            if (count === undefined || String(count).trim() === '') {
              form.setValue(fieldPath(`${cellPath}.count`), '1' as never, { shouldDirty: true })
            }
          }}
        >
          <SelectTrigger
            size="sm"
            aria-label={`${ariaLabel}, die size`}
            aria-invalid={cellError ? true : undefined}
          >
            <SelectValue placeholder="d—" />
          </SelectTrigger>
          <SelectContent>
            {DIE_FACES.map((face) => (
              <SelectItem key={face} value={String(face)}>
                d{face}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className={tableBuilderValuesCellClasses}>
      <Input
        size="sm"
        inputMode={column.valueType === 'number' ? 'decimal' : undefined}
        aria-label={ariaLabel}
        aria-invalid={cellError ? true : undefined}
        {...form.register(fieldPath(cellPath))}
      />
    </div>
  )
}
