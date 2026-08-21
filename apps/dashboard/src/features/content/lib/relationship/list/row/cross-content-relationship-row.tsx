import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { DetailEntityRow } from '../../../detail/row/entity/detail-entity-row'
import type { EntityAnatomyTrailing } from '../../../entity/anatomy/entity-anatomy-trailing.types'
import type { EntitySummaryStatusItem } from '../../../entity/summary/entity-summary-status.types'
import { detailEntityRowSubheadingVariants } from '../../../detail/row/entity/detail-entity-row.variants'
import { DetailOverflowMenu, type DetailOverflowAction } from '../../../detail/detail-overflow-menu'

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
  /** @deprecated Use status — entity summary status lane. */
  metadata?: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[]
  /** Entity summary status lane — badges, annotations, inactive markers. */
  status?: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[]
  /** @deprecated Use description */
  secondaryText?: ReactNode
  /** @deprecated Use status */
  badge?: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[]
  actions?: readonly DetailOverflowAction[]
  overflowTriggerLabel?: string
  /**
   * Trailing controls override.
   * - `undefined` — convenience overflow from `actions` when non-empty
   * - `null` — no trailing controls
   * - `EntityAnatomyTrailing` — semantic trailing rail content
   */
  trailing?: EntityAnatomyTrailing | null
  className?: string
}

function normalizeRelationshipStatus(
  status: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[] | undefined,
): EntitySummaryStatusItem | readonly EntitySummaryStatusItem[] | undefined {
  if (status == null) return undefined
  return status
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
  const resolvedStatus = normalizeRelationshipStatus(status ?? badge ?? metadata)
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
