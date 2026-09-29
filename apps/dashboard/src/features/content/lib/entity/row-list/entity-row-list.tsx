import type { ReactNode } from 'react'
import { ActionButton, Eyebrow, Text, cn } from '@rpg/ui'

import {
  detailCollectionGroupHeaderVariants,
  detailCollectionRecordSeparatorVariants,
} from '../../detail/collection/detail-collection-chrome.variants'
import type { DetailOverflowAction } from '../../detail/detail-overflow-menu'
import { DetailOverflowMenu } from '../../detail/detail-overflow-menu'
import { DetailEntityRow } from '../../detail/row/entity/detail-entity-row'
import type { EntityAnatomyTrailing } from '../anatomy/entity-anatomy-trailing.types'
import type { EntitySummaryStatusItem } from '../summary/entity-summary-status.types'
import {
  composeEntityRowListHeadingSuffix,
  normalizeEntityRowListStatus,
  resolveEntityRowListOverflowTriggerLabel,
} from './entity-row-list-projection.lib'
import {
  entityRowListEmptyVariants,
  entityRowListFooterVariants,
  entityRowListGroupVariants,
  entityRowListRootVariants,
  entityRowListSupplementaryVariants,
} from './entity-row-list.variants'

export type EntityRowListAction = {
  label: string
  onSelect: () => void
  disabled?: boolean
}

export type EntityRowListMenuItem = {
  id: string
  label: string
  icon?: ReactNode
  destructive?: boolean
  disabled?: boolean
  separatorBefore?: boolean
  onSelect: () => void
}

export type EntityRowListMenu = {
  label?: string
  items: readonly EntityRowListMenuItem[]
}

type EntityRowListRowBaseProps = {
  heading: ReactNode
  headingHref?: string
  /** Inline qualifier after the heading row — membership titles, roles, etc. */
  headingAccessory?: ReactNode
  /** Entity summary classification lane — maps to inline muted suffix before accessory. */
  classification?: ReactNode
  description?: ReactNode
  status?: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[]
  leadingMedia?: ReactNode
}

export type EntityRowListRowMenuProps = {
  menu?: EntityRowListMenu
  overflowTriggerIcon?: 'horizontal' | 'vertical'
  trailing?: never
}

export type EntityRowListRowCustomTrailingProps = {
  menu?: never
  overflowTriggerIcon?: never
  trailing: EntityAnatomyTrailing | null
}

export type EntityRowListRowProps = EntityRowListRowBaseProps &
  (EntityRowListRowMenuProps | EntityRowListRowCustomTrailingProps)

function EntityRowListHeaderAction({ action }: { action: EntityRowListAction }) {
  return (
    <ActionButton
      action="add"
      variant="text"
      size="sm"
      density="compact"
      disabled={action.disabled}
      onClick={action.onSelect}
    >
      {action.label}
    </ActionButton>
  )
}

function toOverflowActions(items: readonly EntityRowListMenuItem[]): DetailOverflowAction[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    destructive: item.destructive,
    disabled: item.disabled,
    separatorBefore: item.separatorBefore,
    onSelect: item.onSelect,
  }))
}

/** Maps shared detail overflow actions onto entity row list menu items (preserves icons). */
export function detailOverflowActionsToRowMenuItems(
  actions: readonly DetailOverflowAction[],
): EntityRowListMenuItem[] {
  return actions.map((action) => ({
    id: action.id,
    label: action.label,
    icon: action.icon,
    destructive: action.destructive,
    disabled: action.disabled,
    separatorBefore: action.separatorBefore,
    onSelect: action.onSelect,
  }))
}

export type EntityRowListEmptyProps = {
  emptyLabel?: ReactNode
  action?: EntityRowListAction
}

function EntityRowListEmpty({ emptyLabel, action }: EntityRowListEmptyProps) {
  return (
    <div className={entityRowListEmptyVariants()} data-slot="entity-row-list-empty">
      {emptyLabel ? (
        <Text variant="muted" className="text-sm">
          {emptyLabel}
        </Text>
      ) : null}
      {action ? <EntityRowListHeaderAction action={action} /> : null}
    </div>
  )
}

