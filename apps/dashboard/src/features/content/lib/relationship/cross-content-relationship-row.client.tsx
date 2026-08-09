'use client'

import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { DetailEntityRow } from '../detail/detail-entity-row.client'
import { detailEntityRowSubheadingVariants } from '../detail/detail-entity-row.variants'
import {
  DetailOverflowMenu,
  type DetailOverflowAction,
} from '../detail/detail-overflow-menu.client'

export type CrossContentRelationshipRowProps = {
  relationshipEyebrow?: ReactNode
  heading: ReactNode
  href?: string
  /** Muted classification text inline after the heading (includes leading ` · ` separator). */
  headingSuffix?: ReactNode
  /** @deprecated Use secondaryText — feature-supplied disambiguation only. */
  subheading?: ReactNode
  secondaryText?: ReactNode
  metadata?: ReactNode
  actions?: readonly DetailOverflowAction[]
  overflowTriggerLabel?: string
  /**
   * Trailing controls override.
   * - `undefined` — convenience overflow from `actions` when non-empty
   * - `null` — no trailing controls
   * - `ReactNode` — use as-is (compose via `DetailEntityRowActions` when needed)
   */
  endSlot?: ReactNode
  className?: string
}

export function CrossContentRelationshipRow({
  relationshipEyebrow,
  heading,
  href,
  headingSuffix,
  subheading,
  secondaryText,
  metadata,
  actions = [],
  overflowTriggerLabel = 'Relationship actions',
  endSlot,
  className,
}: CrossContentRelationshipRowProps) {
  const resolvedSecondaryText = secondaryText ?? subheading
  const resolvedEndSlot =
    endSlot !== undefined ? (
      endSlot
    ) : actions.length > 0 ? (
      <DetailOverflowMenu actions={actions} triggerLabel={overflowTriggerLabel} />
    ) : undefined

  return (
    <div className={cn(className)}>
      {relationshipEyebrow ? (
        <p className={detailEntityRowSubheadingVariants()}>{relationshipEyebrow}</p>
      ) : null}
      <DetailEntityRow
        inset="parent"
        heading={heading}
        href={href}
        headingSuffix={headingSuffix}
        subheading={resolvedSecondaryText}
        metadata={metadata}
        endSlot={resolvedEndSlot}
      />
    </div>
  )
}
