'use client'

import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'

import { Button, Eyebrow, Text, cn } from '@rpg/ui'

import {
  detailCollectionGroupHeaderVariants,
  detailCollectionRecordSeparatorVariants,
} from '../../detail/collection/detail-collection-chrome.variants'
import type { DetailOverflowAction } from '../../detail/detail-overflow-menu.client'
import { CrossContentRelationshipRow } from './row/cross-content-relationship-row.client'
import type { EntitySummaryStatusItem } from '../../entity/summary/entity-summary-status.types'
import {
  relationshipListEmptyVariants,
  relationshipListFooterVariants,
  relationshipListGroupVariants,
  relationshipListRootVariants,
  relationshipListSupplementaryVariants,
} from './relationship-list.variants'

export type RelationshipListAction = {
  label: string
  onSelect: () => void
  disabled?: boolean
}

export type RelationshipRowMenuItem = {
  id: string
  label: string
  destructive?: boolean
  disabled?: boolean
  onSelect: () => void
}

export type RelationshipListRowProps = {
  title: ReactNode
  href?: string
  /** Inline classification after the title — maps to entity summary `classification`. */
  headingSuffix?: ReactNode
  /** @deprecated Use `classification` — alias for headingSuffix. */
  classification?: ReactNode
  /** Feature-supplied disambiguation below the title — maps to entity summary `description`. */
  description?: ReactNode
  /** Entity summary status lane — badges, annotations, inactive markers. */
  status?: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[]
  /** @deprecated Use `status` */
  badge?: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[]
  /** @deprecated Use `status` */
  metadata?: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[]
  menu?: {
    label: string
    items: readonly RelationshipRowMenuItem[]
  }
}

function RelationshipListHeaderAction({ action }: { action: RelationshipListAction }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      density="compact"
      disabled={action.disabled}
      onClick={action.onSelect}
    >
      <Plus aria-hidden />
      {action.label}
    </Button>
  )
}

function toOverflowActions(items: readonly RelationshipRowMenuItem[]): DetailOverflowAction[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    destructive: item.destructive,
    disabled: item.disabled,
    onSelect: item.onSelect,
  }))
}

export type RelationshipListEmptyProps = {
  emptyLabel?: ReactNode
  action?: RelationshipListAction
}

function RelationshipListEmpty({ emptyLabel, action }: RelationshipListEmptyProps) {
  return (
    <div className={relationshipListEmptyVariants()} data-slot="relationship-list-empty">
      {emptyLabel ? (
        <Text variant="muted" className="text-sm">
          {emptyLabel}
        </Text>
      ) : null}
      {action ? <RelationshipListHeaderAction action={action} /> : null}
    </div>
  )
}

export type RelationshipListFooterProps = {
  action: RelationshipListAction
}

function RelationshipListFooter({ action }: RelationshipListFooterProps) {
  return (
    <div className={relationshipListFooterVariants()} data-slot="relationship-list-footer">
      <RelationshipListHeaderAction action={action} />
    </div>
  )
}

export type RelationshipListSupplementaryProps = {
  children: ReactNode
}

function RelationshipListSupplementary({ children }: RelationshipListSupplementaryProps) {
  return (
    <div
      className={relationshipListSupplementaryVariants()}
      data-slot="relationship-list-supplementary"
    >
      {children}
    </div>
  )
}

export type RelationshipListRootProps = {
  itemCount: number
  emptyLabel?: ReactNode
  action?: RelationshipListAction
  children?: ReactNode
}

function RelationshipListRoot({
  itemCount,
  emptyLabel,
  action,
  children,
}: RelationshipListRootProps) {
  const hasFooter = itemCount > 0 && Boolean(action)

  if (itemCount === 0) {
    return <RelationshipListEmpty emptyLabel={emptyLabel} action={action} />
  }

  return (
    <div className={relationshipListRootVariants()} data-slot="relationship-list-root">
      {children}
      {hasFooter && action ? <RelationshipListFooter action={action} /> : null}
    </div>
  )
}

export type RelationshipListGroupProps = {
  label?: string
  itemCount: number
  emptyLabel?: ReactNode
  headerAction?: RelationshipListAction
  children?: ReactNode
}

function RelationshipListGroup({
  label,
  itemCount,
  emptyLabel,
  headerAction,
  children,
}: RelationshipListGroupProps) {
  const endSlot = headerAction ? <RelationshipListHeaderAction action={headerAction} /> : undefined
  const showHeader = Boolean(label || endSlot)

  if (itemCount === 0) {
    return (
      <div data-slot="relationship-list-group" className={relationshipListGroupVariants()}>
        {showHeader ? (
          <div
            className={detailCollectionGroupHeaderVariants()}
            data-slot="relationship-list-group-header"
          >
            {label ? <Eyebrow size="sm">{label}</Eyebrow> : null}
            {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
          </div>
        ) : null}
        {emptyLabel ? (
          <Text variant="muted" className="text-sm">
            {emptyLabel}
          </Text>
        ) : null}
      </div>
    )
  }

  return (
    <div data-slot="relationship-list-group" className={relationshipListGroupVariants()}>
      {showHeader ? (
        <div
          className={detailCollectionGroupHeaderVariants()}
          data-slot="relationship-list-group-header"
        >
          {label ? <Eyebrow size="sm">{label}</Eyebrow> : null}
          {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
        </div>
      ) : null}
      <ul className={cn(detailCollectionRecordSeparatorVariants())}>{children}</ul>
    </div>
  )
}

function RelationshipListRow({
  title,
  href,
  headingSuffix,
  classification,
  description,
  status,
  badge,
  metadata,
  menu,
}: RelationshipListRowProps) {
  const resolvedClassification = classification ?? headingSuffix
  const resolvedStatus = status ?? badge ?? metadata
  const actions = menu ? toOverflowActions(menu.items) : []

  return (
    <li>
      <CrossContentRelationshipRow
        heading={title}
        href={href}
        headingSuffix={resolvedClassification}
        description={description}
        status={resolvedStatus}
        actions={actions}
        overflowTriggerLabel={menu?.label ?? 'Relationship actions'}
      />
    </li>
  )
}

export const RelationshipList = {
  Root: RelationshipListRoot,
  Group: RelationshipListGroup,
  Row: RelationshipListRow,
  Empty: RelationshipListEmpty,
  Footer: RelationshipListFooter,
  Supplementary: RelationshipListSupplementary,
}
