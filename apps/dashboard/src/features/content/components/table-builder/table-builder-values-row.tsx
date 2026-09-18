import { RotateCcw, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import type { FieldPath } from 'react-hook-form'
import { formatFieldMessage } from '@rpg/contracts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  iconGhostControlVariants,
} from '@rpg/ui'

import { flattenFormTouchedPaths } from '../../lib/table-builder/table-builder-form-touched.lib'
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

function TableBuilderValuesRowLevelField({
  index,
  level,
  parsedLevel,
  fixedLevels,
  allowedLevels,
  usedLevels,
  levelError,
  onLevelChange,
}: {
  index: number
  level: string
  parsedLevel: number | undefined
  fixedLevels: boolean
  allowedLevels: readonly number[]
  usedLevels: ReadonlySet<number>
  levelError: { message?: string } | undefined
  onLevelChange: (index: number, level: string) => void
}) {
  if (fixedLevels) {
    return <div className={tableBuilderValuesLevelLabelClasses}>{parsedLevel ?? '—'}</div>
  }

  return (
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
}

function TableBuilderValuesRowRestoreButton({
  restoreAction,
  onRestore,
}: {
  restoreAction: { ariaLabel: string; tooltip: string }
  onRestore: () => void
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={iconGhostControlVariants({ hover: 'accent', layout: 'flex' })}
            aria-label={restoreAction.ariaLabel}
            onClick={onRestore}
          >
            <RotateCcw aria-hidden className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{restoreAction.tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function TableBuilderValuesRowDeleteButton({
  index,
  parsedLevel,
  onRemove,
}: {
  index: number
  parsedLevel: number | undefined
  onRemove: (index: number) => void
}) {
  return (
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
  )
}

function useTableBuilderValuesRowState(index: number, columns: readonly TableBuilderColumnDraft[]) {
  const config = useTableBuilderHostConfig()
  const form = useFormContext<TableBuilderFormValues>()
  const { touchedFields } = useFormState({ control: form.control })
  const draft = useWatch({ control: form.control }) as TableBuilderFormValues
  const level = useWatch({ control: form.control, name: `rows.${index}.level` }) ?? ''
  const parsedLevel = parseLevelDraft(level)
  const fixedLevels = config.rows === 'fixedLevels'
  const levelError = form.getFieldState(`rows.${index}.level`, form.formState).error
  const touchedFieldPaths = useMemo(() => flattenFormTouchedPaths(touchedFields), [touchedFields])
  const columnKey = draft.columns[0]?.key
  const committedDraftLevels = useMemo(
    () =>
      columnKey === undefined
        ? undefined
        : config.resolveCommittedDraftLevels?.({
            draft,
            columnKey,
            touchedFieldPaths,
          }),
    [config, columnKey, draft, touchedFieldPaths],
  )
  const editorRowStates = useMemo(
    () =>
      config.resolveEditorRowStates?.({
        draft,
        committedDraftLevels,
      }),
    [config, draft, committedDraftLevels],
  )
  const rowPresentation = config.resolveRowPresentation?.({
    draft,
    rowIndex: index,
    level: parsedLevel,
    committedDraftLevels,
    editorRowStates,
  })
  const restoreAction = config.resolveRowRestoreAction?.({
    draft,
    rowIndex: index,
    level: parsedLevel,
    committedDraftLevels,
    editorRowStates,
  })

  function handleRestore() {
    const columnKey = columns[0]?.key
    if (columnKey === undefined) return
    const cellPath = `rows.${index}.cells.${columnKey}` as FieldPath<TableBuilderFormValues>
    form.setValue(cellPath, '' as never, { shouldDirty: true, shouldTouch: true })
    form.clearErrors(cellPath)
  }

  return {
    draft,
    level,
    parsedLevel,
    fixedLevels,
    levelError,
    committedDraftLevels,
    editorRowStates,
    rowPresentation,
    restoreAction,
    includeRestoreActions: config.includeRowRestoreActions === true,
    handleRestore,
  }
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
  const {
    draft,
    level,
    parsedLevel,
    fixedLevels,
    levelError,
    committedDraftLevels,
    editorRowStates,
    rowPresentation,
    restoreAction,
    includeRestoreActions,
    handleRestore,
  } = useTableBuilderValuesRowState(index, columns)

  return (
    <div
      className={tableBuilderValuesRowClasses}
      data-table-builder-level={parsedLevel}
      style={{
        gridTemplateColumns: tableBuilderValuesGridTemplate(
          columns.length,
          includeLevel,
          !fixedLevels,
          includeRestoreActions,
        ),
      }}
    >
      {includeLevel ? (
        <TableBuilderValuesRowLevelField
          index={index}
          level={level}
          parsedLevel={parsedLevel}
          fixedLevels={fixedLevels}
          allowedLevels={allowedLevels}
          usedLevels={usedLevels}
          levelError={levelError}
          onLevelChange={onLevelChange}
        />
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
          committedDraftLevels={committedDraftLevels}
          editorRowStates={editorRowStates}
        />
      ))}

      {includeRestoreActions ? (
        <div className={tableBuilderValuesActionCellClasses}>
          {restoreAction ? (
            <TableBuilderValuesRowRestoreButton
              restoreAction={restoreAction}
              onRestore={handleRestore}
            />
          ) : null}
        </div>
      ) : null}

      {!fixedLevels ? (
        <TableBuilderValuesRowDeleteButton
          index={index}
          parsedLevel={parsedLevel}
          onRemove={onRemove}
        />
      ) : null}
      {rowPresentation?.blockedHint ? (
        <p className={tableBuilderValuesRowBlockedHintClasses}>
          {formatFieldMessage(rowPresentation.blockedHint)}
        </p>
      ) : null}
    </div>
  )
}
