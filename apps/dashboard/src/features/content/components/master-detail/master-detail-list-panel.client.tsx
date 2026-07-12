'use client'

import type { CSSProperties } from 'react'
import { useMemo } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { cn, Button, Text } from '@rpg/ui'
import { AlertCircle, GripVertical, Trash2 } from 'lucide-react'

import {
  masterDetailListDragHandleClasses,
  masterDetailListDragHandleVisibleClasses,
  masterDetailListRowClasses,
  masterDetailListRowDraggingClasses,
  masterDetailListRowInactiveClasses,
  masterDetailListRowInactiveTitleClasses,
  masterDetailListRowSelectClasses,
  masterDetailListRowSelectDefaultPaddingClasses,
  masterDetailListRowSelectWithDragClasses,
  masterDetailListRowSortableClasses,
  masterDetailListRowSelectedClasses,
} from './master-detail-list-panel.variants'
import { resolveMasterDetailListMove } from '../../lib/master-detail/master-detail-list-move'
import { MasterDetailRowBadges } from './master-detail-row-badges.client'

import type { BadgeAppearance, BadgeTone } from '@rpg/ui'

export interface MasterDetailListBadge {
  label: string
  appearance: BadgeAppearance
  tone: BadgeTone
}

export interface MasterDetailListItem {
  /** Stable React key (use the RHF field id, not a domain id). */
  id: string
  /** Display label for the row. */
  title: string
  /** Optional small label rendered above the title (e.g. "Level 3"). */
  eyebrow?: string
  /** Optional status badges (e.g. System, Homebrew, Inactive). */
  badges?: MasterDetailListBadge[]
  /** When true, surfaces a validation error indicator on the row. */
  hasError?: boolean
  /** When false, row uses inactive styling. Defaults to `true`. */
  active?: boolean
  /**
   * Whether the row shows a remove control. Defaults to `true`; pass `false`
   * for protected rows (e.g. system content).
   */
  deletable?: boolean
}

export interface MasterDetailListPanelProps {
  items: MasterDetailListItem[]
  selectedIndex: number | null
  /** Accessible name for the list `<nav>`. */
  ariaLabel: string
  addLabel: string
  emptyLabel: string
  onAdd: () => void
  onSelect: (index: number) => void
  /** Invoked when a deletable row's remove control is activated. */
  onRemove: (index: number) => void
  /** When provided, rows can be reordered via drag handle (and keyboard). */
  onMove?: (from: number, to: number) => void
}

interface MasterDetailListRowContentProps {
  item: MasterDetailListItem
  index: number
  isSelected: boolean
  isDragging?: boolean
  showDragHandle: boolean
  dragHandleProps?: {
    attributes: ReturnType<typeof useSortable>['attributes']
    listeners: ReturnType<typeof useSortable>['listeners']
  }
  onSelect: (index: number) => void
  onRemove: (index: number) => void
}

function MasterDetailListRowStatus({
  hasError,
  badges,
}: Pick<MasterDetailListItem, 'hasError' | 'badges'>) {
  if (!hasError && !badges?.length) return null

  return (
    <span className="mt-1 flex flex-wrap items-center gap-1">
      {hasError ? (
        <>
          <AlertCircle className="size-3.5 shrink-0 text-destructive" aria-hidden />
          <span className="sr-only">Has validation errors</span>
        </>
      ) : null}
      {badges?.length ? <MasterDetailRowBadges badges={badges} /> : null}
    </span>
  )
}

function masterDetailListRowClassName(
  active: boolean,
  isSelected: boolean,
  showDragHandle: boolean,
) {
  return cn(
    masterDetailListRowClasses,
    showDragHandle && masterDetailListRowSortableClasses,
    !active && masterDetailListRowInactiveClasses,
    isSelected && masterDetailListRowSelectedClasses,
  )
}

type MasterDetailListDragHandleProps = {
  title: string
  isDragging?: boolean
  dragHandleProps: NonNullable<MasterDetailListRowContentProps['dragHandleProps']>
}

function MasterDetailListDragHandle({
  title,
  isDragging = false,
  dragHandleProps,
}: MasterDetailListDragHandleProps) {
  return (
    <button
      type="button"
      className={cn(
        masterDetailListDragHandleClasses,
        isDragging && masterDetailListDragHandleVisibleClasses,
      )}
      aria-label={`Drag to reorder ${title}`}
      onClick={(event) => event.stopPropagation()}
      {...dragHandleProps.attributes}
      {...dragHandleProps.listeners}
    >
      <GripVertical className="size-3.5" aria-hidden />
    </button>
  )
}

type MasterDetailListRowSelectButtonProps = {
  item: MasterDetailListItem
  index: number
  isSelected: boolean
  active: boolean
  showDragHandle: boolean
  onSelect: (index: number) => void
}

function MasterDetailListRowSelectButton({
  item,
  index,
  isSelected,
  active,
  showDragHandle,
  onSelect,
}: MasterDetailListRowSelectButtonProps) {
  return (
    <button
      type="button"
      aria-current={isSelected ? 'true' : undefined}
      aria-invalid={item.hasError ? true : undefined}
      onClick={() => onSelect(index)}
      className={cn(
        masterDetailListRowSelectClasses,
        showDragHandle
          ? masterDetailListRowSelectWithDragClasses
          : masterDetailListRowSelectDefaultPaddingClasses,
      )}
    >
      {item.eyebrow ? (
        <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {item.eyebrow}
        </span>
      ) : null}
      <span
        className={cn(
          'block truncate font-medium',
          !active && masterDetailListRowInactiveTitleClasses,
        )}
      >
        {item.title}
      </span>
      <MasterDetailListRowStatus hasError={item.hasError} badges={item.badges} />
    </button>
  )
}

