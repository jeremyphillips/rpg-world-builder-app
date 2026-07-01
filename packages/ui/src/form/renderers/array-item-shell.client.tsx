'use client'

import * as React from 'react'
import { Trash2 } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  arrayItemActionsRailClasses,
  arrayItemMainClasses,
  arrayItemRemoveButtonClasses,
  arrayItemShellClasses,
  arrayItemDraggingClasses,
} from './array-item-toolbar.variants'

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
  compact?: boolean
  className?: string
}

/**
 * Top-right action cluster for one array item row.
 *
 * TODO(array-item-issues): Render `<ArrayItemIssueSummary issueCount={…} onPress={…} />` before
 * remove when `issueCount > 0`. Wire from RHF nested errors in `ArrayFieldItemContent`.
 */
export function ArrayItemActionsRail({
  removeAriaLabel,
  canRemove,
  onRemove,
  compact = false,
  className,
}: ArrayItemActionsRailProps) {
  return (
    <div
      role="group"
      aria-label="Item actions"
      className={cn(arrayItemActionsRailClasses({ compact }), className)}
    >
      <ArrayItemRemoveButton
        ariaLabel={removeAriaLabel}
        canRemove={canRemove}
        onRemove={onRemove}
      />
    </div>
  )
}

export interface ArrayItemShellProps {
  titleId: string
  dragging?: boolean
  className?: string
  main: React.ReactNode
  actions: React.ReactNode
}

/** Grid shell for one array item — main content column + trailing actions rail. */
export function ArrayItemShell({
  titleId,
  dragging = false,
  className,
  main,
  actions,
}: ArrayItemShellProps) {
  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className={cn(arrayItemShellClasses, dragging && arrayItemDraggingClasses, className)}
    >
      <div className={arrayItemMainClasses}>{main}</div>
      {actions}
    </div>
  )
}
