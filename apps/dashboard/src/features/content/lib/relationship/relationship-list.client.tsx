'use client'

import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'

import { Button, Eyebrow, Text, cn } from '@rpg/ui'

import { detailSectionGroupHeaderVariants } from '../detail/section/detail-section-group.variants'
import { detailRowListSeparatorVariants } from '../detail/section/detail-row-list.variants'
import type { DetailOverflowAction } from '../detail/row/detail-overflow-menu.client'
import { CrossContentRelationshipRow } from './cross-content-relationship-row.client'
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
  headingSuffix?: ReactNode
  metadata?: ReactNode
  description?: ReactNode
  badge?: ReactNode
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
            className={detailSectionGroupHeaderVariants()}
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
          className={detailSectionGroupHeaderVariants()}
          data-slot="relationship-list-group-header"
        >
          {label ? <Eyebrow size="sm">{label}</Eyebrow> : null}
          {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
        </div>
      ) : null}
      <ul className={cn(detailRowListSeparatorVariants({ kind: 'record' }))}>{children}</ul>
    </div>
  )
}

function RelationshipListRow({
  title,
  href,
  headingSuffix,
  metadata,
  description,
  badge,
  menu,
}: RelationshipListRowProps) {
  const resolvedMetadata = badge ?? metadata
  const actions = menu ? toOverflowActions(menu.items) : []

  return (
    <li>
      <CrossContentRelationshipRow
        heading={title}
        href={href}
        headingSuffix={headingSuffix}
        secondaryText={description}
        metadata={resolvedMetadata}
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
