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
      data-array-item-prefix={itemPrefix}
      className={cn(
        arrayItemShellVariants({ tone: arrayItemTone ?? 'default', layout }),
        dragging && arrayItemDraggingClasses,
        className,
      )}
      style={leadingChromeStyle}
    >
      {layout === 'compactRow' ? (
        main
      ) : (
        <>
          <div className={arrayItemMainClasses}>{main}</div>
          {actions}
        </>
      )}
    </div>
  )
}
