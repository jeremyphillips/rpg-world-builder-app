import type { ComponentProps } from 'react'
import { Info } from 'lucide-react'
import { useFormContext, useWatch, type FieldPath, type UseFormReturn } from 'react-hook-form'
import { DIE_FACES } from '@rpg/contracts'
import {
  Badge,
  Input,
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

function TableBuilderScalarValueInput({
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
        <div className={tableBuilderDerivedBadgeSegmentClasses}>
          <DerivedBadge />
        </div>
      </div>
    )
  }

  return <Input className="min-w-0" {...inputProps} />
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
  const cellPath = `rows.${rowIndex}.cells.${column.key}`
  const cellValue = useWatch({
    control: form.control,
    name: fieldPath(cellPath),
  }) as TableBuilderCellDraft | undefined
  const cellError = form.getFieldState(fieldPath(cellPath), form.formState).error
  const presentation: TableBuilderCellPresentation | undefined = config.resolveCellPresentation?.({
    draft,
    rowIndex,
    level,
    columnKey: column.key,
    draftValue: cellValue,
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
}: Omit<TableBuilderValueCellProps, 'columnIndex'>) {
  const { form, cellPath, cellError, presentation, showPlaceholder } =
    useTableBuilderScalarValueCell(draft, rowIndex, column, level, ariaLabel)

  return (
    <div className={tableBuilderValuesCellClasses}>
      <TableBuilderScalarValueInput
        showDerivedBadge={presentation?.provenanceBadge === 'derived'}
        inputProps={{
          size: 'sm',
          inputMode: column.valueType === 'number' ? 'decimal' : undefined,
          'aria-label': ariaLabel,
          'aria-invalid': cellError ? true : undefined,
          placeholder: showPlaceholder ? presentation?.placeholder : undefined,
          readOnly: presentation?.readOnly === true,
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
      readOnly={presentation?.readOnly === true}
    />
  )
}

export function TableBuilderValueCell(props: TableBuilderValueCellProps) {
  if (props.column.valueType === 'dice') {
    return <TableBuilderDiceValueCellContainer {...props} />
  }

  return <TableBuilderScalarValueCell {...props} />
}
