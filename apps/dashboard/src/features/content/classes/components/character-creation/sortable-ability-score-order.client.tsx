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
import { GripVertical } from 'lucide-react'
import {
  ABILITY_ENTRIES,
  type Ability,
  type AbilityScoreOrder,
  type StandardArray,
} from '@rpg/contracts'
import { dragHandleVariants } from '@rpg/ui'

import { ContentEntityCard } from '../../../lib/content-entity-card.client'
import { resolveSortableArrayMove } from '../../../lib/utils/sortable-array-move.lib'

export type SortableAbilityScoreOrderProps = {
  value: AbilityScoreOrder
  standardArray: StandardArray
  onChange: (value: AbilityScoreOrder) => void
  disabled?: boolean
}

type SortableAbilityScoreOrderRowProps = {
  ability: Ability
  projectedScore: number
  disabled: boolean
}

function reorderAbilityScoreOrder(
  order: readonly Ability[],
  from: number,
  to: number,
): AbilityScoreOrder {
  const next = [...order]
  const [moved] = next.splice(from, 1)
  if (moved === undefined) return [...order] as AbilityScoreOrder
  next.splice(to, 0, moved)
  return next as AbilityScoreOrder
}

function SortableAbilityScoreOrderRow({
  ability,
  projectedScore,
  disabled,
}: SortableAbilityScoreOrderRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ability,
    disabled,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} data-dragging={isDragging ? 'true' : undefined}>
      <ContentEntityCard
        density="compact"
        disabled={disabled}
        entity={{ heading: ABILITY_ENTRIES[ability].label }}
        headingEndValue={projectedScore}
        leading={
          disabled ? null : (
            <button
              type="button"
              className={dragHandleVariants({ visibility: 'always', dragging: isDragging })}
              aria-label={`Drag to reorder ${ABILITY_ENTRIES[ability].label}`}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-3.5" aria-hidden />
            </button>
          )
        }
      />
    </div>
  )
}

export function SortableAbilityScoreOrder({
  value,
  standardArray,
  onChange,
  disabled = false,
}: SortableAbilityScoreOrderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const sortableItems = useMemo(() => value.map((ability) => ({ id: ability })), [value])

  function handleDragEnd(event: DragEndEvent) {
    const resolved = resolveSortableArrayMove(sortableItems, event)
    if (!resolved) return
    onChange(reorderAbilityScoreOrder(value, resolved.from, resolved.to))
  }

  const list = value.map((ability, index) => (
    <SortableAbilityScoreOrderRow
      key={ability}
      ability={ability}
      projectedScore={standardArray[index] ?? 0}
      disabled={disabled}
    />
  ))

  if (disabled) {
    return <div className="space-y-2">{list}</div>
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={value} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">{list}</div>
      </SortableContext>
    </DndContext>
  )
}
