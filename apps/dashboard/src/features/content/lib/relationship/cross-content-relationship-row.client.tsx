'use client'

import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { DetailEntityRow } from '../detail/row/detail-entity-row.client'
import { detailEntityRowSubheadingVariants } from '../detail/row/detail-entity-row.variants'
import {
  DetailOverflowMenu,
  type DetailOverflowAction,
} from '../detail/row/detail-overflow-menu.client'

export type CrossContentRelationshipRowProps = {
  relationshipEyebrow?: ReactNode
  heading: ReactNode
  href?: string
  /** Muted classification text inline after the heading (includes leading ` · ` separator). */
  headingSuffix?: ReactNode
  /** @deprecated Use description — feature-supplied disambiguation only. */
  subheading?: ReactNode
  /** Feature-supplied disambiguation rendered below the heading row. */
  description?: ReactNode
  /** @deprecated Use status — trailing metadata such as badges. */
  metadata?: ReactNode
  /** Trailing metadata such as badges — maps to entity summary `status`. */
  status?: ReactNode
  /** @deprecated Use description */
  secondaryText?: ReactNode
  /** @deprecated Use status */
  badge?: ReactNode
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
  description,
  metadata,
  status,
  secondaryText,
  badge,
  actions = [],
  overflowTriggerLabel = 'Relationship actions',
  endSlot,
  className,
}: CrossContentRelationshipRowProps) {
  const resolvedDescription = description ?? secondaryText ?? subheading
  const resolvedStatus = status ?? badge ?? metadata
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
        subheading={resolvedDescription}
        metadata={resolvedStatus}
        endSlot={resolvedEndSlot}
      />
    </div>
  )
}
