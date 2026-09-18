import * as React from 'react'
import type { ComponentProps } from 'react'
import { Info } from 'lucide-react'
import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
  type FieldPath,
  type UseFormReturn,
} from 'react-hook-form'
import {
  buildCommittedDraftLevelsForXpColumn,
  flattenFormTouchedPaths,
} from '@/features/campaign/lib/rules/character-configuration/xp-thresholds-field.lib'
import { DIE_FACES, formatFieldMessage } from '@rpg/contracts'
import {
  Badge,
  Input,
  NumberInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@rpg/ui'

import { useTableBuilderHostConfig } from '../../lib/table-builder/table-builder-host-context'
import type {
  TableBuilderCellDraft,
  TableBuilderColumnDraft,
  TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { isTableBuilderCellBlank } from '../../lib/table-builder/table-builder-draft'
import type { TableBuilderCellPresentation } from '../../lib/table-builder/table-builder-host-config'
import {
  tableBuilderDerivedBadgeDividerClasses,
  tableBuilderDerivedBadgeSegmentClasses,
  tableBuilderDerivedInputFieldClasses,
  tableBuilderDerivedInputShellClasses,
  tableBuilderValuesCellClasses,
  tableBuilderValuesCellErrorClasses,
  tableBuilderValuesDiceCellClasses,
  tableBuilderValuesDiceCountClasses,
  tableBuilderValuesDiceJoinerClasses,
} from './table-builder-values.variants'

const DERIVED_BADGE_TOOLTIP = 'Calculated from the current XP progression. Edit to make explicit.'

function fieldPath(path: string): FieldPath<TableBuilderFormValues> {
  return path as FieldPath<TableBuilderFormValues>
}

export type TableBuilderValueCellProps = {
  draft: TableBuilderFormValues
  rowIndex: number
  column: TableBuilderColumnDraft
  columnIndex: number
  level: number | undefined
  ariaLabel: string
  rowReadOnly?: boolean
}

function DerivedBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            appearance="soft"
            tone="info"
            size="sm"
            leadingIcon={<Info className="size-3" aria-hidden />}
          >
            Derived
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{DERIVED_BADGE_TOOLTIP}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

type ScalarInputProps = ComponentProps<typeof Input>

function TableBuilderPlainScalarValueInput({
  showDerivedBadge,
  inputProps,
}: {
  showDerivedBadge: boolean
  inputProps: ScalarInputProps
}) {
  if (showDerivedBadge) {
    return (
      <div className={tableBuilderDerivedInputShellClasses}>
        <Input grouped className={tableBuilderDerivedInputFieldClasses} {...inputProps} />
        <div aria-hidden className={tableBuilderDerivedBadgeDividerClasses} />
        <div className={tableBuilderDerivedBadgeSegmentClasses} data-slot="derived-badge">
          <DerivedBadge />
        </div>
      </div>
    )
  }

  return <Input className="min-w-0" {...inputProps} />
}

function TableBuilderGroupedScalarValueInput({
  showDerivedBadge,
  readOnly,
  ariaLabel,
  ariaInvalid,
  placeholder,
  name,
  onBlur,
  onChange,
  value,
}: {
  showDerivedBadge: boolean
  readOnly: boolean
  ariaLabel: string
  ariaInvalid?: boolean
  placeholder?: string
  name: string
  onBlur: React.FocusEventHandler<HTMLInputElement>
  onChange: React.ChangeEventHandler<HTMLInputElement>
  value: string | undefined
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  function focusInputFromShell(event: React.MouseEvent<HTMLDivElement>) {
    if (readOnly) return
    const target = event.target as HTMLElement
    if (target.closest('button') || target.closest('[data-slot="derived-badge"]')) return
    inputRef.current?.focus()
  }

  const input = (
    <NumberInput
      ref={inputRef}
      size="sm"
      formatGrouped
      grouped
      hideSteppers
      readOnly={readOnly}
      disabled={readOnly}
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid}
      placeholder={placeholder}
      name={name}
      onBlur={onBlur}
      onChange={onChange}
      value={value ?? ''}
      rootClassName="min-w-0 w-full flex-1 border-0 bg-transparent shadow-none"
      className={tableBuilderDerivedInputFieldClasses}
    />
  )

  return (
    <div className={tableBuilderDerivedInputShellClasses} onMouseDown={focusInputFromShell}>
      {input}
      {showDerivedBadge ? (
        <>
          <div aria-hidden className={tableBuilderDerivedBadgeDividerClasses} />
          <div className={tableBuilderDerivedBadgeSegmentClasses}>
            <DerivedBadge />
          </div>
        </>
      ) : null}
    </div>
  )
}

function resolveGroupedScalarCellError(
  presentation: TableBuilderCellPresentation,
  fieldState: { isTouched: boolean },
  cellError: { message?: string } | undefined,
  fieldValue: unknown,
): string | undefined {
  const isBlankCell =
    fieldValue === undefined || (typeof fieldValue === 'string' && fieldValue.trim() === '')
  const showProgressionError =
    presentation.progressionError !== undefined &&
    (fieldState.isTouched || cellError !== undefined || isBlankCell)

  if (showProgressionError) {
    return formatFieldMessage(presentation.progressionError!)
  }

  if (cellError) {
    return formatFieldMessage(cellError.message ?? '')
  }

  return undefined
}

function TableBuilderGroupedScalarValueField({
  form,
  cellPath,
  cellError,
  presentation,
  showPlaceholder,
  ariaLabel,
  readOnly,
}: {
  form: UseFormReturn<TableBuilderFormValues>
  cellPath: string
  cellError: { message?: string } | undefined
  presentation: TableBuilderCellPresentation
  showPlaceholder: boolean
  ariaLabel: string
  readOnly: boolean
}) {
  return (
    <div className={tableBuilderValuesCellClasses}>
      <Controller
        name={fieldPath(cellPath)}
        render={({ field, fieldState }) => {
          const resolvedError = resolveGroupedScalarCellError(
            presentation,
            fieldState,
            cellError,
            field.value,
          )

          return (
            <>
              <TableBuilderGroupedScalarValueInput
                showDerivedBadge={presentation.provenanceBadge === 'derived'}
                readOnly={readOnly}
                ariaLabel={ariaLabel}
                ariaInvalid={resolvedError ? true : undefined}
                placeholder={showPlaceholder ? presentation.placeholder : undefined}
                name={field.name}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event)
                  if (cellError !== undefined) {
                    form.clearErrors(fieldPath(cellPath))
                  }
                }}
                value={typeof field.value === 'string' ? field.value : String(field.value ?? '')}
              />
              {resolvedError ? (
                <p className={tableBuilderValuesCellErrorClasses}>{resolvedError}</p>
              ) : null}
            </>
          )
        }}
      />
    </div>
  )
}

