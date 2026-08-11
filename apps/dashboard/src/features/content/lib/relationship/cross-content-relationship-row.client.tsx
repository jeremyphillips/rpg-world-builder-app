'use client'

import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { DetailEntityRow } from '../detail/row/detail-entity-row.client'
import type { EntityItemTrailing } from '../entity/entity-item-trailing.types'
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
   * - `EntityItemTrailing` — semantic trailing rail content
   */
  trailing?: EntityItemTrailing | null
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
  trailing,
  className,
}: CrossContentRelationshipRowProps) {
  const resolvedDescription = description ?? secondaryText ?? subheading
  const resolvedStatus = status ?? badge ?? metadata
  const resolvedTrailing =
    trailing !== undefined
      ? (trailing ?? undefined)
      : actions.length > 0
        ? {
            kind: 'action' as const,
            content: <DetailOverflowMenu actions={actions} triggerLabel={overflowTriggerLabel} />,
          }
        : undefined

  return (
    <div className={cn(className)}>
      {relationshipEyebrow ? (
        <p className={detailEntityRowSubheadingVariants()}>{relationshipEyebrow}</p>
      ) : null}
      <DetailEntityRow
        inset="parent"
        heading={heading}
        headingHref={href}
        headingSuffix={headingSuffix}
        subheading={resolvedDescription}
        metadata={resolvedStatus}
        trailing={resolvedTrailing}
      />
    </div>
  )
}
