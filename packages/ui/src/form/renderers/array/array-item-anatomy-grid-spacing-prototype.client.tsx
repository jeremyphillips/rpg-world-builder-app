'use client'

import * as React from 'react'

import type { FieldWidth } from '../../../components/ui/field-control.variants'
import {
  FieldAnatomyGridPlacementProvider,
  FieldRowAnatomyProvider,
} from '../../../components/ui/field-row-anatomy.context'
import { cn } from '../../../lib/utils'

import { ArrayItemAnatomyChromeColumn } from './array-item-anatomy-chrome-column.client'
import {
  resolveArrayItemAnatomyFieldGridColumn,
  resolveArrayItemAnatomyGridChromeColumn,
} from './array-item-anatomy-grid.variants'
import {
  buildPrototypeFieldsClusterTemplateColumns,
  isTwoTierSpacingCandidate,
  resolveChromePresenceFlags,
  resolvePrototypeSpacingPresentation,
  resolveSpacingPrototypeGripChromeClasses,
  resolveSpacingPrototypeShellPaddingClasses,
  type ArrayFieldGap,
  type ChromePresence,
  type SpacingPrototypeCandidate,
} from './array-item-anatomy-grid-spacing-prototype.lib'

function resolveFlatFieldKey(child: React.ReactNode, index: number): string {
  if (React.isValidElement(child) && child.key != null) return String(child.key)
  return `field-${index}`
}

/** Flat array item shell — chrome-aware pl/pr (8px when grip/action present, else 12px). */
export function ArrayItemSpacingPrototypeShell({
  children,
  className,
  showGrip = true,
  showActions = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  showGrip?: boolean
  showActions?: boolean
}) {
  return (
    <div
      data-spacing-prototype-shell=""
      data-spacing-prototype-shell-grip={showGrip ? 'true' : 'false'}
      data-spacing-prototype-shell-actions={showActions ? 'true' : 'false'}
      className={cn(
        'rounded-md border border-border bg-card',
        resolveSpacingPrototypeShellPaddingClasses({ showGrip, showActions }),
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface ArrayItemAnatomyGridSpacingPrototypeProps extends React.HTMLAttributes<HTMLDivElement> {
  fieldWidths: readonly FieldWidth[]
  candidate: SpacingPrototypeCandidate
  chromePresence?: ChromePresence
  /** Used when candidate is not two-tier-* (explicit override). */
  fieldGap?: ArrayFieldGap
  /** When true, `auto` width tracks use intrinsic min-content floor (Speed prototype). */
  intrinsicAuto?: boolean
  /** When true, grip column uses -ml-1 (experimental — default off with pl-2 shell). */
  applyGripInset?: boolean
  grip?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
}

function resolveParentChromeColumn(options: {
  role: 'grip' | 'actions' | 'cluster'
  showGrip: boolean
  showActions: boolean
}): number {
  if (options.role === 'grip') return 1
  if (options.role === 'cluster') return options.showGrip ? 2 : 1
  return (options.showGrip ? 2 : 1) + 1
}

/**
 * Phase 0 spacing prototype — flat and two-tier (fieldsCluster + subgrid) compositions.
 * Does not modify production {@link ArrayItemAnatomyGrid}.
 */
export function ArrayItemAnatomyGridSpacingPrototype({
  fieldWidths,
  candidate,
  chromePresence = 'grip-fields-actions',
  fieldGap = 'dense',
  intrinsicAuto = false,
  applyGripInset = false,
  grip,
  actions,
  children,
  className,
  style,
  ...props
}: ArrayItemAnatomyGridSpacingPrototypeProps) {
  const { showGrip, showActions } = resolveChromePresenceFlags(chromePresence)
  const presentation = resolvePrototypeSpacingPresentation(fieldWidths, {
    candidate,
    showGrip,
    showActions,
    intrinsicAuto,
    fieldGap,
  })
  const fieldChildren = React.Children.toArray(children)
  const fieldCount = fieldChildren.length
  const usesFieldsCluster = isTwoTierSpacingCandidate(candidate)

  return (
    <FieldRowAnatomyProvider>
      <div
        data-array-item-anatomy-grid=""
        data-spacing-prototype=""
        data-spacing-candidate={candidate}
        data-chrome-presence={chromePresence}
        className={cn(presentation.className, className)}
        style={{ ...presentation.style, ...style }}
        {...props}
      >
        {showGrip && grip ? (
          <ArrayItemAnatomyChromeColumn
            slot="grip"
            gridColumn={resolveParentChromeColumn({ role: 'grip', showGrip, showActions })}
            className={resolveSpacingPrototypeGripChromeClasses(showGrip, applyGripInset)}
          >
            {grip}
          </ArrayItemAnatomyChromeColumn>
        ) : null}

        {usesFieldsCluster ? (
          <div
            data-array-item-fields-cluster=""
            className={cn('col-span-1 grid min-w-0 grid-rows-subgrid', presentation.fieldGapClass)}
            style={{
              gridRow: '1 / -1',
              gridColumn: resolveParentChromeColumn({ role: 'cluster', showGrip, showActions }),
              gridTemplateColumns: buildPrototypeFieldsClusterTemplateColumns(fieldWidths, {
                intrinsicAuto,
              }),
            }}
          >
            {fieldChildren}
          </div>
        ) : (
          fieldChildren.map((child, index) => (
            <FieldAnatomyGridPlacementProvider
              key={resolveFlatFieldKey(child, index)}
              gridColumn={resolveArrayItemAnatomyFieldGridColumn(index, showGrip)}
            >
              {child}
            </FieldAnatomyGridPlacementProvider>
          ))
        )}

        {showActions && actions ? (
          <ArrayItemAnatomyChromeColumn
            slot="actions"
            gridColumn={
              usesFieldsCluster
                ? resolveParentChromeColumn({ role: 'actions', showGrip, showActions })
                : resolveArrayItemAnatomyGridChromeColumn({
                    role: 'actions',
                    fieldCount,
                    showGrip,
                  })
            }
          >
            {actions}
          </ArrayItemAnatomyChromeColumn>
        ) : null}
      </div>
    </FieldRowAnatomyProvider>
  )
}