export type EntityRowListFooterProps = {
  action: EntityRowListAction
}

function EntityRowListFooter({ action }: EntityRowListFooterProps) {
  return (
    <div className={entityRowListFooterVariants()} data-slot="entity-row-list-footer">
      <EntityRowListHeaderAction action={action} />
    </div>
  )
}

export type EntityRowListSupplementaryProps = {
  children: ReactNode
}

function EntityRowListSupplementary({ children }: EntityRowListSupplementaryProps) {
  return (
    <div className={entityRowListSupplementaryVariants()} data-slot="entity-row-list-supplementary">
      {children}
    </div>
  )
}

export type EntityRowListRootProps = {
  itemCount: number
  emptyLabel?: ReactNode
  action?: EntityRowListAction
  children?: ReactNode
}

function EntityRowListRoot({ itemCount, emptyLabel, action, children }: EntityRowListRootProps) {
  const hasFooter = itemCount > 0 && Boolean(action)

  if (itemCount === 0) {
    return <EntityRowListEmpty emptyLabel={emptyLabel} action={action} />
  }

  return (
    <div className={entityRowListRootVariants()} data-slot="entity-row-list-root">
      {children}
      {hasFooter && action ? <EntityRowListFooter action={action} /> : null}
    </div>
  )
}

export type EntityRowListGroupProps = {
  label?: string
  itemCount: number
  emptyLabel?: ReactNode
  headerAction?: EntityRowListAction
  children?: ReactNode
}

function EntityRowListGroup({
  label,
  itemCount,
  emptyLabel,
  headerAction,
  children,
}: EntityRowListGroupProps) {
  const endSlot = headerAction ? <EntityRowListHeaderAction action={headerAction} /> : undefined
  const showHeader = Boolean(label || endSlot)

  if (itemCount === 0) {
    return (
      <div data-slot="entity-row-list-group" className={entityRowListGroupVariants()}>
        {showHeader ? (
          <div
            className={detailCollectionGroupHeaderVariants()}
            data-slot="entity-row-list-group-header"
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
    <div data-slot="entity-row-list-group" className={entityRowListGroupVariants()}>
      {showHeader ? (
        <div
          className={detailCollectionGroupHeaderVariants()}
          data-slot="entity-row-list-group-header"
        >
          {label ? <Eyebrow size="sm">{label}</Eyebrow> : null}
          {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
        </div>
      ) : null}
      <ul className={cn(detailCollectionRecordSeparatorVariants())}>{children}</ul>
    </div>
  )
}

function EntityRowListRow(props: EntityRowListRowProps) {
  const {
    heading,
    headingHref,
    headingAccessory,
    classification,
    description,
    status,
    leadingMedia,
    menu,
    overflowTriggerIcon = 'horizontal',
    trailing,
  } = props

  const resolvedStatus = normalizeEntityRowListStatus(status)
  const headingSuffix = composeEntityRowListHeadingSuffix(classification, headingAccessory)

  const actions = menu ? toOverflowActions(menu.items) : []
  const resolvedTrailing: EntityAnatomyTrailing | undefined =
    trailing !== undefined
      ? (trailing ?? undefined)
      : actions.length > 0
        ? {
            kind: 'action' as const,
            content: (
              <DetailOverflowMenu
                actions={actions}
                triggerLabel={resolveEntityRowListOverflowTriggerLabel(heading, menu?.label)}
                triggerIcon={overflowTriggerIcon}
              />
            ),
          }
        : undefined

  const trailingAlign = overflowTriggerIcon === 'vertical' ? 'center' : 'start'

  return (
    <li>
      <DetailEntityRow
        inset="parent"
        heading={heading}
        headingHref={headingHref}
        headingSuffix={headingSuffix}
        subheading={description}
        metadata={resolvedStatus}
        leadingMedia={leadingMedia}
        trailing={resolvedTrailing}
        trailingAlign={trailingAlign}
      />
    </li>
  )
}

export const EntityRowList = {
  Root: EntityRowListRoot,
  Group: EntityRowListGroup,
  Row: EntityRowListRow,
  Empty: EntityRowListEmpty,
  Footer: EntityRowListFooter,
  Supplementary: EntityRowListSupplementary,
}
