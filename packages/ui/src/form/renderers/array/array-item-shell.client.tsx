'use client'

import * as React from 'react'
import { cn } from '../../../lib/utils'
import { ActionIcon } from '../../../components/ui/action-icon.client'
import { CollapsibleListItemShell } from '../../../components/ui/collapsible-list-item/collapsible-list-item-shell.client'
import { resolveCollapsibleListItemHeaderActionsPlacement } from '../../../components/ui/collapsible-list-item/collapsible-list-item-root.lib'
import { resolveArrayItemShellSurface } from '../../config/array/resolve-array-item-shell-surface.lib'
import { useFormSectionContext } from '../../context/form-section.context'
import type { SemanticSurfaceTone } from '../../../components/ui/field-surface.variants'
import {
  arrayItemActionsRailClasses,
  arrayItemRemoveButtonClasses,
  type ArrayItemLeadingChromeOptions,
} from './array-item-toolbar.variants'
import { ArrayItemIssueButton } from './array-item-issue.client'

export interface ArrayItemRemoveButtonProps {
  ariaLabel: string
  canRemove: boolean
  onRemove: () => void
}

export function ArrayItemRemoveButton({
  ariaLabel,
  canRemove,
  onRemove,
}: ArrayItemRemoveButtonProps) {
  return (
    <button
      type="button"
      className={arrayItemRemoveButtonClasses}
      disabled={!canRemove}
      aria-label={ariaLabel}
      onClick={onRemove}
    >
      <ActionIcon action="remove" size="md" />
    </button>
  )
}

export interface ArrayItemActionsRailProps {
  removeAriaLabel: string
  canRemove: boolean
  onRemove: () => void
  /** When false, omits the default remove button (e.g. `hideItemRemove` or `itemRemoveSlot`). */
  showDefaultRemove?: boolean
  /** Custom remove control rendered before the default button when both are shown. */
  customRemove?: React.ReactNode
  /** Utility rendered immediately before the default remove button. Remove stays last. */
  beforeRemove?: React.ReactNode
  issueCount?: number
  issueRowLabel?: string
  onIssuePress?: () => void
  compact?: boolean
  /** When true, rail is inside the compact row grid (no shell corner nudge). */
  embedded?: boolean
  className?: string
}

/** Action controls without the outer rail shell — for CollapsibleListItem `actions` slot. */
export function ArrayItemActionsContent({
  removeAriaLabel,
  canRemove,
  onRemove,
  showDefaultRemove = true,
  customRemove,
  beforeRemove,
  issueCount = 0,
  issueRowLabel,
  onIssuePress,
  compact = false,
}: Omit<ArrayItemActionsRailProps, 'embedded' | 'className'>) {
  return (
    <>
      <ArrayItemIssueButton
        issueCount={issueCount}
        rowLabel={issueRowLabel ?? removeAriaLabel.replace(/^Remove\s+/, '')}
        onPress={onIssuePress}
        compact={compact}
      />
      {customRemove}
      {beforeRemove}
      {showDefaultRemove ? (
        <ArrayItemRemoveButton
          ariaLabel={removeAriaLabel}
          canRemove={canRemove}
          onRemove={onRemove}
        />
      ) : null}
    </>
  )
}

/**
 * Top-right action cluster for one array item row.
 */
export function ArrayItemActionsRail({
  removeAriaLabel,
  canRemove,
  onRemove,
  showDefaultRemove = true,
  customRemove,
  beforeRemove,
  issueCount = 0,
  issueRowLabel,
  onIssuePress,
  compact = false,
  embedded = false,
  className,
}: ArrayItemActionsRailProps) {
  return (
    <div
      role="group"
      aria-label="Item actions"
      className={cn(arrayItemActionsRailClasses({ compact, embedded }), className)}
    >
      <ArrayItemActionsContent
        removeAriaLabel={removeAriaLabel}
        canRemove={canRemove}
        onRemove={onRemove}
        showDefaultRemove={showDefaultRemove}
        customRemove={customRemove}
        beforeRemove={beforeRemove}
        issueCount={issueCount}
        issueRowLabel={issueRowLabel}
        onIssuePress={onIssuePress}
        compact={compact}
      />
    </div>
  )
}

export interface ArrayItemShellProps extends ArrayItemLeadingChromeOptions {
  titleId: string
  itemPrefix?: string
  dragging?: boolean
  layout?: 'default' | 'compactRow'
  hasItemHeader?: boolean
  className?: string
  /** Overrides section tone when the row has row-level validation issues. */
  shellTone?: SemanticSurfaceTone
  main: React.ReactNode
  actions?: React.ReactNode
}

/** Grid shell for one array item — main content column + trailing actions rail. */
export function ArrayItemShell({
  titleId,
  itemPrefix,
  showDragHandle,
  collapsible,
  dragging = false,
  layout = 'default',
  hasItemHeader,
  className,
  shellTone,
  main,
  actions,
}: ArrayItemShellProps) {
  const { arrayItemSurface, arrayItemTone } = useFormSectionContext()
  const tone = shellTone ?? arrayItemTone

  return (
    <CollapsibleListItemShell
      titleId={titleId}
      itemPrefix={itemPrefix}
      showDragHandle={showDragHandle}
      collapsible={collapsible}
      dragging={dragging}
      layout={layout}
      headerActionsPlacement={resolveCollapsibleListItemHeaderActionsPlacement(layout)}
      surface={resolveArrayItemShellSurface({
        explicit: arrayItemSurface,
        collapsible: collapsible ?? false,
        hasItemHeader,
      })}
      tone={tone}
      className={className}
      main={main}
      actions={actions}
    />
  )
}