type MasterDetailListRowRemoveButtonProps = {
  title: string
  index: number
  onRemove: (index: number) => void
}

function MasterDetailListRowRemoveButton({
  title,
  index,
  onRemove,
}: MasterDetailListRowRemoveButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="mr-1 size-8 shrink-0 p-0"
      aria-label={`Remove ${title}`}
      onClick={() => onRemove(index)}
    >
      <Trash2 className="size-4" aria-hidden />
    </Button>
  )
}

function MasterDetailListRowContent({
  item,
  index,
  isSelected,
  isDragging = false,
  showDragHandle,
  dragHandleProps,
  onSelect,
  onRemove,
}: MasterDetailListRowContentProps) {
  const deletable = item.deletable !== false
  const active = item.active !== false

  return (
    <div className={masterDetailListRowClassName(active, isSelected, showDragHandle)}>
      {showDragHandle && dragHandleProps ? (
        <MasterDetailListDragHandle
          title={item.title}
          isDragging={isDragging}
          dragHandleProps={dragHandleProps}
        />
      ) : null}
      <MasterDetailListRowSelectButton
        item={item}
        index={index}
        isSelected={isSelected}
        active={active}
        showDragHandle={showDragHandle}
        onSelect={onSelect}
      />
      {deletable ? (
        <MasterDetailListRowRemoveButton title={item.title} index={index} onRemove={onRemove} />
      ) : null}
    </div>
  )
}

interface MasterDetailListRowProps {
  item: MasterDetailListItem
  index: number
  isSelected: boolean
  showDragHandle: boolean
  onSelect: (index: number) => void
  onRemove: (index: number) => void
}

function MasterDetailListRow({
  item,
  index,
  isSelected,
  showDragHandle,
  onSelect,
  onRemove,
}: MasterDetailListRowProps) {
  return (
    <li>
      <MasterDetailListRowContent
        item={item}
        index={index}
        isSelected={isSelected}
        showDragHandle={showDragHandle}
        onSelect={onSelect}
        onRemove={onRemove}
      />
    </li>
  )
}

type SortableMasterDetailListRowProps = MasterDetailListRowProps

function SortableMasterDetailListRow(props: SortableMasterDetailListRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.item.id,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && masterDetailListRowDraggingClasses)}
    >
      <MasterDetailListRowContent
        item={props.item}
        index={props.index}
        isSelected={props.isSelected}
        isDragging={isDragging}
        showDragHandle={props.showDragHandle}
        dragHandleProps={{ attributes, listeners }}
        onSelect={props.onSelect}
        onRemove={props.onRemove}
      />
    </li>
  )
}

interface MasterDetailListItemsProps {
  items: MasterDetailListItem[]
  selectedIndex: number | null
  onMove?: (from: number, to: number) => void
  onSelect: (index: number) => void
  onRemove: (index: number) => void
}

function MasterDetailListItems({
  items,
  selectedIndex,
  onMove,
  onSelect,
  onRemove,
}: MasterDetailListItemsProps) {
  const sortableEnabled = Boolean(onMove) && items.length > 1
  const showDragHandle = sortableEnabled
  const itemIds = useMemo(() => items.map((item) => item.id), [items])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    if (!onMove) return
    const move = resolveMasterDetailListMove(items, event)
    if (move) onMove(move.from, move.to)
  }

  const rowProps = (item: MasterDetailListItem, index: number) => ({
    item,
    index,
    isSelected: index === selectedIndex,
    showDragHandle,
    onSelect,
    onRemove,
  })

  const list = (
    <ul className="space-y-1" role="list">
      {items.map((item, index) =>
        sortableEnabled ? (
          <SortableMasterDetailListRow key={item.id} {...rowProps(item, index)} />
        ) : (
          <MasterDetailListRow key={item.id} {...rowProps(item, index)} />
        ),
      )}
    </ul>
  )

  if (!sortableEnabled) return list

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {list}
      </SortableContext>
    </DndContext>
  )
}

/**
 * Generic sidebar for a master-detail editor: an add button plus a selectable,
 * optionally-removable list with optional eyebrow and status badges per row.
 * Presentation only — selection and array mutation are owned by the parent (see
 * `useMasterDetailArray`).
 */
export function MasterDetailListPanel({
  items,
  selectedIndex,
  ariaLabel,
  addLabel,
  emptyLabel,
  onAdd,
  onSelect,
  onRemove,
  onMove,
}: MasterDetailListPanelProps) {
  return (
    <nav aria-label={ariaLabel} className="flex flex-col gap-3">
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        {addLabel}
      </Button>

      {items.length === 0 ? (
        <Text variant="muted" className="text-sm">
          {emptyLabel}
        </Text>
      ) : (
        <MasterDetailListItems
          items={items}
          selectedIndex={selectedIndex}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      )}
    </nav>
  )
}
