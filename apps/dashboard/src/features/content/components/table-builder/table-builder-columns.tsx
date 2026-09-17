import { useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { formatFieldMessage, type TableColumnValueType } from '@rpg/contracts'
import { FormSectionHeader } from '@rpg/ui/form'

import { resolveSortableArrayMove } from '../../lib/utils/sortable-array-move.lib'
import {
  TABLE_BUILDER_ADD_COLUMN_LABEL,
  TABLE_BUILDER_COLUMNS_HINT,
  TABLE_BUILDER_COLUMNS_LABEL,
  TABLE_BUILDER_GENERAL_COLUMNS_HINT,
} from '../../lib/table-builder/table-builder-copy'
import {
  createTableBuilderColumnDraft,
  emptyCellDraftForValueType,
  isTableBuilderCellBlank,
  removeTableBuilderColumnAt,
  resolveTableBuilderColumnDeleteIntent,
  type TableBuilderColumnDeleteIntent,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { useTableBuilderHostConfig } from '../../lib/table-builder/table-builder-host-context'
import { createGeneralTableBuilderColumnDraft } from '../../lib/table-builder/table-builder-general-draft'
import {
  tableBuilderAddActionClasses,
  tableBuilderSectionClasses,
  tableBuilderSectionErrorClasses,
} from './table-builder.variants'
import { TableBuilderColumnRow } from './table-builder-column-row'
import { TableBuilderColumnsConfirmDialogs } from './table-builder-columns-confirm-dialogs'
import { TableBuilderColumnsEmpty } from './table-builder-columns-empty'
import {
  tableBuilderColumnsBodyClasses,
  tableBuilderColumnsListClasses,
} from './table-builder-columns.variants'

type PendingTypeChange = {
  index: number
  valueType: TableColumnValueType
}

type PendingColumnDelete = {
  index: number
  reason: Extract<TableBuilderColumnDeleteIntent, { action: 'confirm' }>['reason']
}

export function TableBuilderColumns() {
  const config = useTableBuilderHostConfig()
  const form = useFormContext<TableBuilderFormValues>()
  const kind = useWatch({ control: form.control, name: 'kind' }) ?? 'levelProgression'
  const fieldArray = useFieldArray({ control: form.control, name: 'columns' })
  const [pendingTypeChange, setPendingTypeChange] = useState<PendingTypeChange | null>(null)
  const [pendingColumnDelete, setPendingColumnDelete] = useState<PendingColumnDelete | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const columns = form.watch('columns')
  const sortable = fieldArray.fields.length > 1
  const sortableItems = columns.map((column) => ({ id: column.key }))

  const columnsError = form.getFieldState('columns', form.formState).error

  function applyTypeChange(index: number, valueType: TableColumnValueType) {
    const column = form.getValues(`columns.${index}`)
    form.setValue(`columns.${index}.valueType`, valueType, { shouldDirty: true })
    if (valueType !== 'number') {
      form.setValue(`columns.${index}.format`, 'plain', { shouldDirty: true })
    }

    const rows = form.getValues('rows')
    rows.forEach((row, rowIndex) => {
      if (row.cells[column.key] === undefined) return
      form.setValue(`rows.${rowIndex}.cells.${column.key}`, emptyCellDraftForValueType(valueType), {
        shouldDirty: true,
      })
    })
  }

  function handleRequestTypeChange(index: number, valueType: TableColumnValueType) {
    const column = form.getValues(`columns.${index}`)
    if (column.valueType === valueType) return

    const rows = form.getValues('rows')
    const hasValues = rows.some((row) => !isTableBuilderCellBlank(row.cells[column.key]))

    if (!hasValues) {
      applyTypeChange(index, valueType)
      return
    }

    setPendingTypeChange({ index, valueType })
  }

  function handleConfirmTypeChange() {
    if (pendingTypeChange) {
      applyTypeChange(pendingTypeChange.index, pendingTypeChange.valueType)
    }
    setPendingTypeChange(null)
  }

  function applyColumnRemoval(index: number) {
    const next = removeTableBuilderColumnAt(form.getValues(), index)
    form.setValue('columns', next.columns, { shouldDirty: true })
    form.setValue('rows', next.rows, { shouldDirty: true })
  }

  function handleRequestColumnRemove(index: number) {
    const intent = resolveTableBuilderColumnDeleteIntent(form.getValues(), index)
    if (intent.action === 'immediate') {
      applyColumnRemoval(index)
      return
    }

    setPendingColumnDelete({ index, reason: intent.reason })
  }

  function handleConfirmColumnDelete() {
    if (pendingColumnDelete) {
      applyColumnRemoval(pendingColumnDelete.index)
    }
    setPendingColumnDelete(null)
  }

  function handleAddColumn() {
    const index = fieldArray.fields.length
    fieldArray.append(
      kind === 'general' ? createGeneralTableBuilderColumnDraft() : createTableBuilderColumnDraft(),
    )
    setTimeout(() => form.setFocus(`columns.${index}.label`), 0)
  }

  function handleDragEnd(event: DragEndEvent) {
    const resolved = resolveSortableArrayMove(sortableItems, event)
    if (!resolved) return
    fieldArray.move(resolved.from, resolved.to)
  }

  const hasColumns = fieldArray.fields.length > 0

  if (config.columns === 'fixed') return null

  const columnList = (
    <div className={tableBuilderColumnsListClasses}>
      {fieldArray.fields.map((field, index) => {
        const columnKey = columns[index]?.key ?? field.id
        return (
          <TableBuilderColumnRow
            key={field.id}
            index={index}
            columnKey={columnKey}
            sortable={sortable}
            onRequestTypeChange={handleRequestTypeChange}
            onRemove={handleRequestColumnRemove}
          />
        )
      })}
    </div>
  )

  return (
    <section className={tableBuilderSectionClasses} aria-label={TABLE_BUILDER_COLUMNS_LABEL}>
      <FormSectionHeader
        label={TABLE_BUILDER_COLUMNS_LABEL}
        hint={kind === 'general' ? TABLE_BUILDER_GENERAL_COLUMNS_HINT : TABLE_BUILDER_COLUMNS_HINT}
        labelPresentation="field-label"
        size="md"
        required
      />
      {hasColumns ? (
        <div className={tableBuilderColumnsBodyClasses}>
          {sortable ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {columnList}
              </SortableContext>
            </DndContext>
          ) : (
            columnList
          )}
          <button type="button" className={tableBuilderAddActionClasses} onClick={handleAddColumn}>
            <Plus className="size-4" aria-hidden />
            {TABLE_BUILDER_ADD_COLUMN_LABEL}
          </button>
        </div>
      ) : (
        <TableBuilderColumnsEmpty onAddColumn={handleAddColumn} />
      )}
      {columnsError?.message ? (
        <p className={tableBuilderSectionErrorClasses}>
          {formatFieldMessage(columnsError.message)}
        </p>
      ) : null}

      <TableBuilderColumnsConfirmDialogs
        pendingTypeChange={pendingTypeChange}
        pendingColumnDelete={pendingColumnDelete}
        onPendingTypeChangeOpenChange={(open) => {
          if (!open) setPendingTypeChange(null)
        }}
        onPendingColumnDeleteOpenChange={(open) => {
          if (!open) setPendingColumnDelete(null)
        }}
        onConfirmTypeChange={handleConfirmTypeChange}
        onConfirmColumnDelete={handleConfirmColumnDelete}
      />
    </section>
  )
}
