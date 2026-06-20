'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { ConfirmDialog } from './confirm-dialog.client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu.client'
import { Field } from './field.client'
import { fieldGroupLegendVariants } from './field.variants'
import { Input } from './input.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'
import {
  editableGridColumnHeaderVariants,
  editableGridDataCellVariants,
  editableGridHeaderCellVariants,
  editableGridStickyCellVariants,
  editableGridStickyHeaderVariants,
  editableGridTableVariants,
} from './editable-grid.variants'

const BLANK_SELECT_VALUE = '__blank__'
const ROW_LABEL_HEADER = 'Level'

export type EditableGridColumn = {
  key: string
  label: string
  control: 'select' | 'number'
  min?: number
  max?: number
}

export type EditableGridTemplate = {
  name: string
  values: (number | null)[]
}

export type EditableGridTemplates = Partial<Record<string, EditableGridTemplate[]>>

/** Column key → dense per-row values (`null` = blank / unset). */
export type EditableGridValue = Record<string, (number | null)[]>

export interface EditableGridProps {
  id?: string
  columns: EditableGridColumn[]
  rowCount: number
  value: EditableGridValue
  onChange: (value: EditableGridValue) => void
  legend?: string
  error?: string
  templates?: EditableGridTemplates
  disabled?: boolean
  className?: string
}

type PendingTemplate = {
  columnKey: string
  columnLabel: string
  template: EditableGridTemplate
}

function selectOptionsForColumn(column: EditableGridColumn): { value: string; label: string }[] {
  const min = column.min ?? 1
  const max = column.max ?? 6
  const options = [{ value: BLANK_SELECT_VALUE, label: '—' }]
  for (let n = min; n <= max; n += 1) {
    options.push({ value: String(n), label: String(n) })
  }
  return options
}

function cellToSelectValue(cell: number | null): string {
  return cell === null ? BLANK_SELECT_VALUE : String(cell)
}

function selectValueToCell(raw: string): number | null {
  return raw === BLANK_SELECT_VALUE ? null : Number(raw)
}

function parseNumberInput(raw: string): number | null {
  if (raw === '') return null
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? null : parsed
}

function formatNumberCell(cell: number | null): string {
  return cell === null ? '' : String(cell)
}

function rowLabel(rowIndex: number): string {
  return String(rowIndex + 1)
}

function cellAriaLabel(columnLabel: string, rowIndex: number): string {
  return `${columnLabel}, level ${rowIndex + 1}`
}

function updateColumnValue(
  value: EditableGridValue,
  columnKey: string,
  rowIndex: number,
  nextCell: number | null,
): EditableGridValue {
  const columnValues = value[columnKey] ?? []
  return {
    ...value,
    [columnKey]: columnValues.map((cell, index) => (index === rowIndex ? nextCell : cell)),
  }
}

function replaceColumnValues(
  value: EditableGridValue,
  columnKey: string,
  nextValues: (number | null)[],
): EditableGridValue {
  return { ...value, [columnKey]: nextValues }
}

type EditableGridSelectCellProps = {
  column: EditableGridColumn
  rowIndex: number
  cell: number | null
  disabled?: boolean
  onChange: (next: number | null) => void
}

