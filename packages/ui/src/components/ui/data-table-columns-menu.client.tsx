'use client'

import * as React from 'react'
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
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronDown, Columns3, GripVertical, Lock, RotateCcw, Search } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { Checkbox } from './checkbox.client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.client'
import {
  dataTableColumnDragHandleVariants,
  dataTableColumnItemVariants,
  dataTableColumnPanelVariants,
  dataTableEmptyPanelVariants,
  dataTableLockedColumnVariants,
  dataTableResetColumnVariants,
} from './data-table.variants'

const POINTER_SENSOR_ACTIVATION_DISTANCE_PX = 8

export type DataTableColumnsMenuItem = {
  id: string
  label: string
  visible: boolean
  canHide: boolean
  canReorder?: boolean
  lockedReason?: string
}

export type DataTableColumnsMenuLabels = {
  columns?: string
  resetColumns?: string
  searchColumns?: string
  chooseColumns?: string
}

export type DataTableColumnsMenuProps = {
  items: DataTableColumnsMenuItem[]
  onVisibilityChange: (id: string, visible: boolean) => void
  onReorder?: (activeId: string, overId: string) => void
  onReset?: () => void
  canReset?: boolean
  searchable?: boolean
  triggerVariant?: 'labeled' | 'compact'
  labels?: DataTableColumnsMenuLabels
}

const DEFAULT_LABELS: Required<DataTableColumnsMenuLabels> = {
  columns: 'Columns',
  resetColumns: 'Reset columns',
  searchColumns: 'Search columns',
  chooseColumns: 'Choose visible columns',
}

type SortableColumnRowProps = {
  item: DataTableColumnsMenuItem
  onVisibilityChange: (id: string, visible: boolean) => void
}

function SortableColumnRow({ item, onVisibilityChange }: SortableColumnRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: item.canReorder === false,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} className={dataTableColumnItemVariants()}>
      <button
        type="button"
        className={dataTableColumnDragHandleVariants()}
        aria-label={`Drag to reorder ${item.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>
      <Checkbox
        id={`column-visibility-${item.id}`}
        checked={item.visible}
        onCheckedChange={(checked) => onVisibilityChange(item.id, checked === true)}
      />
      <label htmlFor={`column-visibility-${item.id}`} className="flex-1 cursor-pointer select-none">
        {item.label}
      </label>
    </div>
  )
}

type LockedColumnRowProps = {
  item: DataTableColumnsMenuItem
}

function LockedColumnRow({ item }: LockedColumnRowProps) {
  const reasonId = React.useId()

  return (
    <div className={dataTableLockedColumnVariants()}>
      <span className="flex shrink-0 items-center justify-center rounded p-0.5">
        <Lock className="size-3.5" aria-hidden />
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-flex items-center gap-2">
            <Checkbox disabled checked={item.visible} aria-describedby={reasonId} />
          </span>
        </TooltipTrigger>
        <TooltipContent id={reasonId}>{item.lockedReason ?? item.label}</TooltipContent>
      </Tooltip>
      <span className="flex-1 select-none">{item.label}</span>
    </div>
  )
}

function DataTableColumnsMenuPanel({
  items,
  onVisibilityChange,
  onReorder,
  onReset,
  canReset = true,
  searchable = true,
  labels: labelsProp,
}: Omit<DataTableColumnsMenuProps, 'triggerVariant'>) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [search, setSearch] = React.useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: POINTER_SENSOR_ACTIVATION_DISTANCE_PX },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const query = search.trim().toLowerCase()
  const lockedItems = items.filter((item) => !item.canHide)
  const reorderableItems = items.filter((item) => item.canHide)

  const filteredLocked = query
    ? lockedItems.filter((item) => item.label.toLowerCase().includes(query))
    : lockedItems
  const filteredReorderable = query
    ? reorderableItems.filter((item) => item.label.toLowerCase().includes(query))
    : reorderableItems

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !onReorder) return
    onReorder(String(active.id), String(over.id))
  }

  const sortableIds = filteredReorderable.map((item) => item.id)

  return (
    <TooltipProvider>
      {searchable ? (
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            type="search"
            placeholder={labels.searchColumns}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label={labels.searchColumns}
          />
        </div>
      ) : null}

      <div className="max-h-[320px] overflow-y-auto">
        {filteredLocked.length > 0 ? (
          <div className="py-1">
            {filteredLocked.map((item) => (
              <LockedColumnRow key={item.id} item={item} />
            ))}
          </div>
        ) : null}
        {filteredLocked.length > 0 && filteredReorderable.length > 0 ? (
          <div className="border-t border-border" />
        ) : null}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            <div className="py-1">
              {filteredReorderable.length > 0 ? (
                filteredReorderable.map((item) => (
                  <SortableColumnRow
                    key={item.id}
                    item={item}
                    onVisibilityChange={onVisibilityChange}
                  />
                ))
              ) : filteredLocked.length === 0 ? (
                <p className={dataTableEmptyPanelVariants()}>No columns found.</p>
              ) : null}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {canReset && onReset ? (
        <div className="border-t border-border px-1 py-1.5">
          <button type="button" onClick={onReset} className={dataTableResetColumnVariants()}>
            <RotateCcw className="size-3.5" />
            {labels.resetColumns}
          </button>
        </div>
      ) : null}
    </TooltipProvider>
  )
}

export function DataTableColumnsMenu({
  items,
  onVisibilityChange,
  onReorder,
  onReset,
  canReset = true,
  searchable = true,
  triggerVariant = 'labeled',
  labels: labelsProp,
}: DataTableColumnsMenuProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }

  const trigger =
    triggerVariant === 'labeled' ? (
      <Button variant="outline" size="sm" className="gap-1.5" aria-label={labels.chooseColumns}>
        <Columns3 className="size-3.5" aria-hidden />
        {labels.columns}
        <ChevronDown className="size-3.5 opacity-60" aria-hidden />
      </Button>
    ) : (
      <Button
        variant="ghost"
        size="sm"
        className="size-8 p-0"
        aria-label={labels.chooseColumns}
        title={labels.columns}
      >
        <Columns3 className="size-4" aria-hidden />
      </Button>
    )

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={4}
          className={cn(dataTableColumnPanelVariants())}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DataTableColumnsMenuPanel
            items={items}
            onVisibilityChange={onVisibilityChange}
            onReorder={onReorder}
            onReset={onReset}
            canReset={canReset}
            searchable={searchable}
            labels={labels}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