function useTableBuilderScalarValueCell(
  draft: TableBuilderFormValues,
  rowIndex: number,
  column: TableBuilderColumnDraft,
  level: number | undefined,
  ariaLabel: string,
) {
  const config = useTableBuilderHostConfig()
  const form = useFormContext<TableBuilderFormValues>()
  const { touchedFields } = useFormState({ control: form.control })
  const liveDraft = useWatch({ control: form.control }) as TableBuilderFormValues
  const cellPath = `rows.${rowIndex}.cells.${column.key}`
  const cellValue = useWatch({
    control: form.control,
    name: fieldPath(cellPath),
  }) as TableBuilderCellDraft | undefined
  const cellError = form.getFieldState(fieldPath(cellPath), form.formState).error
  const presentationDraft: TableBuilderFormValues = {
    kind: liveDraft.kind ?? draft.kind,
    name: liveDraft.name ?? draft.name,
    columns: liveDraft.columns ?? draft.columns,
    rows: liveDraft.rows ?? draft.rows,
  }
  const committedDraftLevels = React.useMemo(
    () =>
      buildCommittedDraftLevelsForXpColumn(
        presentationDraft,
        column.key,
        flattenFormTouchedPaths(touchedFields),
      ),
    [column.key, presentationDraft, touchedFields],
  )

  const presentation: TableBuilderCellPresentation | undefined = config.resolveCellPresentation?.({
    draft: presentationDraft,
    rowIndex,
    level,
    columnKey: column.key,
    draftValue: cellValue,
    committedDraftLevels,
  })
  const showPlaceholder =
    (cellValue === undefined || isTableBuilderCellBlank(cellValue)) &&
    presentation?.placeholder !== undefined

  return {
    form,
    cellPath,
    cellError,
    ariaLabel,
    presentation,
    showPlaceholder,
  }
}

