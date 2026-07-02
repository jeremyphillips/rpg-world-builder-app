'use client'

import type { CSSProperties } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'

import {
  ArrayFieldItemContent,
  type ArrayFieldItemContentProps,
} from './array-field-item-content.client'
import { resolveSortableArrayMove } from './sortable-array-list.lib'

interface ArrayFieldItemProps extends Omit<
  ArrayFieldItemContentProps,
  'dragHandleProps' | 'collapsed' | 'onToggleCollapse'
> {
  collapsedIds: ReadonlySet<string>
  onToggleCollapse: (itemId: string) => void
}

function SortableArrayFieldItem({
  collapsedIds,
  onToggleCollapse,
  itemId,
  ...props
}: ArrayFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: itemId,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ArrayFieldItemContent
        {...props}
        itemId={itemId}
        collapsed={collapsedIds.has(itemId)}
        onToggleCollapse={() => onToggleCollapse(itemId)}
        dragHandleProps={{ attributes, listeners, isDragging }}
      />
    </div>
  )
}

function ArrayFieldItem({ collapsedIds, onToggleCollapse, itemId, ...props }: ArrayFieldItemProps) {
  return (
    <ArrayFieldItemContent
      {...props}
      itemId={itemId}
      collapsed={collapsedIds.has(itemId)}
      onToggleCollapse={() => onToggleCollapse(itemId)}
    />
  )
}

export interface ArrayFieldItemListProps {
  fields: ReadonlyArray<{ id: string }>
  sortableEnabled: boolean
  itemProps: (rhfField: { id: string }, index: number) => ArrayFieldItemProps
  onMove: (from: number, to: number) => void
}

export function ArrayFieldItemList({
  fields,
  sortableEnabled,
  itemProps,
  onMove,
}: ArrayFieldItemListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const resolved = resolveSortableArrayMove(fields, event)
    if (resolved) onMove(resolved.from, resolved.to)
  }

  const list = (
    <>
      {fields.map((rhfField, index) =>
        sortableEnabled ? (
          <SortableArrayFieldItem key={rhfField.id} {...itemProps(rhfField, index)} />
        ) : (
          <ArrayFieldItem key={rhfField.id} {...itemProps(rhfField, index)} />
        ),
      )}
    </>
  )

  if (!sortableEnabled) return list

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((field) => field.id)}
        strategy={verticalListSortingStrategy}
      >
        {list}
      </SortableContext>
    </DndContext>
  )
}
