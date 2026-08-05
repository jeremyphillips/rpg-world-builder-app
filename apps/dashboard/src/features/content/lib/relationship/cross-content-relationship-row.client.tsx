'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn, contentCardHeadingLinkVariants } from '@rpg/ui'

import {
  crossContentRelationshipRowContentVariants,
  crossContentRelationshipRowEyebrowVariants,
  crossContentRelationshipRowHeadingVariants,
  crossContentRelationshipRowSecondaryTextVariants,
  crossContentRelationshipRowVariants,
} from './cross-content-relationship-row.variants'
import {
  RelationshipOverflowMenu,
  type RelationshipOverflowAction,
} from './relationship-overflow-menu.client'

export type CrossContentRelationshipRowProps = {
  relationshipEyebrow?: ReactNode
  heading: ReactNode
  href?: string
  /** @deprecated Use secondaryText — feature-supplied disambiguation only. */
  subheading?: ReactNode
  secondaryText?: ReactNode
  metadata?: ReactNode
  actions?: readonly RelationshipOverflowAction[]
  overflowTriggerLabel?: string
  className?: string
}

export function CrossContentRelationshipRow({
  relationshipEyebrow,
  heading,
  href,
  subheading,
  secondaryText,
  metadata,
  actions = [],
  overflowTriggerLabel = 'Relationship actions',
  className,
}: CrossContentRelationshipRowProps) {
  const resolvedSecondaryText = secondaryText ?? subheading
  const resolvedHeading = href ? (
    <Link to={href} className={contentCardHeadingLinkVariants()}>
      {heading}
    </Link>
  ) : (
    heading
  )

  return (
    <article className={cn(crossContentRelationshipRowVariants(), className)}>
      <div className={crossContentRelationshipRowContentVariants()}>
        {relationshipEyebrow ? (
          <p className={crossContentRelationshipRowEyebrowVariants()}>{relationshipEyebrow}</p>
        ) : null}
        <p className={crossContentRelationshipRowHeadingVariants()}>{resolvedHeading}</p>
        {resolvedSecondaryText ? (
          <p className={crossContentRelationshipRowSecondaryTextVariants()}>
            {resolvedSecondaryText}
          </p>
        ) : null}
        {metadata ? (
          <div className={crossContentRelationshipRowSecondaryTextVariants()}>{metadata}</div>
        ) : null}
      </div>
      {actions.length > 0 ? (
        <RelationshipOverflowMenu actions={actions} triggerLabel={overflowTriggerLabel} />
      ) : null}
    </article>
  )
}