function TableBuilderScalarValueCell({
  draft,
  rowIndex,
  column,
  level,
  ariaLabel,
  rowReadOnly = false,
}: Omit<TableBuilderValueCellProps, 'columnIndex'>) {
  const { form, cellPath, cellError, presentation, showPlaceholder } =
    useTableBuilderScalarValueCell(draft, rowIndex, column, level, ariaLabel)
  const readOnly = rowReadOnly || presentation?.readOnly === true

  if (presentation?.formatGrouped) {
    return (
      <TableBuilderGroupedScalarValueField
        form={form}
        cellPath={cellPath}
        cellError={cellError}
        presentation={presentation}
        showPlaceholder={showPlaceholder}
        ariaLabel={ariaLabel}
        readOnly={readOnly}
      />
    )
  }

  return (
    <div className={tableBuilderValuesCellClasses}>
      <TableBuilderPlainScalarValueInput
        showDerivedBadge={presentation?.provenanceBadge === 'derived'}
        inputProps={{
          size: 'sm',
          inputMode: column.valueType === 'number' ? 'decimal' : undefined,
          'aria-label': ariaLabel,
          'aria-invalid': cellError ? true : undefined,
          placeholder: showPlaceholder ? presentation?.placeholder : undefined,
          readOnly,
          ...form.register(fieldPath(cellPath)),
        }}
      />
    </div>
  )
}

function TableBuilderDiceValueCell({
  form,
  cellPath,
  ariaLabel,
  cellValue,
  cellError,
  readOnly,
}: {
  form: UseFormReturn<TableBuilderFormValues>
  cellPath: string
  ariaLabel: string
  cellValue: TableBuilderCellDraft | undefined
  cellError: boolean
  readOnly: boolean
}) {
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
        disabled={readOnly}
        {...form.register(fieldPath(`${cellPath}.count`))}
      />
      <span className={tableBuilderValuesDiceJoinerClasses} aria-hidden>
        d
      </span>
      <Select
        value={faces}
        disabled={readOnly}
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

function TableBuilderDiceValueCellContainer({
  draft,
  rowIndex,
  column,
  level,
  ariaLabel,
  rowReadOnly = false,
}: Omit<TableBuilderValueCellProps, 'columnIndex'>) {
  const config = useTableBuilderHostConfig()
  const form = useFormContext<TableBuilderFormValues>()
  const cellPath = `rows.${rowIndex}.cells.${column.key}`
  const cellValue = useWatch({
    control: form.control,
    name: fieldPath(cellPath),
  }) as TableBuilderCellDraft | undefined
  const cellError = form.getFieldState(fieldPath(cellPath), form.formState).error
  const presentation = config.resolveCellPresentation?.({
    draft,
    rowIndex,
    level,
    columnKey: column.key,
    draftValue: cellValue,
  })

  return (
    <TableBuilderDiceValueCell
      form={form}
      cellPath={cellPath}
      ariaLabel={ariaLabel}
      cellValue={cellValue}
      cellError={Boolean(cellError)}
      readOnly={rowReadOnly || presentation?.readOnly === true}
    />
  )
}

export function TableBuilderValueCell(props: TableBuilderValueCellProps) {
  if (props.column.valueType === 'dice') {
    return <TableBuilderDiceValueCellContainer {...props} />
  }

  return <TableBuilderScalarValueCell {...props} />
}
