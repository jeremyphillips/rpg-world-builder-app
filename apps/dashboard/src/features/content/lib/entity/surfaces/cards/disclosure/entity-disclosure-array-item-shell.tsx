import type { ArrayItemShellRenderProps } from '@rpg/ui/form'

import type { ReactElement } from 'react'

import type { EntitySummaryStatusItem } from '../../../summary/entity-summary-status.types'
import { DisclosureEntityCard } from './disclosure-entity-card'
import { projectArrayItemEntitySummary } from './array-item-entity-summary.lib'

export type EntityDisclosureArrayItemShellProps = ArrayItemShellRenderProps & {
  /** Optional metadata label mapped to EntitySummary.classification (muted · suffix). */
  classification?: string
  /** Entity summary status lane — availability badges and similar metadata. */
  status?: readonly EntitySummaryStatusItem[]
  /** Links the entity heading only — not whole-row/card navigation. */
  headingHref?: string
  /** Overrides default header.ariaLabel for disclosure controls. */
  toolbarAriaLabel?: string
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
  status,
  headingHref,
  toolbarAriaLabel,
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
    status,
  })

  return (
    <div data-array-item-prefix={itemPrefix}>
      <DisclosureEntityCard
        itemId={itemId}
        toolbarAriaLabel={toolbarAriaLabel ?? header.ariaLabel}
        entity={entity}
        headingHref={headingHref}
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
