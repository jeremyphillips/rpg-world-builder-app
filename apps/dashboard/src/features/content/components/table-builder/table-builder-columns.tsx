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
import { useFieldArray, useFormContext } from 'react-hook-form'
import { formatFieldMessage, type TableColumnValueType } from '@rpg/contracts'
import { ConfirmDialog } from '@rpg/ui'
import { FormSectionHeader } from '@rpg/ui/form'

import { resolveSortableArrayMove } from '../../lib/utils/sortable-array-move.lib'
import {
  TABLE_BUILDER_ADD_COLUMN_LABEL,
  TABLE_BUILDER_COLUMNS_HINT,
  TABLE_BUILDER_COLUMNS_LABEL,
  TABLE_BUILDER_GENERAL_COLUMNS_HINT,
  TABLE_BUILDER_TYPE_CHANGE_CONFIRM_DESCRIPTION,
  TABLE_BUILDER_TYPE_CHANGE_CONFIRM_HEADLINE,
  TABLE_BUILDER_TYPE_CHANGE_CONFIRM_LABEL,
} from '../../lib/table-builder/table-builder-copy'
import {
  createTableBuilderColumnDraft,
  emptyCellDraftForValueType,
  isTableBuilderCellBlank,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { createGeneralTableBuilderColumnDraft } from '../../lib/table-builder/table-builder-general-draft'
import type { TableBuilderKind } from '../../lib/table-builder/table-builder-kind'
import {
  tableBuilderAddActionClasses,
  tableBuilderAddActionWrapClasses,
  tableBuilderGroupClasses,
  tableBuilderGroupEmptyClasses,
  tableBuilderGroupListClasses,
  tableBuilderSectionClasses,
  tableBuilderSectionErrorClasses,
} from './table-builder.variants'
import { TableBuilderColumnRow } from './table-builder-column-row'

const COLUMNS_EMPTY_MESSAGE = 'No columns added.'

type PendingTypeChange = {
  index: number
  valueType: TableColumnValueType
}

export type TableBuilderColumnsProps = {
  kind: TableBuilderKind
}

export function TableBuilderColumns({ kind }: TableBuilderColumnsProps) {
  const form = useFormContext<TableBuilderFormValues>()
  const fieldArray = useFieldArray({ control: form.control, name: 'columns' })
  const [pendingTypeChange, setPendingTypeChange] = useState<PendingTypeChange | null>(null)

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

  const list = (
    <div className={tableBuilderGroupListClasses}>
      {fieldArray.fields.length === 0 ? (
        <div className={tableBuilderGroupEmptyClasses}>{COLUMNS_EMPTY_MESSAGE}</div>
      ) : (
        fieldArray.fields.map((field, index) => {
          const columnKey = columns[index]?.key ?? field.id
          return (
            <TableBuilderColumnRow
              key={field.id}
              index={index}
              columnKey={columnKey}
              sortable={sortable}
              onRequestTypeChange={handleRequestTypeChange}
              onRemove={fieldArray.remove}
            />
          )
        })
      )}
    </div>
  )

  return (
    <section className={tableBuilderSectionClasses} aria-label={TABLE_BUILDER_COLUMNS_LABEL}>
      <FormSectionHeader
        label={TABLE_BUILDER_COLUMNS_LABEL}
        hint={kind === 'general' ? TABLE_BUILDER_GENERAL_COLUMNS_HINT : TABLE_BUILDER_COLUMNS_HINT}
        tier="subsection"
        required
      />
      <div className={tableBuilderGroupClasses}>
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
              {list}
            </SortableContext>
          </DndContext>
        ) : (
          list
        )}
        <div className={tableBuilderAddActionWrapClasses}>
          <button type="button" className={tableBuilderAddActionClasses} onClick={handleAddColumn}>
            <Plus className="size-4" aria-hidden />
            {TABLE_BUILDER_ADD_COLUMN_LABEL}
          </button>
        </div>
      </div>
      {columnsError?.message ? (
        <p className={tableBuilderSectionErrorClasses}>
          {formatFieldMessage(columnsError.message)}
        </p>
      ) : null}

      <ConfirmDialog
        open={pendingTypeChange !== null}
        onOpenChange={(open) => {
          if (!open) setPendingTypeChange(null)
        }}
        headline={TABLE_BUILDER_TYPE_CHANGE_CONFIRM_HEADLINE}
        description={TABLE_BUILDER_TYPE_CHANGE_CONFIRM_DESCRIPTION}
        confirmLabel={TABLE_BUILDER_TYPE_CHANGE_CONFIRM_LABEL}
        confirmVariant="destructive"
        onConfirm={handleConfirmTypeChange}
      />
    </section>
  )
}
