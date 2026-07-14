'use client'

import * as React from 'react'
import { Trash2 } from 'lucide-react'

import { cn } from '../../lib/utils'
import { CollapsibleListItemShell } from '../../components/ui/collapsible-list-item/collapsible-list-item-shell.client'
import { useFormSectionContext } from '../context/form-section.context'
import {
  arrayItemActionsRailClasses,
  arrayItemRemoveButtonClasses,
  type ArrayItemLeadingChromeOptions,
} from './array-item-toolbar.variants'
import { ArrayItemIssueBadge } from './array-item-issue.client'
import type { ArrayItemIssueProminence } from './array-item-issue.variants'

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
      <Trash2 aria-hidden />
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
  issueCount?: number
  issueRowLabel?: string
  onIssuePress?: () => void
  badgeProminence?: ArrayItemIssueProminence
  compact?: boolean
  /** When true, rail is inside the compact row grid (no shell corner nudge). */
  embedded?: boolean
  className?: string
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
  issueCount = 0,
  issueRowLabel,
  onIssuePress,
  badgeProminence = 'nav',
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
      <ArrayItemIssueBadge
        issueCount={issueCount}
        rowLabel={issueRowLabel ?? removeAriaLabel.replace(/^Remove\s+/, '')}
        onPress={onIssuePress}
        compact={compact}
        prominence={badgeProminence}
      />
      {customRemove}
      {showDefaultRemove ? (
        <ArrayItemRemoveButton
          ariaLabel={removeAriaLabel}
          canRemove={canRemove}
          onRemove={onRemove}
        />
      ) : null}
    </div>
  )
}

export interface ArrayItemShellProps extends ArrayItemLeadingChromeOptions {
  titleId: string
  itemPrefix?: string
  dragging?: boolean
  layout?: 'default' | 'compactRow'
  className?: string
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
  className,
  main,
  actions,
}: ArrayItemShellProps) {
  const { arrayItemTone } = useFormSectionContext()

  return (
    <CollapsibleListItemShell
      titleId={titleId}
      itemPrefix={itemPrefix}
      showDragHandle={showDragHandle}
      collapsible={collapsible}
      dragging={dragging}
      layout={layout}
      tone={arrayItemTone ?? 'default'}
      className={className}
      main={main}
      actions={actions}
    />
  )
}