function EditableGridSelectCell({
  column,
  rowIndex,
  cell,
  disabled,
  onChange,
}: EditableGridSelectCellProps) {
  const options = selectOptionsForColumn(column)

  return (
    <Select
      value={cellToSelectValue(cell)}
      onValueChange={(next) => onChange(selectValueToCell(next))}
      disabled={disabled}
    >
      <SelectTrigger
        size="sm"
        className="w-full"
        aria-label={cellAriaLabel(column.label, rowIndex)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type EditableGridNumberCellProps = {
  column: EditableGridColumn
  rowIndex: number
  cell: number | null
  disabled?: boolean
  onChange: (next: number | null) => void
}

function EditableGridNumberCell({
  column,
  rowIndex,
  cell,
  disabled,
  onChange,
}: EditableGridNumberCellProps) {
  return (
    <Input
      type="number"
      inputMode="numeric"
      size="sm"
      className="w-full"
      min={column.min}
      max={column.max}
      value={formatNumberCell(cell)}
      disabled={disabled}
      aria-label={cellAriaLabel(column.label, rowIndex)}
      onChange={(event) => onChange(parseNumberInput(event.target.value))}
    />
  )
}

type EditableGridColumnHeaderProps = {
  column: EditableGridColumn
  templates?: EditableGridTemplate[]
  disabled?: boolean
  onTemplateSelect: (template: EditableGridTemplate) => void
}

function EditableGridColumnHeader({
  column,
  templates,
  disabled,
  onTemplateSelect,
}: EditableGridColumnHeaderProps) {
  const hasTemplates = Boolean(templates?.length)

  return (
    <div className={editableGridColumnHeaderVariants()}>
      <span>{column.label}</span>
      {hasTemplates ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" disabled={disabled}>
              Load template
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {templates?.map((template) => (
              <DropdownMenuItem key={template.name} onSelect={() => onTemplateSelect(template)}>
                {template.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}

/**
 * Fixed-row, multi-column editable grid for dense per-level authoring tables.
 * RHF-agnostic — pass `value` / `onChange` from a form adapter or local state.
 */
export function EditableGrid({
  id,
  columns,
  rowCount,
  value,
  onChange,
  legend,
  error,
  templates,
  disabled,
  className,
}: EditableGridProps) {
  const [pendingTemplate, setPendingTemplate] = React.useState<PendingTemplate | null>(null)
  const rowIndexes = React.useMemo(
    () => Array.from({ length: rowCount }, (_, index) => index),
    [rowCount],
  )

  const handleCellChange = React.useCallback(
    (columnKey: string, rowIndex: number, nextCell: number | null) => {
      onChange(updateColumnValue(value, columnKey, rowIndex, nextCell))
    },
    [onChange, value],
  )

  const handleTemplateConfirm = React.useCallback(() => {
    if (!pendingTemplate) return
    onChange(replaceColumnValues(value, pendingTemplate.columnKey, pendingTemplate.template.values))
    setPendingTemplate(null)
  }, [onChange, pendingTemplate, value])

  return (
    <Field.Root id={id} error={error} width="full" className={className}>
      <fieldset className="min-w-0 border-0 p-0">
        {legend ? <legend className={fieldGroupLegendVariants()}>{legend}</legend> : null}
        <Table className={editableGridTableVariants()}>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className={editableGridStickyHeaderVariants()}>
                {ROW_LABEL_HEADER}
              </TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  scope="col"
                  className={editableGridHeaderCellVariants()}
                >
                  <EditableGridColumnHeader
                    column={column}
                    templates={templates?.[column.key]}
                    disabled={disabled}
                    onTemplateSelect={(template) =>
                      setPendingTemplate({
                        columnKey: column.key,
                        columnLabel: column.label,
                        template,
                      })
                    }
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowIndexes.map((rowIndex) => (
              <TableRow key={rowIndex} className="group">
                <TableHead
                  scope="row"
                  className={cn(editableGridStickyCellVariants(), 'text-center font-medium')}
                >
                  {rowLabel(rowIndex)}
                </TableHead>
                {columns.map((column) => {
                  const cell = value[column.key]?.[rowIndex] ?? null
                  return (
                    <TableCell key={column.key} className={editableGridDataCellVariants()}>
                      {column.control === 'select' ? (
                        <EditableGridSelectCell
                          column={column}
                          rowIndex={rowIndex}
                          cell={cell}
                          disabled={disabled}
                          onChange={(next) => handleCellChange(column.key, rowIndex, next)}
                        />
                      ) : (
                        <EditableGridNumberCell
                          column={column}
                          rowIndex={rowIndex}
                          cell={cell}
                          disabled={disabled}
                          onChange={(next) => handleCellChange(column.key, rowIndex, next)}
                        />
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </fieldset>
      <Field.Error />
      <ConfirmDialog
        open={pendingTemplate !== null}
        onOpenChange={(open) => {
          if (!open) setPendingTemplate(null)
        }}
        headline="Replace column values?"
        description={
          pendingTemplate
            ? `Load "${pendingTemplate.template.name}"? This replaces all values in the ${pendingTemplate.columnLabel} column.`
            : undefined
        }
        confirmLabel="Replace"
        confirmVariant="destructive"
        onConfirm={handleTemplateConfirm}
      />
    </Field.Root>
  )
}

/** Builds an empty dense grid value for the given columns and row count. */
export function createEditableGridValue(
  columns: EditableGridColumn[],
  rowCount: number,
): EditableGridValue {
  return Object.fromEntries(
    columns.map((column) => [column.key, Array.from({ length: rowCount }, () => null)]),
  )
}
