'use client'

import type { CSSProperties, RefObject } from 'react'
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

import { resolveSortableArrayMove } from '../../lib/utils/sortable-array-move.lib'
import type { MasterDetailListItem } from './master-detail-list-panel'
import { MasterDetailListRow } from './master-detail-list-row'

type MasterDetailSortableListRowProps = {
  item: MasterDetailListItem
  isSelected: boolean
  onSelect: (id: string) => void
  selectedRowRef?: RefObject<HTMLButtonElement | null>
}

function MasterDetailSortableListRow({
  item,
  isSelected,
  onSelect,
  selectedRowRef,
}: MasterDetailSortableListRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <MasterDetailListRow
        item={item}
        isSelected={isSelected}
        onSelect={onSelect}
        selectedRowRef={selectedRowRef}
        dragHandleProps={{ attributes, listeners, isDragging, title: item.title }}
      />
    </div>
  )
}

export type MasterDetailSortableListRowsProps = {
  items: readonly MasterDetailListItem[]
  selectedItemId: string | null
  onSelectItem: (id: string) => void
  onMove: (from: number, to: number) => void
  selectedRowRef: RefObject<HTMLButtonElement | null>
  listClassName: string
}

export function MasterDetailSortableListRows({
  items,
  selectedItemId,
  onSelectItem,
  onMove,
  selectedRowRef,
  listClassName,
}: MasterDetailSortableListRowsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const sortableEnabled = items.length > 1

  function handleDragEnd(event: DragEndEvent) {
    const resolved = resolveSortableArrayMove(items, event)
    if (!resolved) return
    onMove(resolved.from, resolved.to)
  }

  const rows = items.map((item) => (
    <MasterDetailSortableListRow
      key={item.id}
      item={item}
      isSelected={item.id === selectedItemId}
      onSelect={onSelectItem}
      selectedRowRef={item.id === selectedItemId ? selectedRowRef : undefined}
    />
  ))

  if (!sortableEnabled) {
    return (
      <ul className={listClassName} role="list">
        {rows}
      </ul>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ul className={listClassName} role="list">
          {rows}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
