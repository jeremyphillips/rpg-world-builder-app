import type { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  TABLE_NUMBER_FORMATS,
  TABLE_NUMBER_FORMAT_ENTRIES,
  formatFieldMessage,
  type TableColumnValueType,
  type TableNumberFormat,
} from '@rpg/contracts'
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  dragHandleVariants,
  iconGhostControlVariants,
} from '@rpg/ui'

import {
  TABLE_BUILDER_COLUMN_NAME_LABEL,
  TABLE_BUILDER_COLUMN_TYPE_LABEL,
  TABLE_BUILDER_NUMBER_FORMAT_LABEL,
} from '../../lib/table-builder/table-builder-copy'
import type { TableBuilderFormValues } from '../../lib/table-builder/table-builder-draft'
import { TABLE_COLUMN_VALUE_TYPE_OPTIONS } from './table-builder-column-type'
import {
  tableBuilderColumnErrorClasses,
  tableBuilderColumnFormatSlotClasses,
  tableBuilderColumnLeadingSlotClasses,
  tableBuilderColumnNameCellClasses,
  tableBuilderColumnRowClasses,
  tableBuilderColumnTypeIconClasses,
  tableBuilderColumnTypeOptionClasses,
  tableBuilderColumnTypeTriggerClasses,
} from './table-builder-columns.variants'

export type TableBuilderColumnRowProps = {
  index: number
  columnKey: string
  sortable: boolean
  onRequestTypeChange: (index: number, valueType: TableColumnValueType) => void
  onRemove: (index: number) => void
}

function columnDisplayName(label: string, index: number): string {
  const trimmed = label.trim()
  return trimmed === '' ? `column ${index + 1}` : trimmed
}

export function TableBuilderColumnRow({
  index,
  columnKey,
  sortable,
  onRequestTypeChange,
  onRemove,
}: TableBuilderColumnRowProps) {
  const form = useFormContext<TableBuilderFormValues>()
  const label = useWatch({ control: form.control, name: `columns.${index}.label` }) ?? ''
  const valueType = useWatch({ control: form.control, name: `columns.${index}.valueType` })
  const format = useWatch({ control: form.control, name: `columns.${index}.format` })

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: columnKey,
    disabled: !sortable,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const displayName = columnDisplayName(label, index)
  const labelError = form.getFieldState(`columns.${index}.label`, form.formState).error

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={tableBuilderColumnRowClasses}
      data-dragging={isDragging ? 'true' : undefined}
    >
      <div className={tableBuilderColumnLeadingSlotClasses}>
        <button
          type="button"
          className={dragHandleVariants({ visibility: 'always', dragging: isDragging })}
          aria-label={`Drag to reorder ${displayName}`}
          disabled={!sortable}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className={tableBuilderColumnNameCellClasses}>
        <Input
          size="sm"
          aria-label={`${TABLE_BUILDER_COLUMN_NAME_LABEL} ${index + 1}`}
          aria-invalid={labelError ? true : undefined}
          placeholder={TABLE_BUILDER_COLUMN_NAME_LABEL}
          {...form.register(`columns.${index}.label`)}
        />
        {labelError?.message ? (
          <p className={tableBuilderColumnErrorClasses}>{formatFieldMessage(labelError.message)}</p>
        ) : null}
      </div>

      <Select
        value={valueType}
        onValueChange={(next) => onRequestTypeChange(index, next as TableColumnValueType)}
      >
        <SelectTrigger
          size="sm"
          className={tableBuilderColumnTypeTriggerClasses}
          aria-label={`${TABLE_BUILDER_COLUMN_TYPE_LABEL} for ${displayName}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TABLE_COLUMN_VALUE_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <SelectItem key={option.value} value={option.value}>
                <span className={tableBuilderColumnTypeOptionClasses}>
                  <Icon className={tableBuilderColumnTypeIconClasses} aria-hidden />
                  {option.label}
                </span>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      <div className={tableBuilderColumnFormatSlotClasses}>
        {valueType === 'number' ? (
          <Select
            value={format}
            onValueChange={(next) =>
              form.setValue(`columns.${index}.format`, next as TableNumberFormat, {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger
              size="sm"
              aria-label={`${TABLE_BUILDER_NUMBER_FORMAT_LABEL} for ${displayName}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABLE_NUMBER_FORMATS.map((value) => (
                <SelectItem key={value} value={value}>
                  {TABLE_NUMBER_FORMAT_ENTRIES[value].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      <div className={tableBuilderColumnLeadingSlotClasses}>
        <button
          type="button"
          className={iconGhostControlVariants({ hover: 'destructiveSubtle', layout: 'flex' })}
          aria-label={`Delete ${displayName}`}
          onClick={() => onRemove(index)}
        >
          <Trash2 aria-hidden />
        </button>
      </div>
    </div>
  )
}
