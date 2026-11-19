import {
  Icon,
  InlineInactiveStatus,
  InteractiveListRow,
  ValidationIssueCountBadge,
  cn,
  dragHandleVariants,
  interactiveFocusVariants,
} from '@rpg/ui'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { RefObject } from 'react'

import { joinMasterDetailCaption } from '../../lib/master-detail/master-detail-item-meta'
import { masterDetailRowValidationStateLabel } from '../../lib/master-detail/master-detail-row-validation'
import type { MasterDetailListItem } from './master-detail-list-panel'

export type MasterDetailListRowDragHandleProps = {
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
  isDragging: boolean
  title: string
}

export type MasterDetailListRowProps = {
  item: MasterDetailListItem
  isSelected: boolean
  onSelect: (id: string) => void
  selectedRowRef?: RefObject<HTMLButtonElement | null>
  dragHandleProps?: MasterDetailListRowDragHandleProps
}

function MasterDetailListRowContent({
  item,
  issueCount,
}: {
  item: MasterDetailListItem
  issueCount: number
}) {
  const caption = item.meta ? joinMasterDetailCaption(item.meta, 'list') : ''

  return (
    <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
      {item.meta?.eyebrow ? (
        <span className="min-w-0 truncate text-style-caption">{item.meta.eyebrow}</span>
      ) : null}
      <span className="min-w-0 truncate text-style-label text-foreground">{item.title}</span>
      {caption ? <span className="min-w-0 truncate text-style-caption">{caption}</span> : null}
      {item.availabilityStatusLabel ? (
        <InlineInactiveStatus label={item.availabilityStatusLabel} className="min-w-0" />
      ) : null}
      {issueCount > 0 ? (
        <span className="flex min-w-0 items-center">
          <ValidationIssueCountBadge count={issueCount} />
        </span>
      ) : null}
    </span>
  )
}

export function MasterDetailListRow({
  item,
  isSelected,
  onSelect,
  selectedRowRef,
  dragHandleProps,
}: MasterDetailListRowProps) {
  const issueCount = item.issueCount ?? 0

  const startSlot = dragHandleProps ? (
    <button
      type="button"
      className={dragHandleVariants({
        visibility: 'always',
        dragging: dragHandleProps.isDragging,
      })}
      aria-label={`Drag to reorder ${dragHandleProps.title}`}
      {...dragHandleProps.attributes}
      {...dragHandleProps.listeners}
      onClick={(event) => event.stopPropagation()}
    >
      <Icon name="grip-vertical" size="md" />
    </button>
  ) : undefined

  return (
    <li>
      <InteractiveListRow
        selected={isSelected}
        startSlot={startSlot}
        content={<MasterDetailListRowContent item={item} issueCount={issueCount} />}
        endSlot={
          <span aria-hidden className="text-foreground">
            <Icon name="chevron-right" size="lg" />
          </span>
        }
        asChild
      >
        <button
          ref={isSelected ? selectedRowRef : undefined}
          type="button"
          aria-current={isSelected ? 'true' : undefined}
          aria-invalid={item.hasError ? true : undefined}
          onClick={() => onSelect(item.id)}
          className={cn(interactiveFocusVariants({ context: 'standalone' }))}
        >
          {issueCount > 0 ? (
            <span className="sr-only">, {masterDetailRowValidationStateLabel(issueCount)}</span>
          ) : null}
        </button>
      </InteractiveListRow>
    </li>
  )
}
