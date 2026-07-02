'use client'

import * as React from 'react'
import type { CSSProperties } from 'react'
import { Trash2 } from 'lucide-react'

import { cn } from '../../lib/utils'
import { resolveArrayItemLeadingChrome } from '../config/array-item-leading-chrome.lib'
import { useFormSectionContext } from '../context/form-section.context'
import {
  arrayItemActionsRailClasses,
  arrayItemMainClasses,
  arrayItemRemoveButtonClasses,
  arrayItemShellVariants,
  arrayItemDraggingClasses,
  type ArrayItemLeadingChromeOptions,
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

export interface ArrayItemShellProps extends ArrayItemLeadingChromeOptions {
  titleId: string
  dragging?: boolean
  className?: string
  main: React.ReactNode
  actions: React.ReactNode
}

/** Grid shell for one array item — main content column + trailing actions rail. */
export function ArrayItemShell({
  titleId,
  showDragHandle,
  collapsible,
  dragging = false,
  className,
  main,
  actions,
}: ArrayItemShellProps) {
  const { arrayItemTone } = useFormSectionContext()
  const leadingChromeStyle = {
    '--array-item-chrome-count': resolveArrayItemLeadingChrome({
      showDragHandle,
      collapsible,
    }).chromeCount,
  } as CSSProperties

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className={cn(
        arrayItemShellVariants({ tone: arrayItemTone ?? 'default' }),
        dragging && arrayItemDraggingClasses,
        className,
      )}
      style={leadingChromeStyle}
    >
      <div className={arrayItemMainClasses}>{main}</div>
      {actions}
    </div>
  )
}
