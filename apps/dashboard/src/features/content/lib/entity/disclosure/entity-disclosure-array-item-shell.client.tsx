'use client'

import type { ArrayItemShellRenderProps } from '@rpg/ui/form'

import type { ReactElement } from 'react'

import { DisclosureEntityCard } from './disclosure-entity-card.client'
import { projectArrayItemEntitySummary } from '../array-item-entity-summary.lib'

export type EntityDisclosureArrayItemShellProps = ArrayItemShellRenderProps & {
  /** Optional kind/type label when distinct from the primary heading. */
  classification?: string
  density?: 'compact' | 'comfortable'
}

/**
 * Form-array presentation bridge: keeps RHF ownership (prefix, action rail,
 * field children) while DisclosureEntityCard owns card chrome and content-column
 * alignment. Do not wrap this in ArrayItemShell / local card chrome.
 */
export function EntityDisclosureArrayItemShell({
  itemId,
  itemPrefix,
  header,
  summary,
  classification,
  collapsed,
  onToggleCollapse,
  dragHandleProps,
  action,
  children,
  density = 'compact',
}: EntityDisclosureArrayItemShellProps) {
  const entity = projectArrayItemEntitySummary({
    header,
    summary,
    classification,
  })

  return (
    <div data-array-item-prefix={itemPrefix}>
      <DisclosureEntityCard
        itemId={itemId}
        toolbarAriaLabel={header.ariaLabel}
        entity={entity}
        trailing={action ? { kind: 'action', content: action as ReactElement } : undefined}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        dragHandleProps={
          dragHandleProps
            ? {
                attributes: dragHandleProps.attributes,
                listeners: dragHandleProps.listeners,
              }
            : undefined
        }
        density={density}
      >
        {children}
      </DisclosureEntityCard>
    </div>
  )
}
